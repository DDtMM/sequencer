import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SongInfo {
  id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl font-bold text-white mb-4 text-center">
          🎵 Sequencer
        </h1>
        <p class="text-xl text-blue-200 mb-12 text-center">
          A ToneJS-powered music sequencer built with Angular 21
        </p>
        
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (song of songs; track song.id) {
            <a 
              [routerLink]="['/play', song.id]"
              class="block p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <h2 class="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {{ song.title }}
              </h2>
              <p class="text-blue-200">
                {{ song.description }}
              </p>
              <div class="mt-4 flex items-center text-blue-300 group-hover:text-white transition-colors">
                <span>Play →</span>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  songs: SongInfo[] = [
    {
      id: 'simple-melody',
      title: 'Simple Melody',
      description: 'A basic melodic pattern with sine wave synthesis'
    },
    {
      id: 'multi-instrument',
      title: 'Multi-Instrument Groove',
      description: 'Bass, lead, and pad with effects chains'
    },
    {
      id: 'nested-patterns',
      title: 'Nested Patterns Demo',
      description: 'Demonstrates pattern composition with StartPattern events'
    },
    {
      id: 'waltz-3-4',
      title: 'Waltz (3/4)',
      description: 'A simple waltz rhythm with melody and bass'
    },
    {
      id: 'percussion-impact',
      title: 'Percussion Impact',
      description: 'High-energy 64-beat track with 6 percussive instruments and dynamic build-up'
    }
  ];
}
