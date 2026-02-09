import * as Tone from 'tone';

export interface NoteOnEvent {
  type: 'NoteOn';
  /** The beat in the song at which this note starts.  Can be fractional. */
  beat: number;
  /** The channel to play the instrument on. */
  channelId: string;
  /** The instrument to play. */
  instrumentId: string;
  /** The note to play, specified as a frequency or note name. */
  note: Tone.Unit.Frequency;
  /** The velocity of the note, from 0 to 1. */
  velocity: number;
}

export interface NoteOffEvent {
  type: 'NoteOff';
  /** The beat in the song at which this note ends.  Can be fractional. */
  beat: number;
  /** The channel the note is playing on. */
  channelId: string;
  /** The instrument playing the note. */
  instrumentId: string;
  /** The note to stop, specified as a frequency or note name. */
  note: Tone.Unit.Frequency;
  /** The note-off velocity, from 0 to 1. */
  velocity: number;
}

export interface PatternOnEvent {
  type: 'PatternOn';
  /** The beat in the song at which this pattern starts.  Can be fractional. */
  beat: number;
  patternId: string;
}

export interface PatternOffEvent {
  type: 'PatternOff';
  /** The beat in the song at which this pattern ends.  Can be fractional. */
  beat: number;
  patternId: string;
}

export type PatternEvent = NoteOnEvent | NoteOffEvent | PatternOnEvent | PatternOffEvent;