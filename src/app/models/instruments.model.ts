import * as Tone from 'tone';
import { EffectConfig } from './effects.model';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';

// ADSR Envelope in beats
export interface AdsrEnvelope {
  a?: number;  // Attack time in beats - how long to reach peak after note starts
  d?: number;  // Decay time in beats - how long to fall from peak to sustain level
  s?: number;  // Sustain level (0-1) - the level maintained while note is held
  r?: number;  // Release time in beats - how long to fade after note ends
}

export interface OscillatorGenerator extends RecursivePartial<Omit<Tone.MonoSynthOptions, 'context' | 'onsilence' | 'envelope' | 'filterEnvelope'>> {
  type: 'oscillator'; // More types will be added later
  envelope?: AdsrEnvelope;
  filterEnvelope?: AdsrEnvelope; // Filter envelope in beats
  effects?: EffectConfig[];
}

export type InstrumentGenerator = OscillatorGenerator;
export interface Instrument {
  id: string;
  generators: InstrumentGenerator[];
}
