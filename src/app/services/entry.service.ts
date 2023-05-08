import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapMouseEvent } from 'maplibre-gl';
import { BehaviorSubject } from 'rxjs';
import { EntryFormComponent } from '../components/entry-form/entry-form.component';
import { DataService } from './data.service';
import { Entry } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private _entries: Entry[] = [];
  public active = new BehaviorSubject(false);
  public entries = new BehaviorSubject<Entry[]>([]);

  constructor(
    private dialog: MatDialog,
    private dataService: DataService
  ) {
    this.dataService.listEntries().subscribe(entries => {
      this._entries = entries;
      this.entries.next(this._entries);
    });
  }

  public add(event: MapMouseEvent & Object) {
    if (this.active.getValue()) {
      const dialogRef = this.dialog.open(EntryFormComponent, { data: { event: event } });
      dialogRef.afterClosed().subscribe((result: { action: 'delete'|'edit', entry: Entry }) => {
        if (result && result.entry) {
          this._entries.push(result.entry);
          this.entries.next(this._entries);
        }
      });
    }
  }

  public edit(entry: Entry) {
    if (!this.active.getValue()) {
      const dialogRef = this.dialog.open(EntryFormComponent, { data: { entry: entry } });
      dialogRef.afterClosed().subscribe((result: { action: 'delete'|'edit', entry: Entry }) => {
        if (!result) return;
        this._entries = this._entries.filter(e => e.entry_id !== result.entry.entry_id);
        if (result.action === 'edit') this._entries.push(result.entry);
        this.entries.next(this._entries);
      });
    }
  }

  public toggle() {
    this.active.next(!this.active.getValue());
  }
}
