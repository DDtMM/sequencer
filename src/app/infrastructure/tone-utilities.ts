import * as Tone from 'tone';

/** 
 * Converts beats to Tone.js time notation using bar:beat:sixteenth format.
 * This format properly handles fractional beats.
 * 
 * @param durationInBeats The duration in beats to convert.
 * @param beatsPerBar The number of beats per bar (default is 4). Used to calculate bars.
 * @returns Tone.Unit.Time in bar:beat:sixteenth notation or 0 for zero duration
 * 
 * @example
 * beatsToTime(1)    // "0:1:0" (1 beat)
 * beatsToTime(3.5)  // "0:3:2" (3.5 beats = 3 beats + 2 sixteenths)
 * beatsToTime(0.25) // "0:0:1" (0.25 beats = 1 sixteenth)
 */
export function beatsToTime(durationInBeats: number, beatsPerBar: number = 4): Tone.Unit.Time {
  if (durationInBeats === 0) {
    return 0;
  }
  
  // Convert beats to bar:beat:sixteenth notation
  // 1 beat = 4 sixteenths (since a sixteenth note is 1/4 of a beat)
  const wholeBars = Math.floor(durationInBeats / beatsPerBar);
  const remainingBeats = durationInBeats % beatsPerBar;
  const wholeBeats = Math.floor(remainingBeats);
  const fractionalBeat = remainingBeats - wholeBeats;
  const sixteenths = fractionalBeat * 4;
  
  return `${wholeBars}:${wholeBeats}:${sixteenths}` as Tone.Unit.Time;
}
