import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChooseChannelComponent } from '../components/choose-channel/choose-channel.component';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(public dialog: MatDialog) { }

  public chooseChannel() {
    this.dialog.open<ChooseChannelComponent, any>(ChooseChannelComponent, {
      maxWidth: '90vw'
    });
  }
}
