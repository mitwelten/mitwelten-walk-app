import { Component, ElementRef, ViewChild } from '@angular/core';
import { filter } from 'rxjs';
import { HotspotCommunity, HotspotService } from 'src/app/services/hotspot.service';
import { slideUpDownAnimation } from 'src/app/shared';

@Component({
  selector: 'app-community-hotspot',
  templateUrl: './community-hotspot.component.html',
  styleUrls: ['./community-hotspot.component.css'],
  animations: [slideUpDownAnimation]
})
export class CommunityHotspotComponent {

  hotspot?: HotspotCommunity;

  @ViewChild('wrapper')
  wrapper?: ElementRef<HTMLDivElement>;

  constructor(private hotspotService: HotspotService) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 5))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 5) this.hotspot = hotspot;
      })
  }

  swipeTransition(direction: 'left'|'right') {
    if (this.wrapper) {
      const imgs = this.wrapper.nativeElement.querySelectorAll('.carousel-image');
      let current: number|null = null;
      imgs.forEach(img => {
        if (this.isElementInViewport(img)) current = Number(img.id.substring(4));
      });
      if (current !== null) {
        let next: number;
        if (direction === 'right') next = (current+1)%imgs.length;
        else next = (((current-1)%imgs.length)+imgs.length)%imgs.length;
        imgs.forEach(img => {
          if (img.id === 'img-'+next) img.scrollIntoView({ behavior: 'smooth'});
        });
      }
    }
  }

  private isElementInViewport (el: any) {
    const rect = el.getBoundingClientRect();
    const condition =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth); /* or $(window).width() */
    return condition;
  }

}
