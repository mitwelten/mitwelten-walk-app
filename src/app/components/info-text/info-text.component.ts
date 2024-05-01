import { Component } from '@angular/core';
import { filter } from 'rxjs';
import { HotspotInfotext, HotspotService } from 'src/app/services/hotspot.service';

/**
 * Represents the InfoTextComponent which renders the contents of
 * of hotspots of type HotspotInfotext, displaying text information.
 *
 * This corresponds to hotspot type 3.
 */
@Component({
  selector: 'app-info-text',
  templateUrl: './info-text.component.html',
  styleUrls: ['./info-text.component.css']
})
export class InfoTextComponent {

  hotspot?: HotspotInfotext;

  constructor(private hotspotService: HotspotService) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 3))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 3) this.hotspot = hotspot;
      })
  }

}
