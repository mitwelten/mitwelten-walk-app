import { Component, OnInit } from '@angular/core';
import { TrackRecorderService } from 'src/app/shared/track-recorder.service';

@Component({
  selector: 'app-record-control',
  template: `
    <div mat-menu-item disabled>GPS coordinates recorded: {{ elems }}</div>
    <button mat-menu-item (click)="trackRecorder.storeTrack()">
      <mat-icon color="accent" class="material-symbols-outlined">download</mat-icon>
      <span>Download GPS trace</span>
    </button>
    <button mat-menu-item (click)="trackRecorder.clearTrack()">
      <mat-icon color="accent" class="material-symbols-outlined">restart_alt</mat-icon>
      <span>Clear GPS trace</span>
    </button>
  `
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
