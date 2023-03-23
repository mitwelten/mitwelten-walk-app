import {
  AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input,
  OnDestroy, Output, ViewChild
} from '@angular/core';
import { Map, Marker, GeoJSONSource, Popup } from 'maplibre-gl';
import { Feature, Position } from 'geojson';
import { parcours } from './map.data';
import { CoordinatePoint, DataService } from '../../shared';
import distance from '@turf/distance';
import { TrackProgressService } from 'src/app/shared/track-progress.service';
import { TrackRecorderService } from 'src/app/shared/track-recorder.service';
import { OidcService } from 'src/app/shared/oidc.service';
import { EntryService } from 'src/app/shared/entry.service';
import { Deployment } from 'src/app/shared/deployment.type';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { map, of, switchMap, tap } from 'rxjs';
import { MAP_STYLE_CONFIG } from 'src/app/shared/configuration';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private map: Map | undefined;
  private markers: Marker[] = [];
  private tracker: Marker | undefined;
  private trackerLocation: Position | undefined;
  private parcoursPath: Position[] = parcours;
  private parcoursLength = 0;
  private deployments: Deployment[] = [];

  @Output()
  public closeDeployments = new EventEmitter<(Deployment & { distance: number })[]>;

  /** Initial coordinates to center the map on */
  @Input()
  coordinates?: CoordinatePoint;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    @Inject(MAP_STYLE_CONFIG) private mapStyle: string,
    private readonly geolocation: GeolocationService,
    private trackProgress: TrackProgressService,
    private trackRecorder: TrackRecorderService,
    private dataService: DataService,
    private authService: OidcService,
    private entryService: EntryService) {

      // draw track
      this.trackRecorder.track.pipe(
        map(track => track.map(p => <Position>[p.coords.longitude, p.coords.latitude])))
      .subscribe(track => {
        const s = <GeoJSONSource>this.map?.getSource('route');
        if (s) s.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: track
          }
        })
      });
    }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  ngAfterViewInit(): void {
    let initialState = { lng: 7.614704694445322, lat: 47.53603016174955, zoom: 16 }
    if (this.coordinates) {
      initialState = Object.assign(initialState, { lng: this.coordinates.lon, lat: this.coordinates.lat });
    }

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.mapStyle,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    this.map.on('load', (e) => {
      if (this.map) {
        this.setParcours(this.map);
        this.setTrace(this.map);
        this.initGeoLocation();

        this.authService.authStateSubject.pipe(switchMap(state => {
          if (state) return this.dataService.listDeployments();
          else return of([]);
        })).subscribe(deployments => {
          this.deployments = deployments;
          this.drawDepoyments(this.map!);
        });
      };
    });

    this.map.on('click', ev => {
      this.entryService.add(ev);
    })

    this.entryService.entries.subscribe(entries => {
      this.markers.forEach(m => m.remove());
      entries.forEach(m => {
        this.markers.push(new Marker({draggable: true, scale: 0.6})
          .setLngLat([m.location.lon, m.location.lat])
          .on('dragend', event => {
            const update = { entry_id: m.entry_id,
              location: { lon: event.target._lngLat.lng, lat: event.target._lngLat.lat }
            };
            this.dataService.patchEntry(update).subscribe(() => m.location = update.location);
          })
          .setPopup(new Popup().on('open', () => this.entryService.edit(m)))
          .addTo(this.map!));
      })
    });

    this.tracker = new Marker({color: "#00FF00", draggable: true})
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map);

    this.tracker.on('drag', () => {
      const ll = this.tracker?.getLngLat();
      if (ll !== undefined) {
        this.trackerLocation = [ll.lng, ll.lat];
        this.updateProjection(this.trackerLocation);
      }
    });
  }

  private initGeoLocation() {
    this.geolocation.pipe(
      tap(l => this.trackRecorder.addPosition(l))
    ).subscribe({
      next: l => {
        const loc: CoordinatePoint = { lon: l.coords.longitude, lat: l.coords.latitude}
        // TODO: do something with the accuracy value (skip, or warn)
        this.trackerLocation = [l.coords.longitude, l.coords.latitude];
        this.updateProjection(this.trackerLocation);
        this.map?.setCenter(loc);
        this.tracker?.setLngLat(loc); // TODO: does this trigger 'on drag'?
      },
      error: e => console.warn(e)
    });
  }

  private updateProjection(location: Position) {
    // Find the closest point on the path to the object
    let closestPoint: Position | undefined;
    let lastStartPoint: Position | undefined;
    let minDistance = Infinity;
    for (let i = 0; i < this.parcoursPath.length - 1; i++) {
      const start = this.parcoursPath[i];
      const end = this.parcoursPath[i + 1];
      const [distance, closest] = this.perpendicularDistance(location, start, end);
      if (distance < minDistance) {
        lastStartPoint = start;
        closestPoint = closest;
        minDistance = distance;
      }
    }
    const closeDeployments = this.deployments
      .map(d => Object.assign(d, { distance: distance([d.location.lon, d.location.lat], location, { units: 'meters' })}))
      .sort((a,b) => a.distance - b.distance)
      .slice(0, 10);
    this.closeDeployments.emit(closeDeployments);

    if(minDistance < 0.0016477864372379668) {
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
        this.trackProgress.setProgress(distanceAlongPath / this.parcoursLength);
      }

      if (closestPoint) {
        const s = <GeoJSONSource>this.map?.getSource('projection');
        if (s) s.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: closestPoint,
            type: 'Point'
        }});
      }
    } else {
      console.error('too far away from parcours');
    }
  }

  private drawDepoyments(map: Map) {
    const features = this.deployments.map(d => {
      return <Feature>{
        type: 'Feature',
        properties: { title: d.node.node_label, data: d.description },
        geometry: { type: 'Point', coordinates: [d.location.lon, d.location.lat] }
      }
    });
    const source = <GeoJSONSource>this.map?.getSource('deployments');
    if (source) {
      source.setData({
          type: 'FeatureCollection',
          features: features
      })
    } else {
      map.addSource('deployments', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      });
      map.addLayer({
        id: 'deployments',
        type: 'circle',
        source: 'deployments',
        layout: { },
        paint: {
          'circle-radius': 5,
          'circle-color': '#fff',
          'circle-opacity': 0.6,
          'circle-stroke-color': '#B42222',
          'circle-stroke-opacity': 0.9,
          'circle-stroke-width': 1
        }
      });
    }
  }

  private setParcours(map: Map) {
    // get length of path
    this.parcoursLength = 0;
    for (let i = 0; i < this.parcoursPath.length - 1; i++) {
      const start = this.parcoursPath[i];
      const end = this.parcoursPath[i + 1];
      this.parcoursLength += this.distance(start, end);
    }
    // draw path
    map.addSource('parcoursPath', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: this.parcoursPath }
      }
    });
    // draw point of progress
    map.addSource('projection', {
      type: 'geojson',
      data: {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [ 7.605920941092933, 47.49513398377948 ],
            type: 'Point'
          }
      }
    });
    map.addLayer({
      id: 'parcoursPath',
      type: 'line',
      source: 'parcoursPath',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#c37',
        'line-width': 10,
        'line-opacity': 0.58,
      }
    });
    map.addLayer({
      id: 'projection',
      type: 'circle',
      source: 'projection',
      paint: {
        'circle-radius': 8,
        'circle-color': '#fff',
        'circle-opacity': 0.4,
        'circle-stroke-color': '#22B422',
        'circle-stroke-opacity': 0.8,
        'circle-stroke-width': 2
      }
    });
  }

  private setTrace(map: Map) {
    map.addSource('route', {
     'type': 'geojson',
     'data': {
       'type': 'Feature',
       'properties': {},
       'geometry': {
         'type': 'LineString',
         'coordinates': [
           [7.614704694445322, 47.53603016174955]
         ]
       }
     }
   });
   map.addLayer({
     'id': 'route',
     'type': 'line',
     'source': 'route',
     'layout': {
       'line-join': 'round',
       'line-cap': 'round'
     },
     'paint': {
       'line-color': '#faa',
       'line-width': 8,
       'line-opacity': 0.5,
     }
   });
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
