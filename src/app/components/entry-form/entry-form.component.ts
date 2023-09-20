import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { MapMouseEvent } from 'maplibre-gl';
import { delayWhen,  timer, Observable, throwError, of } from 'rxjs';
import { mergeMap, map, retryWhen, take, tap, catchError } from 'rxjs/operators';
import { DataService } from 'src/app/services';
import { Note } from 'src/app/shared';


const genericRetryStrategy = ({
  maxRetryAttempts = 3, scalingDuration = 1000
}: {
  maxRetryAttempts?: number, scalingDuration?: number
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      if (retryAttempt > maxRetryAttempts) return throwError(error);
      return timer(retryAttempt * scalingDuration);
    })
  );
};

@Component({
  selector: 'app-note-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class NoteFormComponent {

  public locationLoading = false;

  public types = [
    'Media Content',
    'Note',
    'Other',
  ]

  public noteForm = new FormGroup({
    note_id:     new FormControl<number|null>(null, { nonNullable: false}),
    name:        new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    lng:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    lat:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    date:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    description: new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    type:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    tags:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
  });

  constructor(
    private dialogRef: MatDialogRef<NoteFormComponent, { action: 'delete'|'edit', note: Note }>,
    @Inject(MAT_DIALOG_DATA) public data: { event?: MapMouseEvent & Object, note?: Note },
    private geolocation: GeolocationService,
    private dataService: DataService,
    private snackBar: MatSnackBar,
  ) {
    if (data.event) {
      this.noteForm.patchValue(data.event.lngLat);
    }
    if (data.note) {
      this.noteForm.patchValue({
        date: data.note.date ?? new Date().toISOString(),
        note_id: data.note.note_id,
        name: data.note.name,
        description: data.note.description,
        type: data.note.type,
        lng: data.note.location.lon,
        lat: data.note.location.lat,
      });
    }
  }

  protected submit() {
    const v = this.noteForm.value;
    const note = {
      note_id: v.note_id ?? undefined,
      date: v.date ?? undefined,
      name: v.name,
      description: v.description ?? undefined,
      location: {
        lat: v.lat!,
        lon: v.lng!
      },
      type: v.type ?? undefined,
    };
    const request = v.note_id ? this.dataService.patchNote(note) : this.dataService.postNote(note);
    request.subscribe(note => {
      this.noteForm.reset();
      this.dialogRef.close({ action: 'edit', note: note });
    });
  }

  protected delete() {
    const note_id = this.noteForm.controls.note_id.value;
    if (note_id) this.dataService.deleteNote(note_id).subscribe(
        () => this.dialogRef.close({ action: 'delete', note: this.data.note! }));

  }

  public getLocation() {
    this.geolocation.pipe(
      tap(() => this.locationLoading = true),
      map(l => {
        if (l.coords.accuracy > 20) throw l;
        return l;
      }),
      retryWhen(genericRetryStrategy()),
      catchError((error: GeolocationPosition) => {
        this.snackBar.open(
          `Location accuracy is too low! (${error.coords.accuracy})`,
          'OK', { duration: 5000 })
        return of(error);
      }),
      tap(() => this.locationLoading = false),
      take(1))
      .subscribe((l: GeolocationPosition) => {
        this.noteForm.patchValue({
          lng: l.coords.longitude,
          lat: l.coords.latitude });
      });
  }

}
