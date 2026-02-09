import { EffectConfig } from './effects.model';
import { PatternEvent } from './events.model';
import { Instrument } from './instruments.model';

export interface ChannelConfig {
  id: string;
  effects?: EffectConfig[];
  /** Pan position: -1 (full left) to 1 (full right), 0 is center */
  pan?: number;
  volume?: number; // Optional volume control in decibels
}

export interface PatternConfig {
  id: string;
  bars: number; // Length of this pattern in bars
  events: PatternEvent[];
}

export interface SequenceEntry {
  patternId: string;
  /** The beat in the song at which this pattern starts.  Can be fractional. */
  beat: number;
}

export interface SongConfig {
  /** Tempo in beats per minute. */
  bpm: number;
  /** Number of beats in each bar.  Produces the time signature.  If 4 then 4/4 time.  If 3 then 3/4 time. */
  beatsPerBar: number;
  loop?: boolean;
  /** All effects applied to the master output */
  masterChannel: Omit<ChannelConfig,'id'>;
  /** Defines each individual channel in the song */
  channels: ChannelConfig[];
  instruments: Instrument[];
  patterns: PatternConfig[];
  sequence: SequenceEntry[];
  title?: string;
}

