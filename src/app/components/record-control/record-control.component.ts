import { Component, OnInit } from '@angular/core';
import { TrackRecorderService } from 'src/app/shared/track-recorder.service';

@Component({
  selector: 'app-record-control',
  template: `
    <div id="poscount">GPS Coords: {{ elems }}</div>
    <button (click)="trackRecorder.storeTrack()">store</button>
    <button (click)="trackRecorder.clearTrack()">clear</button>
  `,
  styles: [`
  #poscount {
    display: block;
    margin: 2px 4px;
    white-space: nowrap;
  }
  button {
    margin: 2px 4px;
  }
  :host {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    background-color: #fff;
    align-items: center;
  }
  `]
})
export class RecordControlComponent implements OnInit {

  public elems: number = 0;

  constructor(
    public trackRecorder: TrackRecorderService
  ) {}

  ngOnInit(): void {
    this.trackRecorder.track.subscribe(track => this.elems = track.length);
  }
}
