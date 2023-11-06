import { Component, OnDestroy } from '@angular/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { AudioPlayerService } from 'src/app/services/audio-player.service';
import { HotspotAudiotext, HotspotService } from 'src/app/services/hotspot.service';
import { StreamState } from 'src/app/shared';

@Component({
  selector: 'app-audio-text',
  templateUrl: './audio-text.component.html',
  styleUrls: ['./audio-text.component.css']
})
export class AudioTextComponent implements OnDestroy {

  private destroy = new Subject();
  hotspot?: HotspotAudiotext;
  state?: StreamState;

  constructor(
    private hotspotService: HotspotService,
    private audioPlayerService: AudioPlayerService
  ) {
    // maybe move all to ngOnInit()
    this.audioPlayerService.getState().subscribe(state => {
      this.state = state;
    });
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 4))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 4) {
          this.hotspot = hotspot;
          // maybe check if the same file is playing, otherwhis this.audioPlayerService.stop();
          this.audioPlayerService.playStream(this.hotspot.audioUrl)
            .pipe(takeUntil(this.destroy)).subscribe();
        };
      });
  }

  ngOnDestroy(): void {
    this.audioPlayerService.stop();
    this.destroy.next(null);
    this.destroy.complete();
  }

  play() {
    this.audioPlayerService.play();
  }

  pause() {
    this.audioPlayerService.pause();
  }

  skip(direction: 1|-1) {
    this.audioPlayerService.seekRelative(direction * 30);
  }

  rewind() {
    this.audioPlayerService.seekTo(0);
  }

}
