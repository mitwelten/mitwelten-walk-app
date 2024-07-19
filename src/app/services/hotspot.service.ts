import { Component, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TriggerHotspotDialogComponent } from '../components/trigger-hotspot-dialog.component';
import { CoordinatePoint } from '../shared';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { ParcoursService } from './parcours.service';
import { DataService } from './data.service';
import { AudioService } from './audio.service';
import distance from '@turf/distance';

interface Hotspot {
  location: CoordinatePoint;
  viewtime?: number;
  lastTimestamp?: number;
  distanceTraveled?: number;
  lastLocation?: GeolocationCoordinates;
  subject?: string;
  id: number;
  type: number;
}
interface HotspotImage extends Hotspot {
  title: string;
  description: string;
}
export interface HotspotImageSingle extends HotspotImage {
  type: 1;
  url: string;
  credits: string;
}
export interface HotspotImageSequence extends HotspotImage {
  type: 2;
  sequence: Array<{
    url: string;
    credits: string;
  }>;
}
export interface HotspotInfotext extends Hotspot {
  type: 3;
  title: string;
  text: string;
}
export interface HotspotAudiotext extends Hotspot {
  type: 4;
  portraitUrl: string;
  audioUrl: string;
  speakerName?: string;
  speakerFunction?: string;
  contentSubject?: string;
}

export interface WildeNachbarnProperties {
  ID: number;
  Art: string;
  Beobachtungsart: string;
  Beobachtungstyp: string;
  Bemerkungen: string;
  Copyright: string;
  Datum: string;
  Zeitraum: string;
  Meldung: string;
  Artportraet?: string;
  weight: number;
  media: string[];
}
export interface HotspotCommunity extends Hotspot {
  type: 5;
  id: number;
  species: string;
  observation: string;
  observation_type: string;
  comment: string;
  copyright: string;
  date: string;
  time_range: string;
  post_url: string;
  portrait_url?: string;
  weight: number;
  media: string[];
}

export interface HotspotData extends Hotspot {
  type: 6;
  endpoint: string;
  title: string;
  text: string;
}
export type HotspotType = HotspotImageSingle|HotspotImageSequence|HotspotInfotext|HotspotAudiotext|HotspotData|HotspotCommunity;

export interface HotspotBarchartData {
  tag: string
  pax_avg: number
  pax_sdev: number
  pax_min: number
  pax_max: number
}

export interface HotspotHeatmapData {
  class: string;
  month: number;
  count: number;
}

export interface HotspotDataPayloadBase {
  chart: 'bar'|'heatmap';
  summaryOptions: Array<{
    label: string;
    value: number;
    checked: boolean;
}>
}

export interface HotspotDataBarPayload extends HotspotDataPayloadBase {
  chart: 'bar';
  datapoints: Array<HotspotBarchartData>;
}

export interface HotspotDataHeatmapPayload extends HotspotDataPayloadBase {
  chart: 'heatmap';
  datapoints: Array<HotspotHeatmapData>;
}

export type HotspotDataPayload = HotspotDataBarPayload | HotspotDataHeatmapPayload;

@Injectable({
  providedIn: 'root'
})
export class HotspotService {

  /* hotspot types
  0   reset / no type
  1   single image
  2   image sequence
  3   info text
  4   audio text
  5   data
  6   community image record
  */

  private hotspots: Array<HotspotType> = [];
  private currentHotspot: HotspotType | null = null;
  private typeFilter = new BehaviorSubject<number[]>([1,2,3,4,6]);
  private radius = new BehaviorSubject<number>(20.0);

  public trigger: BehaviorSubject<HotspotType|false>;
  public closeHotspots: BehaviorSubject<Array<HotspotType & { distance: number }>>;

  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private parcoursService: ParcoursService,
    private audioService: AudioService,
  ) {
    this.trigger = new BehaviorSubject<HotspotType|false>(false);
    this.closeHotspots = new BehaviorSubject<Array<HotspotType & { distance: number }>>([]);

    combineLatest([this.parcoursService.location, this.typeFilter, this.radius])
      .subscribe(([location, typeFilter, radius]) => {
      if (this.hotspots.length > 0) {
        const c = this.hotspots.filter(hotspot => {
          return typeFilter.includes(hotspot.type);
        }).map(hotspot => Object.assign(hotspot, { distance: distance(
          [hotspot.location.lon, hotspot.location.lat],
          [location.coords.longitude, location.coords.latitude],
          { units: 'meters' })
        })).sort((a,b) => a.distance - b.distance).slice(0, 10);

        if (this.currentHotspot) {
          // track time spent at hotspot
          this.currentHotspot.viewtime! += Date.now() - this.currentHotspot.lastTimestamp!;
          // track distance travelled for active hotspot
          this.currentHotspot.distanceTraveled! += distance([location.coords.longitude, location.coords.latitude], [this.currentHotspot.lastLocation!.longitude, this.currentHotspot.lastLocation!.latitude], { units: 'meters' });
        }

        // collect hotspots that are within radius
        const filtered = c.filter(h => h.distance <= radius);

        if (filtered.length) {
          // check if we're at the same hotspot as before
          if (this.currentHotspot && filtered.map(h => h.id).includes(this.currentHotspot.id)) {
            const i = filtered.map(h => h.id).indexOf(this.currentHotspot.id);
            // same hotspot as before: if viewtime or distance traveled is above threshold, trigger next hotspot
            if (this.currentHotspot.viewtime! > 30000 || this.currentHotspot.distanceTraveled! > 10) {
              // trigger next hotspot, update viewtime and distance traveled on current hotspot
              filtered[i].viewtime = this.currentHotspot.viewtime;
              filtered[i].distanceTraveled = this.currentHotspot.distanceTraveled;
            } else {
              this.updateHotspot(location);
              return; // do not trigger new hotspot
            }
          }

          // new hotspot
          if (filtered.length > 1) {
            /* // random selection of hotspot if multiple are within radius
            let random = Math.floor(Math.random() * filtered.length);
            let trial = filtered.length + 1;
            while (filtered[random].id === this.currentHotspot?.id && trial--) {
              random = Math.floor(Math.random() * filtered.length);
            }
            this.currentHotspot = filtered[random]; */

            // alternative: choose by metric: least viewed, least distance traveled
            // normalize viewtime and distance traveled
            const maxViewtime = Math.max(...filtered.map(h => h.viewtime || 0));
            const maxDistanceTraveled = Math.max(...filtered.map(h => h.distanceTraveled || 0));
            this.currentHotspot = filtered.map(h => {
              h.viewtime = maxViewtime && h.viewtime ? h.viewtime / maxViewtime : 0;
              h.distanceTraveled = maxDistanceTraveled && h.distanceTraveled ? h.distanceTraveled / maxDistanceTraveled : 0;
              return h;
            }).sort((a, b) => {
              const d_a = (a.viewtime!**2 + a.distanceTraveled!**2)**0.5;
              const d_b = (b.viewtime!**2 + b.distanceTraveled!**2)**0.5;
              return d_a - d_b;
            })[0];
          } else {
            this.currentHotspot = filtered[0];
          }

          this.currentHotspot.viewtime = this.currentHotspot.viewtime || 0;
          this.currentHotspot.distanceTraveled = this.currentHotspot.distanceTraveled || 0;
          this.updateHotspot(location);

          this.trigger.next(this.currentHotspot);
          this.audioService.ping();
        } else {
          this.trigger.next(false);
          this.currentHotspot = null;
        }
        this.closeHotspots.next(c);
      }
    })
  }

  set typeFilterValue(value: number[]) {
    this.typeFilter.next(value);
  }

  set radiusValue(value: number) {
    this.radius.next(value);
  }

  triggerById(id: number) {
    const hotspot = this.hotspots.find(h => h.id === id);
    if (hotspot) {
      this.trigger.next(hotspot);
    }
  }

  loadHotspots(mode: 'walk'|'community'|'audiowalk' = 'walk') {
    if (mode === 'walk') {
      this.dataService.getWalkHotspots(1).subscribe(hotspots => {
        this.hotspots = hotspots;
        this.typeFilter.next([1, 2, 3, 4, 6]);
        this.radius.next(20.0);
      });
      /* // if we want to load community hotspots as well
      this.dataService.getWalkHotspots(1).pipe(
        switchMap(hotspots => {
          return this.dataService.getCommunityHotspots().pipe(
            map(communityHotspots => {
              this.hotspots = hotspots.concat(communityHotspots);
          }))
      })).subscribe(); */
    } else if (mode === 'audiowalk') {
      this.dataService.getWalkHotspots(2).subscribe(hotspots => {
        this.hotspots = hotspots;
        this.typeFilter.next([4]);
        this.radius.next(40.0);
      });
    } else if (mode === 'community') {
      this.dataService.getCommunityHotspots().subscribe(hotspots => {
        this.hotspots = hotspots;
        this.typeFilter.next([5]);
        this.radius.next(20.0);
      });
    }
  }

  /** write back to hotspots array */
  private updateHotspot(location: GeolocationPosition) {
    if (!this.currentHotspot) return;
    this.currentHotspot.lastTimestamp = Date.now();
    this.currentHotspot.lastLocation = location.coords;
    const id = this.currentHotspot.id;
    const hotspot = this.hotspots.find(h => h.id === id);
    if (hotspot) {
      hotspot.lastTimestamp = this.currentHotspot.lastTimestamp;
      hotspot.lastLocation = this.currentHotspot.lastLocation;
      hotspot.viewtime = this.currentHotspot.viewtime;
      hotspot.distanceTraveled = this.currentHotspot.distanceTraveled;
    }
  }

  chooseHotspot() {
    this.dialog.open(TriggerHotspotDialogComponent).afterClosed().subscribe(
      (type: number) => {
        switch (type) {
          case 0:
            this.trigger.next(false);
            break;
          case 1:
            this.trigger.next({
              id: 43, type,
              location: { lat: 1, lon: 4},
              title: 'Single Image',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              url: '/assets/2990-0522_2023-05-15T11-00-08Z.jpg',
              credits: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod'
            })
            break;
          case 2:
            this.trigger.next({
              id: 42, type,
              location: { lat: 1, lon: 4},
              title: 'Image Sequence',
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              sequence: [
                { url: '/assets/img1.jpg', credits: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' },
                { url: '/assets/img2.jpg', credits: 'asdf' },
                { url: '/assets/img3.jpg', credits: 'asdf' },
                { url: '/assets/img4.jpg', credits: 'asdf' },
                { url: '/assets/img5.jpg', credits: 'asdf' },
              ]
            })
            break;
          case 3:
            this.trigger.next({
              id: 44, type,
              location: { lat: 1, lon: 4},
              title: 'Aufbau eines Auenwald-Ufers',
              text: 'Auenwälder befinden sich an Flussläufen und sind durch periodische Wasserstandschwankungen charakterisiert. Zudem kann man einen Auenwald in verschiedene Vegetationszonen einteilen - abhängig von der jeweiligen Entfernung zum Flussufer. Unmittelbar am Ufer befindet sich der Spülsaum mit sich kurzfristig ansiedelnden Pionierpflanzen. Landeinwärts folgt dann eine Zone mit niedrigen Weidengebüschen, die den mechanischen Belastungen des regelmässigen Hochwassers standhalten. Anschliessend beginnt der eigentliche Auenwald: Die Weichholz-Aue, welche regelmässig überschwemmt wird, beherbergt viele Weide- und Pappelarten. Die Hartholz-Aue, die nur noch selten überschwemmt wird, wird durch Baumarten mit hartem Holz charakterisiert, wie beispielsweise Ulmen, Eichen und Eschen. Zudem verleien viele Lianen der Hartholzaue eine Urwald-Charakter.',
            })
            break;
          case 4:
            this.trigger.next({
              id: 45, type,
              location: { lat: 1, lon: 4},
              portraitUrl: '/assets/audiotext-portrait-ai.jpg',
              audioUrl: '/assets/ice-crackling-loop-02.m4a',
              speakerName: 'Dr. Anna Ionescu',
              speakerFunction: 'Leiterin Forschung',
              contentSubject: 'Untersuchung der Auswirkungen von Klimawandel auf Biodiversität',
            })
            break;
          case 5:
            this.trigger.next({
              id: 87, type,
              location: { lat: 1, lon: 4},
              species: 'Biber',
              observation: 'Frasspur',
              observation_type: 'Zufallsbegegnung',
              comment: 'in der Nähe auch viele weitere neue Frassspuren',
              copyright: 'Wilde Nachbarn (wildenachbarn.ch)',
              date: '03.12.2016',
              time_range: '14.00 - 14.59',
              post_url: 'https://beidebasel.wildenachbarn.ch/beobachtung/50451',
              portrait_url: 'https://beidebasel.wildenachbarn.ch/artportraet/biber',
              weight: 1,
              media: [
                'https://beidebasel.wildenachbarn.ch/system/files/styles/beobachtungcolorbox_large/private/medien_zu_meldungen/7051/2018-09/DSCN1128%20-%20Arbeitskopie%202.jpg?itok=O5sTokIp',
                'https://beidebasel.wildenachbarn.ch/system/files/styles/beobachtungcolorbox_large/private/medien_zu_meldungen/7051/2018-09/DSCN1133.jpg?itok=kBf3rZ93',
                'https://beidebasel.wildenachbarn.ch/system/files/styles/beobachtungcolorbox_large/private/medien_zu_meldungen/7051/2018-09/DSCN1115.jpg?itok=dzRKC9tJ',
              ]
            })
            break;
          case 6:
            this.trigger.next({
              location: { lon: 0, lat: 0 },
              subject: 'test datahotspot heatmap',
              id: 124,
              type: 6,
              endpoint: 'pollinators?tag=136',
              title: 'Jahreszyklus der Morphospezies',
              text: 'Hier ist zwischen Standorten zu vergleichen wie sich das Vorkommen jeder Morphospezies über die Monate verteilt.'
            })
            break;
          /* case 6:
            this.trigger.next({
              location: { lon: 0, lat: 0 },
              subject: 'test datahotspot barchart',
              id: 123,
              type: 6,
              endpoint: 'pax?tag=136&tag=137',
              title: 'Anzahl Besucher:innen im Vergleich',
              text: 'Vergleiche den Tagesdurchschnitt der Anzahl Besucher:innen über drei Zeiträume am Erlebnisweiher und an der Trockenwiese.'
            })
            break; */

        }
      }
    )
  }
}
