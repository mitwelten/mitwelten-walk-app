import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ParcoursService, TrackRecorderService } from 'src/app/services';
import { onMenuSlideToggle } from 'src/app/shared';

@Component({
  selector: 'app-record-control',
  template: `
    <div mat-menu-item (click)="onMenuSlideToggle(toggleLocationUpdate); $event.stopPropagation()">
      <mat-slide-toggle #toggleLocationUpdate (click)="$event.stopPropagation()"></mat-slide-toggle>
      <span>Update Location</span>
    </div>
    <div mat-menu-item disabled>GPS coordinates recorded: {{ elems }}</div>
    <button mat-menu-item (click)="trackRecorder.storeTrack()">
      <mat-icon color="accent" class="material-symbols-outlined">download</mat-icon>
      <span>Download GPS trace</span>
    </button>
    <button mat-menu-item (click)="trackRecorder.clearTrack()">
      <mat-icon color="accent" class="material-symbols-outlined">restart_alt</mat-icon>
      <span>Clear GPS trace</span>
    </button>
    <div mat-menu-item disabled>GPS trace playback</div>
    <button mat-menu-item (click)="fileInput.click()">
      <mat-icon color="accent" class="material-symbols-outlined">upload</mat-icon>
      <span>Load GPS trace</span>
    </button>
    <button mat-menu-item (click)="startPlayback()">
      <mat-icon color="accent" class="material-symbols-outlined">play_arrow</mat-icon>
      <span>Start Playback</span>
    </button>
    <button mat-menu-item (click)="stopPlayback()">
      <mat-icon color="accent" class="material-symbols-outlined">stop</mat-icon>
      <span>Stop Playback</span>
    </button>
    <input #fileInput type="file" style="display:none" (change)="handleFile()">
  `
})
export class RecordControlComponent implements OnInit {

  public elems: number = 0;

  @ViewChild('fileInput')
  fileInput?: ElementRef<HTMLInputElement>;

  @ViewChild('toggleLocationUpdate', { static: true })
  toggleLocationUpdate?: MatSlideToggle;

  constructor(
    public trackRecorder: TrackRecorderService,
    public parcoursService: ParcoursService,
  ) {}

  ngOnInit(): void {
    this.trackRecorder.track.subscribe(track => this.elems = track.length);
    this.parcoursService.geolocationPaused.subscribe(paused => {
      if (this.toggleLocationUpdate) {
        this.toggleLocationUpdate.checked = !paused;
      }
    });
    this.toggleLocationUpdate?.change.subscribe(checked => {
      this.parcoursService.geolocationPaused.next(!checked.checked);
    });
  }

  handleFile(){
    const reader = new FileReader();
    reader.onload = (ev) => {
      const track = <GeolocationPosition[]>JSON.parse(<string>ev.target?.result);
      this.trackRecorder.loadTrack(track);
    };
    if (this.fileInput?.nativeElement.files?.length) {
      reader.readAsText(this.fileInput?.nativeElement.files[0]);
    }
  }

  startPlayback() {
    this.trackRecorder.startPlayback();
  }

  stopPlayback() {
    this.trackRecorder.stopPlayback();
  }

  onMenuSlideToggle(slideToggle: MatSlideToggle) {
    onMenuSlideToggle(slideToggle);
  }
}
