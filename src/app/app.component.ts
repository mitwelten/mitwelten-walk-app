import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { startWith, tap } from 'rxjs';
import { CoordinatePoint } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Datawalk Prototype';
  location?: CoordinatePoint;
  progress = 0;

  constructor(
    private readonly geolocation: GeolocationService,
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

  track(event: any) {
    console.log(event);

  }
}
