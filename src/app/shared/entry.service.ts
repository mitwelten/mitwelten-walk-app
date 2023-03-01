import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapMouseEvent } from 'maplibre-gl';
import { BehaviorSubject } from 'rxjs';
import { EntryFormComponent } from '../components/entry-form/entry-form.component';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  public active = new BehaviorSubject(false);

  constructor(
    private dialog: MatDialog
  ) { }

  public add(data: MapMouseEvent & Object) {
    if (this.active.getValue()) {
      const dialogRef = this.dialog.open(EntryFormComponent, { data: data });
      dialogRef.afterClosed().subscribe(x => {
        console.dir(x);
      });
    }
  }

  public toggle() {
    this.active.next(!this.active.getValue());
  }
}
