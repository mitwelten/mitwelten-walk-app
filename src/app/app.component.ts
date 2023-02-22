import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { CoordinatePoint } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Datawalk Prototype';
  location: CoordinatePoint;
  progress = 0;

  constructor(
    private readonly geolocation: GeolocationService,
  ) {
    this.location = { // reinacher heide
      lon: 7.609027254014222,
      lat: 47.506450512010844
    }
  }

  ngOnInit(): void {
    this.geolocation.pipe(
      // tap(l => console.dir(l))
      ).subscribe(l => {
        const loc: CoordinatePoint = { lon: l.coords.longitude, lat: l.coords.latitude}
        this.location = loc;
    });
    this.location = {
      lon: 7.609027254014222,
      lat: 47.506450512010844
    }

  }

  track(event: any) {
    console.log(event);

  }
}
