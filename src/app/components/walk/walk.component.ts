import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HotspotService, HotspotType } from 'src/app/services/hotspot.service';
import { hotspotCrossfadeAnimation } from 'src/app/shared';

@Component({
  selector: 'app-walk',
  templateUrl: './walk.component.html',
  styleUrls: ['./walk.component.css'],
  animations: [hotspotCrossfadeAnimation],
})
export class WalkComponent implements OnInit, OnDestroy {

  private destroy = new Subject();
  hotspot?: HotspotType|false;

  constructor(
    public hotspotService: HotspotService
  ) { }

  ngOnInit(): void {
    // "false" could be triggering a side effect to fade out audio, wait, then continue delivering "false"
    this.hotspotService.trigger
      .pipe(takeUntil(this.destroy))
      .subscribe(hotspot => this.hotspot = hotspot);
    this.hotspotService.loadHotspots();
  }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

}
