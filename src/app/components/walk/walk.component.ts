import { Component, OnInit } from '@angular/core';
import { HotspotService, HotspotType } from 'src/app/services/hotspot.service';
import { hotspotCrossfadeAnimation } from 'src/app/shared';

@Component({
  selector: 'app-walk',
  templateUrl: './walk.component.html',
  styleUrls: ['./walk.component.css'],
  animations: [hotspotCrossfadeAnimation],
})
export class WalkComponent implements OnInit {

  hotspot?: HotspotType|false;

  constructor(
    private hotspotService: HotspotService
  ) { }

  ngOnInit(): void {
    // "false" could be triggering a side effect to fade out audio, wait, then continue delivering "false"
    this.hotspotService.trigger.subscribe(hotspot => this.hotspot = hotspot);
  }

}
