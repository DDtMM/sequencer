import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SequencerService } from '../../services/sequencer.service';
import { SongConfig } from '../../models/song.model';
import { TimelineComponent } from '../timeline/timeline.component';
import { LrAnalyzer } from '../lr-analyzer/lr-analyzer';

@Component({
  selector: 'app-player',
  imports: [TimelineComponent, RouterLink, LrAnalyzer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div class="max-w-7xl mx-auto">
        
        @if (song(); as currentSong) {
          <div class="mb-8">
            <div class="flex flex-row flex-wrap gap-x-3 gap-y-1 mb-2 ">
              <h1 class="text-5xl font-bold text-white mr-auto text-nowrap">
                {{ currentSong.title || 'Untitled' }}
              </h1>
              <a 
                routerLink="/"
                class="inline-flex whitespace-nowrap items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
              >
                <span class="text-xl">←</span> 
                <span>Back to Songs</span>
              </a>
            </div>
            <p class="text-xl text-blue-300">
              {{ currentSong.bpm }} BPM · {{ currentSong.beatsPerBar }}/4 Time

            </p>
          </div>

          <app-lr-analyzer />

          <div class="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-8">
            <div class="flex items-center gap-4 flex-wrap">
              <button
                (click)="togglePlayback()"
                class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
              >
                {{ sequencer.state().state === 'playing' ? '⏸ Pause' : '▶ Play' }}
              </button>

              <button
                (click)="stop()"
                class="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
              >
                ⏹ Stop
              </button>

              <label class="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="sequencer.state().isLooping"
                  (change)="toggleLoop($event)"
                  class="w-5 h-5"
                >
                <span class="text-lg">Loop</span>
              </label>

              <div class="ml-auto text-white">
                <span class="text-lg">
                  Beat: <span class="font-mono">{{ sequencer.state().currentBeat.toFixed(2) }}</span>
                  / <span class="font-mono">{{ sequencer.state().songLength.toFixed(2) }}</span>
                </span>
              </div>
            </div>
          </div>

          <app-timeline [song]="currentSong" [sequencerState]="sequencer.state()" />
        } @else if (loading()) {
          <div class="flex items-center justify-center h-64">
            <div class="text-white text-2xl">Loading song...</div>
          </div>
        } @else if (error()) {
          <div class="flex items-center justify-center h-64">
            <div class="text-red-400 text-2xl">{{ error() }}</div>
          </div>
        }
      </div>
    </div>
  `
})
export class PlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  sequencer = inject(SequencerService);

  song = signal<SongConfig | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    const songId = this.route.snapshot.paramMap.get('id');
    if (!songId) {
      this.error.set('No song ID provided');
      this.loading.set(false);
      return;
    }

    try {
      console.log('Loading song:', songId);
      const songData = await this.http.get<SongConfig>(`/songs/${songId}.json`).toPromise();
      if (!songData) {
        throw new Error('Failed to load song');
      }
      console.log('Song data loaded:', songData);
      this.song.set(songData);
      await this.sequencer.loadSong(songData);
      this.loading.set(false);
    } catch (err) {
      console.error('Error loading song:', err);
      this.error.set(`Failed to load song: ${err}`);
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.sequencer.cleanup();
  }

  togglePlayback() {
    if (this.sequencer.state().state === 'playing') {
      this.sequencer.pause();
    } else {
      this.sequencer.start();
    }
  }

  stop() {
    this.sequencer.stop();
  }

  toggleLoop(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.sequencer.setLooping(checked);
  }
}
