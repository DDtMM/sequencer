# 🎵 Sequencer - Angular 21 Music Sequencer

A browser-based music sequencer built with Angular 21, TailwindCSS, and ToneJS. Create and play songs defined in a strongly-typed JSON format with real-time visual feedback.

## 🚀 Features

- **ToneJS Integration**: Full-featured audio synthesis and effects
- **Type-Safe Song Format**: Strongly-typed TypeScript interfaces for all song data
- **Real-Time Visualization**: Scrolling timeline that displays instrument events across channels
- **Flexible Architecture**: 
  - Multiple instruments with configurable generators
  - Multiple channels with effect chains
  - Pattern-based sequencing with reusable patterns
  - ADSR envelope support for each instrument
- **Playback Controls**: Play, pause, stop, and loop functionality
- **Modern Angular**: Built with Angular 21 using signals, standalone components, and zoneless change detection

## 📦 Installation

```bash
npm install
```

## 🎮 Running the Application

Development server:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🎼 Song Format

Songs are defined in JSON format with the following structure:

```json
{
  "title": "My Song",
  "bpm": 120,
  "masterChannel": {
    "id": "master",
    "effects": [
      { 
        "type": "reverb", 
        "options": { "decay": 2.5 }
      }
    ]
  },
  "channels": [
    {
      "id": "ch1",
      "effects": [
        { 
          "type": "filter", 
          "options": { "frequency": 1000 }
        }
      ]
    }
  ],
  "instruments": [
    {
      "id": "synth1",
      "generators": [
        {
          "type": "oscillator",
          "waveform": "sine",
          "envelope": {
            "attack": 0.01,
            "decay": 0.1,
            "sustain": 0.5,
            "release": 0.3
          },
          "effects": []
        }
      ]
    }
  ],
  "patterns": [
    {
      "id": "pattern1",
      "events": [
        {
          "type": "InstrumentOn",
          "instrumentId": "synth1",
          "channelId": "ch1",
          "note": "C4",
          "velocity": 0.8,
          "duration": 1,
          "beat": 0
        }
      ]
    }
  ],
  "sequence": [
    { "patternId": "pattern1", "beat": 0 }
  ]
}
```

### Key Components

- **BPM**: Tempo of the song
- **Master Channel**: Global audio channel with effects applied to final output
- **Channels**: Individual audio channels that can have their own effect chains
- **Instruments**: Sound generators with configurable oscillators, envelopes, and effects
- **Patterns**: Reusable collections of musical events
- **Sequence**: Timeline that schedules when patterns play (measured in beats)

### Supported Effects (ToneJS-Based Typing)

All effects leverage ToneJS's built-in option types for complete type safety and feature parity:

```typescript
// Effect format
{
  "type": "effectType",
  "options": { /* ToneJS effect options */ }
}
```

#### Available Effect Types

- **reverb**: Uses `Partial<Tone.ReverbOptions>`
  - Example: `{ "type": "reverb", "options": { "decay": 2.5, "preDelay": 0.01 } }`

- **delay**: Uses `Partial<Tone.FeedbackDelayOptions>`
  - Example: `{ "type": "delay", "options": { "delayTime": "8n", "feedback": 0.4, "wet": 0.5 } }`

- **filter**: Uses `Partial<Tone.FilterOptions>`
  - Example: `{ "type": "filter", "options": { "frequency": 1000, "type": "lowpass", "Q": 1 } }`

- **distortion**: Uses `Partial<Tone.DistortionOptions>`
  - Example: `{ "type": "distortion", "options": { "distortion": 0.8, "oversample": "2x" } }`

- **chorus**: Uses `Partial<Tone.ChorusOptions>`
  - Example: `{ "type": "chorus", "options": { "frequency": 1.5, "delayTime": 3.5, "depth": 0.7 } }`

All ToneJS effect options are available! See [ToneJS Effect Documentation](https://tonejs.github.io/docs/) for complete parameter lists.

### Supported Waveforms

- `sine`: Pure sine wave
- `square`: Square wave
- `sawtooth`: Sawtooth wave
- `triangle`: Triangle wave

## 🏗️ Architecture

### Components

- **HomeComponent**: Landing page with list of sample songs
- **PlayerComponent**: Song player with playback controls and timeline
- **TimelineComponent**: Visual representation of song playback with scrolling window

### Services

- **SequencerService**: Core service managing ToneJS playback, scheduling, and state
  - Loads and validates songs
  - Orchestrates ToneJS audio graph creation
  - Schedules events based on patterns and sequence
  - Manages playback state using Angular signals
  - Supports looping

- **AudioBuilderService**: Converts song models to ToneJS instances
  - `buildEffect()`: Creates ToneJS effects from effect configurations
  - `buildInstrument()`: Creates ToneJS synthesizers from instrument definitions
  - Clean separation of concerns between data models and audio implementation

### Models

- **effects.model.ts**: Strongly-typed effect definitions using ToneJS option types
- **instruments.model.ts**: Instrument and generator type definitions
- **song.model.ts**: Core song structure (channels, patterns, sequence)
- Type-safe event system
- Reactive state management with signals

## 🎨 Technologies

- **Angular 21**: Latest Angular with signals and zoneless change detection
- **TailwindCSS 4**: Utility-first CSS framework
- **ToneJS 15**: Web Audio framework for synthesis and effects
- **TypeScript 5.9**: Type safety and modern JavaScript features

## 📝 Sample Songs

The application includes three sample songs demonstrating different features:

1. **Simple Melody**: Basic melodic pattern with sine wave synthesis
2. **Multi-Instrument Groove**: Bass, lead, and pad with different effect chains
3. **Complex Electronic**: Kick drums, arpeggios, and melody with advanced effects

## 🎯 Usage

1. Navigate to the home page
2. Click on any song to open the player
3. Use the **Play** button to start playback
4. Toggle **Loop** to repeat the song
5. Watch the timeline scroll as the song plays
6. Each colored block represents an instrument event

## 🔧 Development

The project uses:
- OnPush change detection for optimal performance
- Standalone components (no NgModules)
- Route-level code splitting
- SSR with selective rendering modes
