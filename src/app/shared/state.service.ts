import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public debugView = new BehaviorSubject<boolean>(false);

  public setDebugView(state: boolean) {
    this.debugView.next(state);
  }
}
