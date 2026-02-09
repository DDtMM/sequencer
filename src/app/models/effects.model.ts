import * as Tone from 'tone';

// Helper type to omit conflicting 'type' property from ToneJS options
type OmitContext<T> = Omit<Partial<T>, 'context'>;

export type AutoFilterEffectConfig = { name: 'autoFilter' } & OmitContext<Tone.AutoFilterOptions>;
export type AutoPannerEffectConfig = { name: 'autoPanner' } & OmitContext<Tone.AutoPannerOptions>;
export type AutoWahEffectConfig = { name: 'autoWah' } & OmitContext<Tone.AutoWahOptions>;
export type BitCrusherEffectConfig= { name: 'bitCrusher' } & OmitContext<Tone.BitCrusherOptions>;
export type ChebyshevEffectConfig= { name: 'chebyshev' } & OmitContext<Tone.ChebyshevOptions>;
export type ChorusEffectConfig= { name: 'chorus' } & OmitContext<Tone.ChorusOptions>;
export type DelayEffectConfig= { name: 'delay' } & OmitContext<Tone.DelayOptions>;
export type DistortionEffectConfig= { name: 'distortion' } & OmitContext<Tone.DistortionOptions>;
export type FeedbackDelayEffectConfig= { name: 'feedbackDelay' } & OmitContext<Tone.FeedbackDelayOptions>;
export type FilterEffectConfig= { name: 'filter' } & OmitContext<Tone.FilterOptions>;
export type FrequencyShifterEffectConfig= { name: 'frequencyShifter' } & OmitContext<Tone.FrequencyShifterOptions>;
export type FreeverbEffectConfig= { name: 'freeverb' } & OmitContext<Tone.FreeverbOptions>;
export type JCReverbEffectConfig= { name: 'jcReverb' } & OmitContext<Tone.JCReverbOptions>;
export type PhaserEffectConfig= { name: 'phaser' } & OmitContext<Tone.PhaserOptions>;
export type PingPongDelayEffectConfig= { name: 'pingPongDelay' } & OmitContext<Tone.PingPongDelayOptions>;
export type PitchShiftEffectConfig= { name: 'pitchShift' } & OmitContext<Tone.PitchShiftOptions>;
export type ReverbEffectConfig= { name: 'reverb' } & OmitContext<Tone.ReverbOptions>;
export type StereoWidenerEffectConfig= { name: 'stereoWidener' } & OmitContext<Tone.StereoWidenerOptions>;
export type TremoloEffectConfig= { name: 'tremolo' } & OmitContext<Tone.TremoloOptions>;
export type VibratoEffectConfig= { name: 'vibrato' } & OmitContext<Tone.VibratoOptions>;
let x: AutoFilterEffectConfig;

export type EffectConfig =
  | AutoFilterEffectConfig
  | AutoPannerEffectConfig
  | AutoWahEffectConfig
  | BitCrusherEffectConfig
  | ChebyshevEffectConfig
  | ChorusEffectConfig
  | DelayEffectConfig
  | DistortionEffectConfig
  | FeedbackDelayEffectConfig
  | FilterEffectConfig
  | FrequencyShifterEffectConfig
  | FreeverbEffectConfig
  | JCReverbEffectConfig
  | PhaserEffectConfig
  | PingPongDelayEffectConfig
  | PitchShiftEffectConfig
  | ReverbEffectConfig
  | StereoWidenerEffectConfig
  | TremoloEffectConfig
  | VibratoEffectConfig;
