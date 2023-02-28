import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapMouseEvent } from 'maplibre-gl';
import { CoordinatePoint } from 'src/app/shared';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent {

  public displayCoordinates?: CoordinatePoint;

  public types = [
    'Media Content'
  ]

  public entryForm = new FormGroup({
    name:        new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    lng:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    lat:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    date:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    description: new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    type:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    tags:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
  });

  constructor(
    private dialogRef: MatDialogRef<EntryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MapMouseEvent & Object,
  ) {
    this.entryForm.controls.lng.setValue(data.lngLat.lng);
    this.entryForm.controls.lat.setValue(data.lngLat.lat);
    this.displayCoordinates = { lon: data.lngLat.lng, lat: data.lngLat.lat };
  }

  submit() {

  }

  cancel() {
    this.dialogRef.close(false);
  }

  getLocation() {

  }

  editCoordinates(event: Event) {

  }
}
