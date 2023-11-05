import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { context, start, Gain, Oscillator, Filter, Distortion, Reverb, AmplitudeEnvelope} from 'tone';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sonarEnv: AmplitudeEnvelope;
  private sonar: Oscillator;
  private master: Gain;

  public running: BehaviorSubject<boolean>;

  constructor() {
    this.running = new BehaviorSubject(false);
    this.master = new Gain(1).toDestination();
    this.sonar = new Oscillator(1024, 'sine');
    this.sonarEnv = new AmplitudeEnvelope({
      attack: 0.02,
      decay: 0.1,
      sustain: 0.2,
      release: 0.5
    });
    this.sonar.chain(
      this.sonarEnv,
      (new Distortion(0.8)),
      (new Filter(1024*1.5, 'lowpass')).connect(this.master),
      (new Reverb(5)),
      this.master);
  }

  start() {
    start().then(
      () => {
        this.sonar.start();
        this.running.next(true);
        this.master.gain.rampTo(1, 0);
        this.ping();
    }).catch(e => {
      console.warn(e);
    });
  }

  toggle() {
    if (this.running.getValue()) {
      this.running.next(false);
      this.master.gain.rampTo(0, 0.2);
    } else {
      if (context.state !== 'running') {
        this.start();
      } else {
        this.running.next(true);
        this.master.gain.rampTo(1, 0);
        this.ping();
      }
    }
  }

  ping() {
    this.sonarEnv.triggerAttackRelease('16n');
  }
}
