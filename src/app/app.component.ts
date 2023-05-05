import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { startWith } from 'rxjs';
import { CoordinatePoint, DataService } from './shared';
import { OidcService } from './shared/oidc.service';
import { KeycloakProfile } from 'keycloak-js';
import { Deployment } from './shared/deployment.type';
import { EntryService } from './shared/entry.service';
import { TrackProgressService } from './shared/track-progress.service';
import { TrackRecorderService } from './shared/track-recorder.service';
import pkgJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Mitwelten Walk';
  version = pkgJson.version;
  location?: CoordinatePoint;
  deployments: (Deployment & { distance: number })[] = [];
  isLoggedIn = false;
  userData?: KeycloakProfile;

  @ViewChild('toggleAddMarkers')
  private toggleAddMarkers!: MatSlideToggle;

  constructor(
    private readonly geolocation: GeolocationService,
    public trackRecorder: TrackRecorderService,
    public trackProgress: TrackProgressService,
    private entryService: EntryService,
    public dataService: DataService,
    public authService: OidcService,
  ) { }

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(state => this.isLoggedIn = state);
    this.authService.userData().subscribe(profile => this.userData = profile);
    this.authService.checkLogin();

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

  ngAfterViewInit() {
    this.entryService.active.subscribe(state => this.toggleAddMarkers.checked = state);
    this.toggleAddMarkers.change.subscribe(() => this.entryService.toggle());
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

}
