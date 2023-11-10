import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OidcService } from 'src/app/services';
import { AudioService } from 'src/app/services/audio.service';

@Component({
  selector: 'app-choose-channel',
  templateUrl: './choose-channel.component.html',
  styleUrls: ['./choose-channel.component.css']
})
export class ChooseChannelComponent implements OnInit {

  isLoggedIn = false;
  selection: number|null = null;

  pathMap = [
    '',
    'walk',
    'walk', // TODO: change to 'stopmotion' when ready (add to routes)
    'walk', // TODO: change to 'community' when ready (add to routes)
    'map',
    'walk', // TODO: change to 'audiowalk' when ready (add to routes)
  ]

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ChooseChannelComponent>,
    public authService: OidcService,
    private audioService: AudioService,
  ) {

  }

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(state => this.isLoggedIn = state);
    this.authService.checkLogin();
  }

  /**
   * Selects a channel (a.k.a. "Erlebnismodus") by its ID and navigates to the corresponding path.
   * If the audio service is not running, it starts it.
   * @param id The ID of the channel to select.
   */
  select(id: number) {
    this.audioService.running.getValue() || this.audioService.start();
    this.router.navigate([this.pathMap[id]]).then(() => {
      this.selection = id;
      this.dialogRef.close(this.selection);
    });
  }
}
