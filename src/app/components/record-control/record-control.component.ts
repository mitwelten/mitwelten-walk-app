import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TrackRecorderService } from 'src/app/services';

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
    <div mat-menu-item disabled>GPS trace playback</div>
    <button mat-menu-item (click)="fileInput.click()">
      <mat-icon color="accent" class="material-symbols-outlined">upload</mat-icon>
      <span>Load GPS trace</span>
    </button>

    <input #fileInput type="file" style="display:none" (change)="handleFile()">
  `
})
export class RecordControlComponent implements OnInit {

  public elems: number = 0;

  @ViewChild('fileInput')
  fileInput?: ElementRef<HTMLInputElement>;

  constructor(
    public trackRecorder: TrackRecorderService
  ) {}

  ngOnInit(): void {
    this.trackRecorder.track.subscribe(track => this.elems = track.length);
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

}
