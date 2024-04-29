import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HotspotService } from '../services/hotspot.service';

@Component({
  selector: 'app-trigger-hotspot-dialog',
  template: `
    <h2 mat-dialog-title>Trigger Hotspots</h2>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput placeholder="Hotspot ID" #hotspotId (keyup.enter)="trigger(hotspotId.value)">
      </mat-form-field>

      <ul>
        <li><button mat-stroked-button color="primary" (click)="select(1)">Bild</button></li>
        <li><button mat-stroked-button color="primary" (click)="select(2)">Bildserie</button></li>
        <li><button mat-stroked-button color="primary" (click)="select(3)">Infotext</button></li>
        <li><button mat-stroked-button color="primary" (click)="select(4)">Audiotext</button></li>
        <li><button mat-stroked-button color="primary" (click)="select(5)">SWILD</button></li>
        <li><button mat-stroked-button color="primary" (click)="select(6)">Data</button></li>
        <li><button mat-stroked-button color="accent" (click)="select(0)">close hotspot</button></li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [`
    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    li {
      margin: 8px 0;
    }
  `]
})
export class TriggerHotspotDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TriggerHotspotDialogComponent>,
    private hotspotService: HotspotService,
  ) { }

  select(type: number) {
    this.dialogRef.close(type);
  }

  trigger(hotspotId: string) {
    this.hotspotService.triggerById(+hotspotId);
    this.dialogRef.close();
  }
}
