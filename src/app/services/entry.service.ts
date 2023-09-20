import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapMouseEvent } from 'maplibre-gl';
import { BehaviorSubject } from 'rxjs';
import { NoteFormComponent } from '../components/entry-form/entry-form.component';
import { DataService } from './data.service';
import { Note } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private _notes: Note[] = [];
  public active = new BehaviorSubject(false);
  public notes = new BehaviorSubject<Note[]>([]);

  constructor(
    private dialog: MatDialog,
    private dataService: DataService
  ) {
    this.dataService.listNotes().subscribe(notes => {
      this._notes = notes;
      this.notes.next(this._notes);
    });
  }

  public add(event: MapMouseEvent & Object) {
    if (this.active.getValue()) {
      const dialogRef = this.dialog.open(NoteFormComponent, { data: { event: event } });
      dialogRef.afterClosed().subscribe((result: { action: 'delete'|'edit', note: Note }) => {
        if (result && result.note) {
          this._notes.push(result.note);
          this.notes.next(this._notes);
        }
      });
    }
  }

  public edit(note: Note) {
    if (!this.active.getValue()) {
      const dialogRef = this.dialog.open(NoteFormComponent, { data: { note: note } });
      dialogRef.afterClosed().subscribe((result: { action: 'delete'|'edit', note: Note }) => {
        if (!result) return;
        this._notes = this._notes.filter(e => e.note_id !== result.note.note_id);
        if (result.action === 'edit') this._notes.push(result.note);
        this.notes.next(this._notes);
      });
    }
  }

  public toggle() {
    this.active.next(!this.active.getValue());
  }
}
