import { Component, ElementRef, ViewChild } from '@angular/core';
import { filter } from 'rxjs';
import { HotspotService, HotspotType } from 'src/app/services/hotspot.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent {

  hotspot?: HotspotType;

  images = [
    '/assets/img1.jpg',
    '/assets/img2.jpg',
    '/assets/img3.jpg',
    '/assets/img4.jpg',
    '/assets/img5.jpg',
    // ... add more image paths
  ];

  @ViewChild('wrapper')
  wrapper?: ElementRef<HTMLDivElement>;

  constructor(private hotspotService: HotspotService) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 2))
      .subscribe(hotspot => {
        if (hotspot) this.hotspot = hotspot;
        console.dir(hotspot);
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
