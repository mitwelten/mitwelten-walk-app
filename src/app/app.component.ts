import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { startWith, tap } from 'rxjs';
import { LoginComponent } from './components/login/login.component';
import { CoordinatePoint } from './shared';
import { AuthService } from './shared/auth.service';
import { Deployment } from './shared/deployment.type';
import { TrackProgressService } from './shared/track-progress.service';
import { TrackRecorderService } from './shared/track-recorder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Mitwelten Datawalk';
  location?: CoordinatePoint;
  deployments: (Deployment & { distance: number })[] = [];
  isLoggedIn = false;

  constructor(
    private readonly geolocation: GeolocationService,
    public trackRecorder: TrackRecorderService,
    public trackProgress: TrackProgressService,
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

  login() {
    this.dialog.open(LoginComponent);
  }

  logout() {
    this.authService.logout();
  }

}
