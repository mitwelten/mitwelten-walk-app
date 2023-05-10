import { Injectable } from '@angular/core';
import { context, start, Oscillator, Filter, Distortion, Reverb, AmplitudeEnvelope} from 'tone';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sonarEnv: AmplitudeEnvelope;
  private sonar: Oscillator;

  constructor() {
    this.sonar = new Oscillator(1024, 'sine').start();
    this.sonarEnv = new AmplitudeEnvelope({
      attack: 0.02,
      decay: 0.1,
      sustain: 0.2,
      release: 0.5
    });
    this.sonar.chain(
      this.sonarEnv,
      (new Distortion(0.8)),
      (new Filter(1024*1.5, 'lowpass')).toDestination(),
      (new Reverb(5)).toDestination());

    if (context.state !== 'running') start();
  }

  start() {
    if (context.state !== 'running') start();
    this.ping();
  }

  ping() {
    this.sonarEnv.triggerAttackRelease('16n');
  }
}
