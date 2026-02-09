import * as Tone from 'tone';
import { Instrument, AdsrEnvelope, InstrumentGenerator } from '../models/instruments.model';
import { beatsToTime } from './tone-utilities';
import { buildEffect } from './effect-utilities';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';

export interface InstrumentNode {
  output: Tone.ToneAudioNode;
  trigger: (note: Tone.Unit.Frequency, duration: Tone.Unit.Time, time: Tone.Unit.Time, velocity: number) => void;
  triggerAttack: (note: Tone.Unit.Frequency, time: Tone.Unit.Time, velocity: number) => void;
  triggerRelease: (note: Tone.Unit.Frequency, time: Tone.Unit.Time, velocity: number) => void;
  dispose: () => void;
}

export function buildInstrument(config: Instrument): InstrumentNode {
  const polySynths: Tone.PolySynth[] = [];
  const effectNodes: Tone.ToneAudioNode[] = [];
  
  // Create a gain node as the final output
  const outputNode = new Tone.Gain(1);
  
  // Build each generator with its effects chain
  config.generators.forEach(generator => {
    const polySynth = buildGenerator(generator);
    polySynths.push(polySynth);
    
    // Apply generator effects if present and connect to output
    if (generator.effects && generator.effects.length > 0) {
      let currentNode: Tone.ToneAudioNode = polySynth;
      
      generator.effects.forEach(effectConfig => {
        const effect = buildEffect(effectConfig);
        effectNodes.push(effect);
        currentNode.connect(effect);
        currentNode = effect;
      });
      
      // Connect the final effect to output
      currentNode.connect(outputNode);
    } else {
      // No effects, connect directly to output
      polySynth.connect(outputNode);
    }
  });
  
  // Create trigger function that triggers all generators
  const trigger = (note: Tone.Unit.Frequency, duration: Tone.Unit.Time, time: Tone.Unit.Time, velocity: number) => {
    polySynths.forEach(polySynth => {
      //if (!polySynth.disposed) {
        //console.log(`[${config.id}]Triggering note ${note} with duration ${duration}, time ${time}, velocity ${velocity}`);
        polySynth.triggerAttackRelease(note, duration, time as number, velocity);
      //}
    });
  };
  
  // Create separate attack trigger function
  const triggerAttack = (note: Tone.Unit.Frequency, time: Tone.Unit.Time, velocity: number) => {
    polySynths.forEach(polySynth => {
      polySynth.triggerAttack(note, time as number, velocity);
    });
  };
  
  // Create separate release trigger function
  // Note: ToneJS doesn't currently use velocity for release, but we keep it in the signature
  // for API consistency and future compatibility
  const triggerRelease = (note: Tone.Unit.Frequency, time: Tone.Unit.Time, velocity: number) => {
    polySynths.forEach(polySynth => {
      polySynth.triggerRelease(note, time as number);
    });
  };
  
  // Create dispose function
  const dispose = () => {
    polySynths.forEach(polySynth => polySynth.dispose());
    effectNodes.forEach(effect => effect.dispose());
    outputNode.dispose();
  };
  
  return {
    output: outputNode,
    trigger,
    triggerAttack,
    triggerRelease,
    dispose
  };
}

function buildGenerator(generator: InstrumentGenerator): Tone.PolySynth {
  // Extract our custom properties
  const { type, effects, envelope, filterEnvelope, ...monoSynthOptions } = generator;
  
  const options: RecursivePartial<Omit<Tone.MonoSynthOptions, 'context'>> = {
    ...monoSynthOptions, // Spread all remaining MonoSynthOptions properties
  };
  
  // Convert our beat-based envelopes to Tone time envelopes
  if (envelope) {
    options.envelope = convertEnvelope(envelope);
  }
  
  if (filterEnvelope) {
    options.filterEnvelope = convertEnvelope(filterEnvelope);
  }

  return new Tone.PolySynth(Tone.Synth, options);
}

function convertEnvelope(envelope: AdsrEnvelope): Omit<Tone.EnvelopeOptions, 'context'> {
  return {
    attack: envelope.a == null ? 0 : beatsToTime(envelope.a),
    attackCurve: 'linear',
    decay: envelope.d == null ? 0 : beatsToTime(envelope.d),
    decayCurve: 'linear',
    sustain: envelope.s ?? envelope.a ?? 1,
    release: envelope.r == null ? 0 : beatsToTime(envelope.r),
    releaseCurve: 'linear'
  };
}
