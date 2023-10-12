import { Component, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TriggerHotspotDialogComponent } from '../components/trigger-hotspot-dialog.component';
import { CoordinatePoint } from '../shared';
import { BehaviorSubject } from 'rxjs';

interface Hotspot {
  coordinates: CoordinatePoint;
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
}
export interface HotspotCommunity extends Hotspot {
  type: 5;
  dataUrl: string;
}
export interface HotspotData extends Hotspot {
  type: 6;
  endpoint: string;
  title: string;
  text: string;
}
export type HotspotType = HotspotImageSingle|HotspotImageSequence|HotspotInfotext|HotspotAudiotext|HotspotData;

@Injectable({
  providedIn: 'root'
})
export class HotspotService {

  private hotspots: Array<HotspotType> = [];

  public trigger: BehaviorSubject<HotspotType|false>;

  constructor(private dialog: MatDialog) {
    this.trigger = new BehaviorSubject<HotspotType|false>(false);
    this.hotspots.push({
      id: 42,
      coordinates: { lat: 1, lon: 4},
      type: 3,
      text: 'Lorem dolor sit amet. Lorem dolor sit amet. Lorem dolor sit amet. Lorem dolor sit amet.',
      title: 'Infotext Hotspot'
    });
  }

  chooseHotspot() {
    this.dialog.open(TriggerHotspotDialogComponent).afterClosed().subscribe(
      (type: number) => {
        switch (type) {
          case 2:
            this.trigger.next({
              id: 42, type,
              coordinates: { lat: 1, lon: 4},
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

            default:
            this.trigger.next(false);
            break;
        }
      }
    )
  }
}