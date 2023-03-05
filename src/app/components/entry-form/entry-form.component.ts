import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { MapMouseEvent } from 'maplibre-gl';
import { delayWhen,  timer, Observable, throwError, of } from 'rxjs';
import { mergeMap, map, retryWhen, take, tap, catchError } from 'rxjs/operators';
import { DataService, Entry } from 'src/app/shared';


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
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent {

  public locationLoading = false;

  public types = [
    'Media Content',
    'Note',
    'Other',
  ]

  public entryForm = new FormGroup({
    entry_id:    new FormControl<number|null>(null, { nonNullable: false}),
    name:        new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    lng:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    lat:         new FormControl<number>(0,  { validators: [Validators.required], nonNullable: true}),
    date:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    description: new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    type:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
    tags:        new FormControl<string|null>(null, { validators: [], nonNullable: false}),
  });

  constructor(
    private dialogRef: MatDialogRef<EntryFormComponent, { action: 'delete'|'edit', entry: Entry }>,
    @Inject(MAT_DIALOG_DATA) public data: { event?: MapMouseEvent & Object, entry?: Entry },
    private geolocation: GeolocationService,
    private dataService: DataService,
    private snackBar: MatSnackBar,
  ) {
    if (data.event) {
      this.entryForm.patchValue(data.event.lngLat);
    }
    if (data.entry) {
      this.entryForm.patchValue({
        date: data.entry.date ?? new Date().toISOString(),
        entry_id: data.entry.entry_id,
        name: data.entry.name,
        description: data.entry.description,
        type: data.entry.type,
        lng: data.entry.location.lon,
        lat: data.entry.location.lat,
      });
    }
  }

  protected submit() {
    const v = this.entryForm.value;
    const entry = {
      entry_id: v.entry_id ?? undefined,
      date: v.date ?? undefined,
      name: v.name,
      description: v.description ?? undefined,
      location: {
        lat: v.lat!,
        lon: v.lng!
      },
      type: v.type ?? undefined,
    };
    const request = v.entry_id ? this.dataService.patchEntry(entry) : this.dataService.postEntry(entry);
    request.subscribe(entry => {
      this.entryForm.reset();
      this.dialogRef.close({ action: 'edit', entry: entry });
    });
  }

  protected delete() {
    const entry_id = this.entryForm.controls.entry_id.value;
    if (entry_id) this.dataService.deleteEntry(entry_id).subscribe(
        () => this.dialogRef.close({ action: 'delete', entry: this.data.entry! }));

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
        this.entryForm.patchValue({
          lng: l.coords.longitude,
          lat: l.coords.latitude });
      });
  }

}
