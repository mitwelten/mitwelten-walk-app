import { Injectable } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Position } from 'geojson';
import { ReplaySubject, tap } from 'rxjs';
import { CoordinatePoint } from '../shared';
import { parcours } from '../shared/map.data';
import { TrackRecorderService } from './track-recorder.service';
import distance from '@turf/distance';

@Injectable({
  providedIn: 'root'
})
export class ParcoursService {

  private trackerLocation: Position | undefined; /** position of device */

  public parcoursPath: Position[] = parcours;
  public parcoursLength = 0;
  public closestPointOnParcours = new ReplaySubject<Position>(1);
  public trackerCoordinates = new ReplaySubject<CoordinatePoint>(1);
  public progress = new ReplaySubject<number>(1);
  public distanceToPath = new ReplaySubject<number>(1);
  public active = new ReplaySubject<boolean>(1);

  constructor(
    private readonly geolocation: GeolocationService,
    private trackRecorder: TrackRecorderService,
  ) {
    this.setParcours();
    this.initGeoLocation();
  }

  private setParcours() {
    // get length of path
    this.parcoursLength = 0;
    for (let i = 0; i < this.parcoursPath.length - 1; i++) {
      const start = this.parcoursPath[i];
      const end = this.parcoursPath[i + 1];
      this.parcoursLength += this.distance(start, end);
    }
  }

  private initGeoLocation() {
    this.geolocation.pipe(
      tap(l => this.trackRecorder.addPosition(l))
    ).subscribe({
      next: l => {
        // TODO: do something with the accuracy value (skip, or warn)
        this.trackerLocation = [l.coords.longitude, l.coords.latitude];
        this.updateProjection(this.trackerLocation);
        this.trackerCoordinates.next({ lon: l.coords.longitude, lat: l.coords.latitude })
      },
      error: e => console.warn(e)
    });
  }

  public overrideLocation(location: Position) {
    this.updateProjection(location);
  }

  private updateProjection(location: Position) {
    // Find the closest point on the path to the object
    let closestPoint: Position | undefined;
    let lastStartPoint: Position | undefined;
    let minDistance = Infinity;
    for (let i = 0; i < this.parcoursPath.length - 1; i++) {
      const start = this.parcoursPath[i];
      const end = this.parcoursPath[i + 1];
      const [p_dist, closest] = this.perpendicularDistance(location, start, end);
      if (p_dist < minDistance) {
        lastStartPoint = start;
        closestPoint = closest;
        minDistance = p_dist;
      }
    }
    /* const closeDeployments = this.deployments
      .map(d => Object.assign(d, { distance: distance([d.location.lon, d.location.lat], location, { units: 'meters' })}))
      .sort((a,b) => a.distance - b.distance)
      .slice(0, 10);
    this.closeDeployments.emit(closeDeployments); */
    const distantceSphericalMeters = distance(location, closestPoint!) * 1000;
    this.distanceToPath.next(distantceSphericalMeters);

    if(distantceSphericalMeters < 50) {
      // Calculate the distance along the path
      // from the starting point to the closest point
      let distanceAlongPath = 0;
      for (let i = 0; i < this.parcoursPath.length - 1; i++) {
        const start = this.parcoursPath[i];
        const end = this.parcoursPath[i + 1];
        if (closestPoint && lastStartPoint && start[0] === lastStartPoint[0] && start[1] === lastStartPoint[1]) {
          distanceAlongPath += this.distance(start, closestPoint);
          break;
        }
        distanceAlongPath += this.distance(start, end);
      }
      if (this.parcoursLength) {
        this.progress.next(Math.max(0, Math.min(1, distanceAlongPath / this.parcoursLength)));
      }
      if (closestPoint) {
        this.closestPointOnParcours.next(closestPoint);
      }
      this.active.next(true);
    } else {
      this.active.next(false);
    }
  }

  private distance(a: Position, b: Position): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  private perpendicularDistance(point: Position, start: Position, end: Position): [number, Position] {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const dot = dx * (point[0] - start[0]) + dy * (point[1] - start[1]);
    const len = dx * dx + dy * dy;
    const t = Math.min(1, Math.max(0, dot / len));
    const projectionX = start[0] + t * dx;
    const projectionY = start[1] + t * dy;
    return [this.distance(point, [projectionX, projectionY]), [projectionX, projectionY]];
  }
}
