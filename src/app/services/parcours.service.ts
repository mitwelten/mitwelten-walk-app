import { Injectable } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Position } from 'geojson';
import { BehaviorSubject, ReplaySubject, distinctUntilChanged, filter, map, retry, switchMap, tap, withLatestFrom } from 'rxjs';
import { Deployment, WalkPath } from '../shared';
import { parcours } from '../shared/map.data';
import { TrackRecorderService } from './track-recorder.service';
import distance from '@turf/distance';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DistanceWarningDialogComponent } from '../components/distance-warning-dialog.component';
import { ChoosePathComponent } from '../components/choose-path/choose-path.component';
import { AudioService } from './audio.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ParcoursService {

  /** GeolocationService, with error handling pipe */
  private _geolocation: GeolocationService

  /** Position of device */
  private trackerLocation: Position | undefined;
  private toggleSource?: BehaviorSubject<GeolocationService|ReplaySubject<GeolocationPosition>>;

  public selectedPathID = 1;
  public parcoursPath: Position[] = parcours;
  public parcoursPath$: BehaviorSubject<null> = new BehaviorSubject(null);
  public parcoursLength = 0;
  public closestPointOnParcours = new ReplaySubject<Position>(1);
  public location = new ReplaySubject<GeolocationPosition>(1);
  public progress = new ReplaySubject<number>(1);
  public distanceToPath = new ReplaySubject<number>(1);
  public active = new ReplaySubject<boolean>(1);
  public geolocationPaused = new BehaviorSubject<boolean>(false);
  public closeDeployments = new BehaviorSubject<(Deployment & { distance: number })[]>([]);
  private dialogRef?: MatDialogRef<DistanceWarningDialogComponent>;

  constructor(
    private readonly geolocation: GeolocationService,
    private trackRecorder: TrackRecorderService,
    private audioService: AudioService,
    private dataService: DataService,
    public dialog: MatDialog
  ) {
    this._geolocation = this.geolocation.pipe(
      tap({
        error: error => {
          console.error(error);
          /* this.dataService.postError({
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT,
          }); */
        }
      }),
      retry({ delay: 2000 })
    );
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.toggleSource?.next(this._geolocation);
    });
    this.setParcours();
    this.initGeoLocation();
    this.active.pipe(distinctUntilChanged()).subscribe(active => {
      if (active) this.dialogRef?.close();
      else this.dialogRef = this.dialog.open(DistanceWarningDialogComponent);
    })
  }

  public choosePath() {
    const dialogRef = this.dialog.open<ChoosePathComponent, any, WalkPath>(ChoosePathComponent);
    dialogRef.afterClosed().subscribe(v => {
      if (v !== undefined && v.path !== undefined) {
        this.selectedPathID = v.walk_id!;
        this.parcoursPath = v.path;
        this.parcoursPath$.next(null);
        this.setParcours();
      }
    })
  }

  /**
   * Estimate length of path by summing length of all segments in `this.parcoursPath`
   *
   * Ouput to `this.parcoursLength`
   */
  private setParcours() {
    // get length of path
    this.parcoursLength = 0;
    for (let i = 0; i < this.parcoursPath.length - 1; i++) {
      const start = this.parcoursPath[i];
      const end = this.parcoursPath[i + 1];
      this.parcoursLength += this.distance(start, end);
    }
  }

  /**
   * Create Observable that allows for the Location Service to be toggeled
   * between GeolocationService and TrackRecorder playback
   *
   * - Output: Location (`this.location`)
   * - Side-Effects:
   *   - `this.updateProjection`, calculate progress along path
   *   - `findCloseDeployments`, make a list of closest deployments
   */
  private initGeoLocation() {
    this.toggleSource = new BehaviorSubject(this._geolocation);
    this.toggleSource.pipe(
      switchMap(source => source),
      withLatestFrom(this.geolocationPaused),
      filter(([_, paused]) => !paused),
      map(([l, _]) => l),
      // tap(l => this.audioService.ping()),
      tap(l => this.trackRecorder.addPosition(l))
    ).subscribe({
      next: l => {
        // TODO: do something with the accuracy value (skip, or warn)
        this.updateProjection([l.coords.longitude, l.coords.latitude]);
        this.findCloseDeployments([l.coords.longitude, l.coords.latitude]); // TODO: check if logged in
        this.location.next(l);
      },
      error: error => {
        if (error instanceof GeolocationPositionError) {
          throw {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT,
          }
        } else { throw error }
      }
    });
    // switch between geolocation and playback
    this.trackRecorder.playbackOn.subscribe(state => {
      if (state) this.toggleSource?.next(this.trackRecorder.playback);
      else this.toggleSource?.next(this._geolocation);
    })
  }

  public overrideLocation(location: Position) {
    this.updateProjection(location);
  }

  /**
   * Estimate parcours progress and distance to path by projecting the current
   * geolocation of the device onto the path.
   *
   * Observable Outputs:
   * - `this.distanceToPath`: Distance to path in meters
   * - `this.progress`: Normalised progress
   * - `this.closestPointOnParcours`: Progress in meters
   * - `this.active`: Device geolocation in or out of focus of parcours
   *
   * @param location Current geolocation of device
   */
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

  /**
   * Euclidian (planar) distance between A and B
   *
   * @param a Geolocation A
   * @param b Geolocation B
   * @returns Planar distance between A and B
   */
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

  private findCloseDeployments(location: Position) {
    const closeDeployments = this.dataService.deployments.getValue()
      .map(d => Object.assign(d, { distance: distance([d.location.lon, d.location.lat], location, { units: 'meters' })}))
      .sort((a,b) => a.distance - b.distance)
      .slice(0, 10);
    this.closeDeployments.next(closeDeployments);
  }
}
