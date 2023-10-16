import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { AudioPlayerService } from 'src/app/services/audio-player.service';
import { HotspotAudiotext, HotspotService } from 'src/app/services/hotspot.service';
import { StreamState } from 'src/app/shared';

@Component({
  selector: 'app-audio-text',
  templateUrl: './audio-text.component.html',
  styleUrls: ['./audio-text.component.css']
})
export class AudioTextComponent implements OnInit, OnDestroy {

  private destroy = new Subject();
  hotspot?: HotspotAudiotext;
  state?: StreamState;

  constructor(
    private hotspotService: HotspotService,
    private audioPlayerService: AudioPlayerService
  ) {
    this.hotspotService.trigger
      .pipe(filter(h => h !== false && h.type === 4))
      .subscribe(hotspot => {
        if (hotspot && hotspot.type === 4) this.hotspot = hotspot;
      });
    this.audioPlayerService.getState().subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit() {
    this.audioPlayerService.stop();
    this.audioPlayerService.playStream('/assets/ice-crackling-loop-02.m4a')
      .pipe(takeUntil(this.destroy)).subscribe();
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
