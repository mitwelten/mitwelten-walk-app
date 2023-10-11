import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { KeycloakProfile } from 'keycloak-js';
import { Deployment } from './shared';
import { DataService, NoteService, OidcService, ParcoursService, StateService, TrackRecorderService } from './services';
import pkgJson from '../../package.json';
import { AudioService } from './services/audio.service';
import { StackService } from './services/stack.service';
import { ChannelService } from './services/channel.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Mitwelten Walk';
  version = pkgJson.version;
  deployments: (Deployment & { distance: number })[] = [];
  showDeployments = false;
  isLoggedIn = false;
  userData?: KeycloakProfile;

  @ViewChild('toggleAddMarkers')
  private toggleAddMarkers!: MatSlideToggle;

  @ViewChild('toggleDebugView')
  private toggleDebugView!: MatSlideToggle;

  @ViewChild('instructionsDialog')
  private instructionsDialog?: TemplateRef<any>;

  constructor(
    public parcoursService: ParcoursService,
    public stackService: StackService,
    public channelService: ChannelService,
    public trackRecorder: TrackRecorderService,
    public audioService: AudioService,
    private noteService: NoteService,
    public dataService: DataService,
    public state: StateService,
    public authService: OidcService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(state => this.isLoggedIn = state);
    this.authService.userData().subscribe(profile => this.userData = profile);
    this.authService.checkLogin();
  }

  ngAfterViewInit() {
    this.noteService.active.subscribe(state => this.toggleAddMarkers.checked = state);
    this.toggleAddMarkers.change.subscribe(() => this.noteService.toggle());
    this.toggleDebugView.change.subscribe(state => this.state.setDebugView(state.checked));
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  openInstructions() {
    this.dialog.open(this.instructionsDialog!, {
      maxWidth: '90vw'
    });
  }

}
