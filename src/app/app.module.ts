import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MapComponent } from './components/map/map.component';
import { GeolocationService, POSITION_OPTIONS } from '@ng-web-apis/geolocation';
import { GeolocationMockService } from './testing/geolocation-mock.service';
import { AuthInterceptor } from './shared/auth.interceptor';
import { MAP_STYLE_CONFIG } from './shared/configuration';
import { RecordControlComponent } from './components/record-control/record-control.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    RecordControlComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    // {
    //   provide: GeolocationService,
    //   useClass: GeolocationMockService
    // },
    {
      provide: POSITION_OPTIONS,
      useValue: { enableHighAccuracy: true, timeout: 27000, maximumAge: 30000 },
    },
    {
      provide: MAP_STYLE_CONFIG,
      useValue: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json',
      // useValue: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json',
      // useValue: 'https://api.maptiler.com/maps/basic-v2/style.json?key=KvRgWGYbyNZgzbSTt1ga',
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
