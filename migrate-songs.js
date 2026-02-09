#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Migrates a song from the old event format to the new format
 */
function migrateSong(song) {
  // Deep clone
  const migrated = JSON.parse(JSON.stringify(song));
  
  // Migrate each pattern
  migrated.patterns = migrated.patterns.map(pattern => migratePattern(pattern));
  
  return migrated;
}

/**
 * Migrates a pattern from old format to new format
 */
function migratePattern(pattern) {
  const migratedEvents = [];
  
  pattern.events.forEach(event => {
    if (event.type === 'InstrumentOn') {
      // Convert InstrumentOn to NoteOn + NoteOff pair
      migratedEvents.push({
        type: 'NoteOn',
        beat: event.beat,
        channelId: event.channelId,
        instrumentId: event.instrumentId,
        note: event.note,
        velocity: event.velocity
      });
      
      migratedEvents.push({
        type: 'NoteOff',
        beat: event.beat + (event.duration || 0.25),
        channelId: event.channelId,
        instrumentId: event.instrumentId,
        note: event.note,
        velocity: 0.5
      });
    } else if (event.type === 'StartPattern') {
      // Convert StartPattern to PatternOn
      migratedEvents.push({
        type: 'PatternOn',
        beat: event.beat,
        patternId: event.patternId
      });
    } else {
      // Already migrated or unknown
      migratedEvents.push(event);
    }
  });
  
  // Sort events by beat
  migratedEvents.sort((a, b) => a.beat - b.beat);
  
  return {
    id: pattern.id,
    bars: pattern.bars,
    events: migratedEvents
  };
}

// Process all song files
const songsDir = path.join(__dirname, 'public/songs');
const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.json') && f !== 'song.schema.json');

files.forEach(file => {
  const filePath = path.join(songsDir, file);
  console.log(`Migrating ${file}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const song = JSON.parse(content);
  
  const migrated = migrateSong(song);
  
  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2) + '\n');
  console.log(`  ✓ Migrated ${file}`);
});

console.log('\nMigration complete!');
