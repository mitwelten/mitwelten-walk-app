import { Injectable } from '@angular/core';
import { ReplaySubject, timestamp } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class TrackRecorderService {

  private _track: GeolocationPosition[];
  public position: ReplaySubject<GeolocationPosition>;
  public track: ReplaySubject<GeolocationPosition[]>;

  constructor() {
    this._track = [];
    this.position = new ReplaySubject();
    this.track = new ReplaySubject();
  }

  public addPosition(p: GeolocationPosition) {
    this._track.push(p);
    this.position.next(p);
    this.track.next(this._track);
  }

  public clearTrack() {
    this._track = [];
    this.track.next(this._track);
  }

  public storeTrack() {
    const trackJson = JSON.stringify(this._track.map(p => {
      return <GeolocationPosition> {
        coords: {
          accuracy: p.coords.accuracy,
          altitude: p.coords.altitude,
          altitudeAccuracy: p.coords.altitudeAccuracy,
          heading: p.coords.heading,
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          speed: p.coords.speed,
        },
        timestamp: p.timestamp
      };
    }), null, 2);

    const track = new Blob([trackJson], {type: 'application/json;charset=utf-8'})
    saveAs(track, 'gps-track.json');
  }
}
