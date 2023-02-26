import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MapComponent } from './components/map/map.component';
import { GeolocationService, POSITION_OPTIONS } from '@ng-web-apis/geolocation';
import { GeolocationMockService } from './testing/geolocation-mock.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: GeolocationService,
      useClass: GeolocationMockService
    },
    {
      provide: POSITION_OPTIONS,
      useValue: { enableHighAccuracy: true, timeout: 27000, maximumAge: 30000 },
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
