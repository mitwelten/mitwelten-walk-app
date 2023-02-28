import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { startWith, tap } from 'rxjs';
import { CoordinatePoint } from './shared';
import { Deployment } from './shared/deployment.type';
import { TrackProgressService } from './shared/track-progress.service';
import { TrackRecorderService } from './shared/track-recorder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Datawalk Prototype';
  location?: CoordinatePoint;
  deployments: (Deployment & { distance: number })[] = [];

  constructor(
    private readonly geolocation: GeolocationService,
    public trackRecorder: TrackRecorderService,
    public trackProgress: TrackProgressService
  ) { }

  ngOnInit(): void {
    this.geolocation.pipe(
      startWith({ coords: { // reinacher heide
        longitude: 7.609027254014222,
        latitude: 47.506450512010844
      }})
      // tap(l => console.dir(l))
      ).subscribe(l => {
        const loc: CoordinatePoint = { lon: l.coords.longitude, lat: l.coords.latitude}
        this.location = loc;
    });
  }

}
