import { SongConfig, PatternConfig } from '../models/song.model';
import { PatternEvent, NoteOnEvent, NoteOffEvent, PatternOnEvent, PatternOffEvent } from '../models/events.model';

/**
 * Migrates a song from the old event format (InstrumentOn with duration, StartPattern)
 * to the new format (NoteOn/NoteOff, PatternOn/PatternOff)
 */
export function migrateSongToNoteOnOff(song: any): SongConfig {
  // Deep clone to avoid modifying the original
  const migratedSong = JSON.parse(JSON.stringify(song)) as SongConfig;
  
  // Migrate each pattern
  migratedSong.patterns = migratedSong.patterns.map(pattern => 
    migratePattern(pattern as any)
  );
  
  return migratedSong;
}

/**
 * Migrates a pattern from old format to new format
 */
function migratePattern(pattern: any): PatternConfig {
  const migratedEvents: PatternEvent[] = [];
  
  pattern.events.forEach((event: any) => {
    if (event.type === 'InstrumentOn') {
      // Convert InstrumentOn to NoteOn + NoteOff pair
      const noteOn: NoteOnEvent = {
        type: 'NoteOn',
        beat: event.beat,
        channelId: event.channelId,
        instrumentId: event.instrumentId,
        note: event.note,
        velocity: event.velocity
      };
      
      const noteOff: NoteOffEvent = {
        type: 'NoteOff',
        beat: event.beat + (event.duration || 0.25), // Default duration if missing
        channelId: event.channelId,
        instrumentId: event.instrumentId,
        note: event.note,
        velocity: 0.5 // Default note-off velocity
      };
      
      migratedEvents.push(noteOn);
      migratedEvents.push(noteOff);
    } else if (event.type === 'StartPattern') {
      // Convert StartPattern to PatternOn
      // Note: We don't add PatternOff as we don't know the duration
      // This will be handled by the nested pattern's length
      const patternOn: PatternOnEvent = {
        type: 'PatternOn',
        beat: event.beat,
        patternId: event.patternId
      };
      
      migratedEvents.push(patternOn);
    } else {
      // Already in new format or unknown type, keep as is
      migratedEvents.push(event);
    }
  });
  
  // Sort events by beat to ensure proper order
  migratedEvents.sort((a, b) => a.beat - b.beat);
  
  return {
    id: pattern.id,
    bars: pattern.bars,
    events: migratedEvents
  };
}
