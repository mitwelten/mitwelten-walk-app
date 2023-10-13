import { Component } from '@angular/core';
import { fadeInOutAnimation } from '../carousel/carousel.component';
import { HotspotImageSingle, HotspotService } from 'src/app/services/hotspot.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-single-image',
  templateUrl: './single-image.component.html',
  styleUrls: ['./single-image.component.css'],
  animations: [fadeInOutAnimation]
})
export class SingleImageComponent {

  hotspot?: HotspotImageSingle;

  constructor(private hotspotService: HotspotService) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 1))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 1) this.hotspot = hotspot;
      })
  }
}
