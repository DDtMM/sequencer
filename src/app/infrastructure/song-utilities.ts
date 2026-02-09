import { SongConfig } from '../models/song.model';

/** Calculates the number of beats in a song. */
export function calculateSongLength(song: SongConfig): number {

  let maxBeat = 0;
  song.sequence.forEach(entry => {
    const pattern = song.patterns.find(p => p.id === entry.patternId);
    if (!pattern) { 
      console.warn(`Pattern with ID ${entry.patternId} not found in song`);
      return;
    }

    const beatsPerBar = song.beatsPerBar;
    const patternLengthInBeats = pattern.bars * beatsPerBar;
    const patternEndBeat = entry.beat + patternLengthInBeats;
    
    if (patternEndBeat > maxBeat) {
      maxBeat = patternEndBeat;
    }
  });

  return maxBeat;
}
