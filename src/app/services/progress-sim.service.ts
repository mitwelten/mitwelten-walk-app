import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ProgressSimService {

  public progress = new Subject<number>();
  private socket: Socket;

  constructor() {
    this.socket = io('http://zhdk.synack.ch:5042');
    this.socket.on('user-data', data => {
        this.progress.next(data)
    });
  }
}
