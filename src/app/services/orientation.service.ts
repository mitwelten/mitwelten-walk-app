import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrientationService {

  private resizeEvent: Observable<Event>;
  private orientationChangeEvent: Observable<Event>;
  public trigger: Observable<Event>;

  constructor() {
    this.resizeEvent = fromEvent(window, 'resize');
    this.orientationChangeEvent = fromEvent(window, 'orientationchange');
    this.trigger = merge(this.resizeEvent, this.orientationChangeEvent).pipe(debounceTime(10));
  }
}
