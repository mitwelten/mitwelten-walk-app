import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  public mode: 'walk'|'community'|'audiowalk' = 'walk';
  public hotspot?: HotspotType|false;

  constructor(
    public hotspotService: HotspotService,
    public route: ActivatedRoute,
  ) {
    const modes = ['walk', 'community', 'audiowalk'];
    if (modes.includes(this.route.snapshot.url[0].path)) {
      this.mode = this.route.snapshot.url[0].path as 'walk'|'community'|'audiowalk';
    } else {
      console.warn('Unknown mode, defaulting to "walk"');
    }
  }

  ngOnInit(): void {
    // "false" could be triggering a side effect to fade out audio, wait, then continue delivering "false"
    this.hotspotService.trigger
      .pipe(takeUntil(this.destroy))
      .subscribe(hotspot => this.hotspot = hotspot);
    this.hotspotService.loadHotspots(this.mode);
  }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

}
