import * as Tone from 'tone';
import { EffectConfig } from '../models/effects.model';

export function buildEffect(effectConfig: EffectConfig): Tone.ToneAudioNode {
  switch (effectConfig.name) {
    case 'autoFilter':
      return new Tone.AutoFilter(effectConfig);
    case 'autoPanner':
      return new Tone.AutoPanner(effectConfig);
    case 'autoWah':
      return new Tone.AutoWah(effectConfig);
    case 'bitCrusher':
      return new Tone.BitCrusher(effectConfig);
    case 'chebyshev':
      return new Tone.Chebyshev(effectConfig);
    case 'chorus':
      return new Tone.Chorus(effectConfig);
    case 'delay':
      return new Tone.Delay(effectConfig);
    case 'distortion':
      return new Tone.Distortion(effectConfig);
    case 'feedbackDelay':
      return new Tone.FeedbackDelay(effectConfig);
    case 'filter':
      return new Tone.Filter(effectConfig);
    case 'frequencyShifter':
      return new Tone.FrequencyShifter(effectConfig);
    case 'freeverb':
      return new Tone.Freeverb(effectConfig);
    case 'jcReverb':
      return new Tone.JCReverb(effectConfig);
    case 'phaser':
      return new Tone.Phaser(effectConfig);
    case 'pingPongDelay':
      return new Tone.PingPongDelay(effectConfig);
    case 'pitchShift':
      return new Tone.PitchShift(effectConfig);
    case 'reverb':
      return new Tone.Reverb(effectConfig);
    case 'stereoWidener':
      return new Tone.StereoWidener(effectConfig);
    case 'tremolo':
      return new Tone.Tremolo(effectConfig);
    case 'vibrato':
      return new Tone.Vibrato(effectConfig);
    default:
      // in case there is a deserialization issue, trigger an error.
      const exhaustiveCheck = (effectConfig as unknown as any).name;
      throw new Error(`Unknown effect name: ${exhaustiveCheck}`);
  }
}

