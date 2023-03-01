import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { startWith, tap } from 'rxjs';
import { LoginComponent } from './components/login/login.component';
import { CoordinatePoint } from './shared';
import { AuthService } from './shared/auth.service';
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
  title = 'Mitwelten Datawalk';
  version = pkgJson.version;
  location?: CoordinatePoint;
  deployments: (Deployment & { distance: number })[] = [];
  isLoggedIn = false;

  @ViewChild('toggleAddMarkers')
  private toggleAddMarkers!: MatSlideToggle;

  constructor(
    private readonly geolocation: GeolocationService,
    public trackRecorder: TrackRecorderService,
    public trackProgress: TrackProgressService,
    private entryService: EntryService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(state => this.isLoggedIn = state);
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
    this.dialog.open(LoginComponent);
  }

  logout() {
    this.authService.logout();
  }

}
