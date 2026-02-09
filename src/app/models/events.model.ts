import * as Tone from 'tone';

export interface InstrumentOnEvent {
  type: 'InstrumentOn';
  /** The beat in the song at which this pattern starts.  Can be fractional. */
  beat: number;
  /** The channel to play the instrument on. */
  channelId: string;
  /** The duration of the played note in beats. */
  duration: number;
  /** The instrument to play. */
  instrumentId: string;
  /** The note to play, specified as a frequency or note name. */
  note: Tone.Unit.Frequency;
  /** The velocity of the note, from 0 to 1. */
  velocity: number;
}

export interface StartPatternEvent {
  type: 'StartPattern';
  /** The beat in the song at which this pattern starts.  Can be fractional. */
  beat: number;
  patternId: string;
}

export type PatternEvent = InstrumentOnEvent | StartPatternEvent;