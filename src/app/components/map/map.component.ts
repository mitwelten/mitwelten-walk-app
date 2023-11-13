import {
  AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input,
  OnDestroy, Output, ViewChild
} from '@angular/core';
import { Map, Marker, GeoJSONSource, Popup } from 'maplibre-gl';
import { Feature, Position } from 'geojson';
import { DataService, NoteService, OidcService, ParcoursService, TrackRecorderService } from 'src/app/services';
import { CoordinatePoint, Deployment, MAP_STYLE_CONFIG } from 'src/app/shared';
import { map, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private map: Map | undefined;
  private markers: Marker[] = [];
  private tracker: Marker | undefined;
  private deployments: Deployment[] = [];
  private destroy = new Subject();

  /** Initial coordinates to center the map on */
  @Input()
  coordinates?: CoordinatePoint;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(
    @Inject(MAP_STYLE_CONFIG) private mapStyle: string,
    private parcoursService: ParcoursService,
    private trackRecorder: TrackRecorderService,
    private dataService: DataService,
    private authService: OidcService,
    private noteService: NoteService) {

      // draw track
      this.trackRecorder.track.pipe(
        takeUntil(this.destroy),
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
    this.destroy.next(null);
    this.destroy.complete();
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
        this.parcoursService.location.pipe(takeUntil(this.destroy)).subscribe(loc => {
          const coordinates = { lon: loc.coords.longitude, lat: loc.coords.latitude };
          this.map?.setCenter(coordinates);
          this.tracker?.setLngLat(coordinates);
        });
        this.parcoursService.closestPointOnParcours.pipe(takeUntil(this.destroy)).subscribe(pos => {
          const s = <GeoJSONSource>this.map?.getSource('projection');
          if (s) s.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: pos,
              type: 'Point'
          }});
        });
        this.parcoursService.parcoursPath$.pipe(takeUntil(this.destroy)).subscribe(() => {
          const p = <GeoJSONSource>this.map?.getSource('parcoursPath');
          if (p) p.setData({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: this.parcoursService.parcoursPath }
          });
        });

        this.authService.authStateSubject.pipe(
          takeUntil(this.destroy),
          switchMap(state => {
            if (state) return this.dataService.listDeployments();
            else return of([]);
        })).subscribe(deployments => {
          this.deployments = deployments;
          this.drawDepoyments(this.map!);
        });

        this.drawHotspots(this.map);
      };
    });

    this.map.on('click', ev => {
      this.noteService.add(ev);
    })

    this.noteService.notes.pipe(takeUntil(this.destroy)).subscribe(notes => {
      this.markers.forEach(m => m.remove());
      notes.filter(n => n.location !== undefined || n.location !== null)
        .forEach(m => {
        this.markers.push(new Marker({draggable: true, scale: 0.6})
          .setLngLat([m.location!.lon, m.location!.lat])
          .on('dragend', event => {
            const update = { note_id: m.note_id,
              location: { lon: event.target._lngLat.lng, lat: event.target._lngLat.lat }
            };
            this.dataService.patchNote(update).subscribe(() => m.location = update.location);
          })
          .setPopup(new Popup().on('open', () => this.noteService.edit(m)))
          .addTo(this.map!));
      })
    });

    this.tracker = new Marker({color: "#00FF00", draggable: true})
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map);

    this.tracker.on('drag', () => {
      const ll = this.tracker?.getLngLat();
      if (ll !== undefined) {
        this.parcoursService.overrideLocation([ll.lng, ll.lat]);
      }
    });
  }

  private drawHotspots(map: Map) {
    this.dataService.getWalkHotspots(1).subscribe(hotspots => {
      const radius = 20; // hotspot radius in meters
      const metersToPixelsAtMaxZoom = (meters:number, latitude:number) => meters / 0.075 / Math.cos(latitude * Math.PI / 180);
      const features = hotspots.map(h => {
        return <Feature>{
          type: 'Feature',
            properties: {
              description: h.subject,
              icon: 'music',
              type: h.type,
              // radius: metersToPixelsAtMaxZoom(20, 47.504038)
            },
            geometry: {
              type: 'Point',
              coordinates: [h.location.lon, h.location.lat]
            }
          }
      });
      const source = <GeoJSONSource>this.map?.getSource('hotspots');
      if (source) {
        source.setData({
            type: 'FeatureCollection',
            features: features
        });
      } else {
        map.addSource('hotspots', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features
          }
        });
        map.addLayer({
          id: 'hotspot-boundaries',
          type: 'circle',
          source: 'hotspots',
          paint: {
            'circle-radius': [
              // 'let', 'radius',
              // [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                // TODO: use radius from feature, find a way of making the below expression work
                0, 0, 20, metersToPixelsAtMaxZoom(radius, 47.504038)
                // according to docs, the below should work, but it doesn't
                // 0, 0, 20, ['var', 'radius']
              // ]
            ],
            'circle-color': '#f88',
            'circle-opacity': 0.2,
            'circle-stroke-color': '#f00',
            'circle-stroke-opacity': 0.5,
            'circle-stroke-width': 1
          }
        });
        map.addLayer({
          id: 'hotspots',
          type: 'symbol',
          source: 'hotspots',
          layout: {
            'icon-image': 'dot_circle_black_12',
            'icon-size': 1,
            'icon-allow-overlap': true,
            'icon-offset': [0, 0],
            'icon-rotate': 0,
            'icon-padding': 2,
            'icon-optional': false,
            'text-optional': false,
            'text-field': '{description}',
            'text-offset': [0.8, 0.1],
            'text-anchor': 'left',
            'text-font': ['Frutiger Neue Regular'],
            'text-justify': 'left',
            'text-size': 15,
          },
          paint: {
            'icon-color': '#ff0000',
            "icon-opacity": 0.8,
            'text-color': ['match', ['get', 'type'],
              1, '#ee8686', // 1 single image
              2, '#eab093', // 2 image sequence
              3, '#93c4f2', // 3 text
              4, '#a8c17c', // 4 audio
              5, '#f3e496', // 5 community
              6, '#b4a5f8', // 6 data
              '#000000'],
            'text-halo-color': '#000',
            'text-halo-width': 1,
            'text-halo-blur': 1,
          }
        });
      }
    });
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
    // draw path
    map.addSource('parcoursPath', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: this.parcoursService.parcoursPath }
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

}
