import { NgModule, isDevMode, LOCALE_ID, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MapComponent } from './components/map/map.component';
import { GeolocationService, POSITION_OPTIONS } from '@ng-web-apis/geolocation';
import { GeolocationMockService } from './testing/geolocation-mock.service';
import { SentryService } from './services/sentry.service';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { MAP_STYLE_CONFIG } from './shared/configuration';
import { RecordControlComponent } from './components/record-control/record-control.component';
import { LoginComponent } from './components/login/login.component';
import { EntryFormComponent } from './components/entry-form/entry-form.component';
import { InfoComponent } from './components/info/info.component';
import { StackFadeComponent } from './components/stack-fade/stack-fade.component';
import { DistanceWarningDialogComponent } from './components/distance-warning-dialog.component';
import { ChoosePathComponent } from './components/choose-path/choose-path.component';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import '@angular/common/locales/global/de';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.mitwelten.org/auth',
        realm: 'mitwelten',
        clientId: 'walk'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    RecordControlComponent,
    LoginComponent,
    EntryFormComponent,
    InfoComponent,
    StackFadeComponent,
    DistanceWarningDialogComponent,
    ChoosePathComponent,
  ],
  imports: [
    BrowserModule,
    KeycloakAngularModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MomentDateModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    // {
    //   provide: GeolocationService,
    //   useClass: GeolocationMockService
    // },
    {
      provide: POSITION_OPTIONS,
      useValue: { enableHighAccuracy: true, timeout: Infinity, maximumAge: 10000 },
    },
    {
      provide: MAP_STYLE_CONFIG,
      useValue: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json',
      // useValue: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json',
      // useValue: 'https://api.maptiler.com/maps/basic-v2/style.json?key=KvRgWGYbyNZgzbSTt1ga',
    },
    { provide: ErrorHandler, useClass: SentryService },
    { provide: LOCALE_ID, useValue: 'de-CH' },
    { provide: MAT_DATE_LOCALE, useValue: 'de' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [ MAT_DATE_LOCALE ] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
