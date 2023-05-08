import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrackProgressService {

  public progress = new ReplaySubject<number>(1);

  constructor() { }

  public setProgress(progress: number) {
    this.progress.next(Math.max(0, Math.min(1, progress)));
  }

}
