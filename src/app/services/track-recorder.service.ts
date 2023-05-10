import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, timestamp } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class TrackRecorderService {

  private _track: GeolocationPosition[];
  private _playbackTrack: GeolocationPosition[];

  public position: ReplaySubject<GeolocationPosition>;
  public track: ReplaySubject<GeolocationPosition[]>;
  public playback: ReplaySubject<GeolocationPosition>;
  public playbackOn: BehaviorSubject<boolean>;

  constructor() {
    this._track = [];
    this._playbackTrack = [];
    this.position = new ReplaySubject();
    this.track = new ReplaySubject();
    this.playback = new ReplaySubject(1);
    this.playbackOn = new BehaviorSubject(false);
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

  loadTrack(track: GeolocationPosition[]) {
    this._playbackTrack = track;
    this.track.next(track); // show track on load
  }

  startPlayback() {
    this.clearTrack(); // erase track to start recording the playback
    this.playbackOn.next(true);
    let i = 0;
    const schedule = () => {
      if (i < (this._playbackTrack.length-1) && this.playbackOn.getValue()) {
        const d = this._playbackTrack[i+1].timestamp - this._playbackTrack[i].timestamp;
        i++;
        setTimeout(schedule, d);
      }
      this.playback.next(this._playbackTrack[i])
    };
    schedule();
  }

  stopPlayback() {
    this.playbackOn.next(false);
  }
}
