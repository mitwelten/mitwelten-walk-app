import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OidcService } from 'src/app/services';

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
    'walk',
    'walk',
    'map',
  ]

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ChooseChannelComponent>,
    public authService: OidcService
  ) {

  }

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(state => this.isLoggedIn = state);
    this.authService.checkLogin();
  }

  select(id: number) {
    this.router.navigate([this.pathMap[id]]).then(() => {
      this.selection = id;
      this.dialogRef.close(this.selection);
    });
  }
}
