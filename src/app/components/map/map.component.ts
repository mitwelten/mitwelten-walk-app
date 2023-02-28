import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Map, Marker, GeoJSONSource } from 'maplibre-gl';
import { Position } from 'geojson';
import { parcours } from './map.data';
import { CoordinatePoint } from '../../shared';
import { TrackProgressService } from 'src/app/shared/track-progress.service';
import { TrackRecorderService } from 'src/app/shared/track-recorder.service';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { map, tap } from 'rxjs';
import { MAP_STYLE_CONFIG } from 'src/app/shared/configuration';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private map: Map | undefined;
  private marker: Marker | undefined;
  private tracker: Marker | undefined;
  private trackerLocation: Position | undefined;
  private parcoursPath: Position[] = parcours;
  private parcoursLength = 0;

  /** Initial coordinates to center the map on */
  @Input()
  coordinates?: CoordinatePoint;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    @Inject(MAP_STYLE_CONFIG) private mapStyle: string,
    private readonly geolocation: GeolocationService,
    private trackProgress: TrackProgressService,
    private trackRecorder: TrackRecorderService) {
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
      })
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
      };
    });

    this.marker = new Marker({color: "#FF0000", draggable: false})
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map);

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

  updateProjection(location: Position) {
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
      this.trackProgress.setProgress(distanceAlongPath / this.parcoursLength);

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

  setParcours(map: Map) {
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

  setTrace(map: Map) {
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
