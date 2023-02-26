import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrackProgressService {

  public progress = new BehaviorSubject(0);

  constructor() { }

  public setProgress(progress: number) {
    this.progress.next(progress);
  }

}
