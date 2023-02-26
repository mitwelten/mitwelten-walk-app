import { Inject, Injectable } from '@angular/core';
import { GEOLOCATION, GEOLOCATION_SUPPORT, POSITION_OPTIONS } from '@ng-web-apis/geolocation';
import { finalize, Observable, shareReplay } from 'rxjs';

import { parseGPX, gpxData } from './gpx-playback';

@Injectable({
  providedIn: 'root'
})
export class GeolocationMockService extends Observable<Parameters<PositionCallback>[0]> {

  constructor(
      @Inject(GEOLOCATION) geolocationRef: Geolocation,
      @Inject(GEOLOCATION_SUPPORT) geolocationSupported: boolean,
      @Inject(POSITION_OPTIONS)
      positionOptions: PositionOptions,
  ) {
      let playbackTimer: number;
      const trackPoints = parseGPX(gpxData);
      trackPoints.sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });

      super(subscriber => {
        let currentIndex = 0;
        playbackTimer = window.setInterval(() => {
          if (currentIndex < trackPoints.length) {
            const position = trackPoints[currentIndex];
            const coord: GeolocationCoordinates  = {
                accuracy: 5 + Math.random() * 95,
                altitude: position.ele,
                altitudeAccuracy: null,
                heading: null,
                latitude: position.lat,
                longitude: position.lon,
                speed: null
            };
            const glp: GeolocationPosition = {
              coords: coord,
              timestamp: new Date(position.time).getTime()
            }
            subscriber.next(glp);
            currentIndex++;
          } else {
            window.clearInterval(playbackTimer);
          }
        }, 1000);
      });

      return this.pipe(
          finalize(() => window.clearInterval(playbackTimer)),
          shareReplay({ bufferSize: 1, refCount: true }),
      ) as GeolocationMockService;
  }
}
