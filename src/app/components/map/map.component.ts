import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Map, Marker, GeoJSONSource } from 'maplibre-gl';
import { Position } from 'geojson';
import { parcours } from './map.data';
import { CoordinatePoint } from '../../shared';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {

  map: Map | undefined;
  marker: Marker | undefined;
  tracker: Marker | undefined;
  trackerLocation: Position | undefined;
  trace: Position[] = [];
  parcoursPath: Position[] = parcours;
  parcoursLength = 0;
  parcoursProgress = 0;

  @Output()
  coordinatesSet = new EventEmitter<CoordinatePoint>;

  @Output()
  progressSet = new EventEmitter<number>;

  @Input()
  coordinates?: CoordinatePoint;

  @Input()
  readonly = true;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

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
      // style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json`,
      style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json`,
      // style: `https://api.maptiler.com/maps/basic-v2/style.json?key=KvRgWGYbyNZgzbSTt1ga`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      // transformRequest: function (url, resourceType) {
      //   return {
      //     url: url.concat('?ngsw-bypass=true'),
      //     // 'credentials': 'same-origin'
      //   }
      // }
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
        this.coordinatesSet.emit({lat: ll.lat, lon: ll.lng});
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
      this.parcoursProgress = (distanceAlongPath / this.parcoursLength);
      this.progressSet.emit(this.parcoursProgress);

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

  ngOnChanges(changes: SimpleChanges): void {
    if ('coordinates' in changes) {
      this.map?.setCenter(changes['coordinates'].currentValue)
      this.tracker?.setLngLat(changes['coordinates'].currentValue)
      this.updateProjection([changes['coordinates'].currentValue.lon, changes['coordinates'].currentValue.lat]);

      // draw track
      this.trace?.push([changes['coordinates'].currentValue.lon, changes['coordinates'].currentValue.lat]);
      const s = <GeoJSONSource>this.map?.getSource('route');
      if (s) s.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: this.trace
        }
      })
    }
  }

}
