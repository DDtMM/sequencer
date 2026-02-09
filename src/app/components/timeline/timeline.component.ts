import { Component, ChangeDetectionStrategy, input, computed, effect, viewChild, ElementRef } from '@angular/core';
import { SongConfig, } from '../../models/song.model';
import { NoteOnEvent, NoteOffEvent, PatternOnEvent, PatternOffEvent } from '../../models/events.model';
import { SequencerState } from '../../services/sequencer.service';

interface VisualEvent {
  type: 'instrument' | 'pattern';
  instrumentId?: string;
  patternId?: string;
  channelId: string;
  startBeat: number;
  duration: number;
  color: string;
  note: string;
  isNested?: boolean;
}

@Component({
  selector: 'app-timeline',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timeline.component.html',

  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TimelineComponent {
  readonly song = input.required<SongConfig>();
  readonly sequencerState = input.required<SequencerState>();

  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  readonly playHead = viewChild<ElementRef<HTMLDivElement>>('playHead');
  readonly beatWidth = 40;
  readonly rowHeight = 60;
  readonly tickRowHeight = 28;

  readonly channels = computed(() => this.song().channels);

  readonly channelEvents = computed(() => {
    const song = this.song();
    const events = this.processSongSequences(song);
    return song.channels.reduce((acc, channel) => {
      const id = channel.id;
      const channelEvents = events.filter(e => e.channelId === id);
      acc[id] = channelEvents;
      return acc;
    }, {} as Record<string, VisualEvent[]>);
  });

  readonly instruments = computed(() => this.song().instruments);

  timelineWidth = computed(() => {
    const songLength = this.sequencerState().songLength;
    return Math.max(songLength * this.beatWidth + 100, 800);
  });

  beatMarkers = computed(() => {
    const songLength = this.sequencerState().songLength;
    const markers: number[] = [];
    for (let i = 0; i <= Math.ceil(songLength); i++) {
      markers.push(i);
    }
    return markers;
  });

  playheadPosition = computed(() => {
    return this.sequencerState().currentBeat * this.beatWidth;
  });

  private instrumentColors = new Map<string, string>();
  private colorPalette = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  constructor() {
    effect(() => {
      const currentBeat = this.sequencerState().currentBeat;
      const state = this.sequencerState().state;
      const container = this.scrollContainer()?.nativeElement;
      
      if (container && state === 'playing') {
        const playheadPos = currentBeat * this.beatWidth;
        const containerWidth = container.clientWidth;
        const scrollLeft = playheadPos - containerWidth / 2;
        
        container.scrollTo({
          top: container.scrollTop,
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    });
    // effect(() => {
    //   const currentBeat = this.sequencerState().currentBeat;
    //   const state = this.sequencerState().state;
    //   const container = this.scrollContainer()?.nativeElement;
    //   const playHead = this.playHead()?.nativeElement;
    //   if (container && state === 'playing' && playHead) {
    //     playHead.scrollIntoView({
    //       behavior: 'instant',
    //       block: 'nearest',
    //       inline: 'center'
    //     })
    //     // const playheadPos = currentBeat * this.beatWidth;
    //     // const containerWidth = container.clientWidth;
    //     // const scrollLeft = playheadPos - containerWidth / 2;
        
    //     // container.scrollTo({
    //     //   top: container.scrollTop,
    //     //   left: Math.max(0, scrollLeft),
    //     //   behavior: 'smooth'
    //     // });
    //   }
    // });
  }

   getInstrumentColor(instrumentId: string): string {
    if (!this.instrumentColors.has(instrumentId)) {
      const colorIndex = this.instrumentColors.size % this.colorPalette.length;
      this.instrumentColors.set(instrumentId, this.colorPalette[colorIndex]);
    }
    return this.instrumentColors.get(instrumentId)!;
  }


  getTextColor(backgroundColor: string): string {
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

 
  /** Returns all visual events for the entire song */
  private processSongSequences(song: SongConfig): VisualEvent[] {
    const events: VisualEvent[] = [];
    song.sequence.forEach(entry => {
      this.processPattern(song, entry.patternId, entry.beat, events);
    });

    return events;
  }
  /**
   * 
   * @param song The song being processed
   * @param patternId The id of the pattern being processed
   * @param startBeat The beat in the song at which this pattern starts.  
   * All events in the pattern will be offset by this amount to get their absolute position in the song.
   * @param events The array to which visual events will be added as the pattern is processed
   * @param isNested True if this pattern is being processed as part of another pattern (i.e. it's a nested pattern).  
   * Nested patterns will be visually distinguished by a different color and italicized text.
   * @returns 
   */
  private processPattern(song: SongConfig, patternId: string, startBeat: number, events: VisualEvent[], isNested = false): void {
    const pattern = song.patterns.find(p => p.id === patternId);
    if (!pattern) return;

    const beatsPerBar = song.beatsPerBar;
    const patternLengthInBeats = pattern.bars * beatsPerBar;

    // Collect note on/off pairs to calculate duration
    const noteOnMap = new Map<string, NoteOnEvent>();
    
    pattern.events.forEach(event => {
      if (event.beat >= patternLengthInBeats) {
        return;
      }

      if (event.type === 'NoteOn') {
        const noteOnEvent = event as NoteOnEvent;
        // Create a unique key for this note
        const key = `${noteOnEvent.channelId}:${noteOnEvent.instrumentId}:${noteOnEvent.note}:${noteOnEvent.beat}`;
        noteOnMap.set(key, noteOnEvent);
      } else if (event.type === 'NoteOff') {
        const noteOffEvent = event as NoteOffEvent;
        // Find the corresponding note on event
        const key = `${noteOffEvent.channelId}:${noteOffEvent.instrumentId}:${noteOffEvent.note}`;
        
        // Look for the most recent NoteOn event for this note that hasn't been paired yet
        let matchedNoteOn: NoteOnEvent | undefined;
        let matchedKey: string | undefined;
        
        for (const [k, noteOn] of noteOnMap.entries()) {
          if (k.startsWith(key + ':') && noteOn.beat <= noteOffEvent.beat) {
            if (!matchedNoteOn || noteOn.beat > matchedNoteOn.beat) {
              matchedNoteOn = noteOn;
              matchedKey = k;
            }
          }
        }
        
        if (matchedNoteOn && matchedKey) {
          // Create visual event with calculated duration
          events.push({
            type: 'instrument',
            instrumentId: matchedNoteOn.instrumentId,
            channelId: matchedNoteOn.channelId,
            startBeat: startBeat + matchedNoteOn.beat,
            duration: noteOffEvent.beat - matchedNoteOn.beat,
            color: this.getInstrumentColor(matchedNoteOn.instrumentId),
            note: matchedNoteOn.note.toString(),
            isNested
          });
          
          // Remove the paired NoteOn
          noteOnMap.delete(matchedKey);
        }
      } else if (event.type === 'PatternOn') {
        const patEvent = event as PatternOnEvent;
        const nestedPattern = song.patterns.find(p => p.id === patEvent.patternId);
        const nestedDuration = nestedPattern ? nestedPattern.bars * beatsPerBar : 1;

        // Add visual indicator for pattern trigger on first channel
        const firstChannel = song.channels[0]?.id || 'master';
        events.push({
          type: 'pattern',
          patternId: patEvent.patternId,
          channelId: firstChannel,
          startBeat: startBeat + patEvent.beat,
          duration: nestedDuration,
          color: '#FFD700',
          note: `▶ ${patEvent.patternId}`,
          isNested: false
        });

        // Recursively process nested pattern - mark those events as nested
        this.processPattern(song, patEvent.patternId, startBeat + patEvent.beat, events, true);
      }
    });
    
    // Handle any unpaired NoteOn events (treat as very short duration)
    for (const noteOn of noteOnMap.values()) {
      events.push({
        type: 'instrument',
        instrumentId: noteOn.instrumentId,
        channelId: noteOn.channelId,
        startBeat: startBeat + noteOn.beat,
        duration: 0.125, // Default short duration for unpaired notes
        color: this.getInstrumentColor(noteOn.instrumentId),
        note: noteOn.note.toString(),
        isNested
      });
    }
  }

}
