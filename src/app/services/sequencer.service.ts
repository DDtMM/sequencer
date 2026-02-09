import { Injectable, signal } from '@angular/core';
import * as Tone from 'tone';
import { buildEffect } from '../infrastructure/effect-utilities';
import { buildInstrument, InstrumentNode } from '../infrastructure/instrument-utilities';
import { calculateSongLength } from '../infrastructure/song-utilities';
import { beatsToTime } from '../infrastructure/tone-utilities';
import { InstrumentOnEvent } from '../models/events.model';
import { Instrument } from '../models/instruments.model';
import { ChannelConfig, SongConfig } from '../models/song.model';

export type PlaybackState = 'stopped' | 'playing';

export interface SequencerState {
  positionAtStart: number;
  timeAtStart: number;
  state: PlaybackState;
  currentBeat: number;
  isLooping: boolean;
  songLength: number;
}


@Injectable({
  providedIn: 'root'
})
export class SequencerService {
  private song: SongConfig | undefined = undefined;
  private channels = new Map<string, Tone.Channel>();
  private instrumentConfigs = new Map<string, Instrument>();
  // Map of channelId -> instrumentId -> InstrumentNode
  private channelInstruments = new Map<string, Map<string, InstrumentNode>>();
  private channelEffects = new Map<string, Tone.ToneAudioNode[]>();
  private channelInputNodes = new Map<string, Tone.ToneAudioNode>();
  private masterChannel: Tone.Channel | undefined = undefined;
  private scheduledEvents: number[] = [];
  private updateBeatTrackingInterval: number | undefined = undefined;
  
  // Analyzers for L/R visualization
  private leftMeter: Tone.Meter | undefined = undefined;
  private rightMeter: Tone.Meter | undefined = undefined;

  state = signal<SequencerState>({
    positionAtStart: 0,
    timeAtStart: 0,
    state: 'stopped',
    currentBeat: 0,
    isLooping: false,
    songLength: 0
  });

  async loadSong(song: SongConfig): Promise<void> {
    this.cleanup();
    this.song = song;
    
    await Tone.start();
    Tone.getTransport().bpm.value = song.bpm;
    Tone.getTransport().timeSignature = song.beatsPerBar;
    this.createMasterChannel(song.masterChannel);
    this.createChannels(song.channels);
    this.storeInstrumentConfigs(song.instruments);
    this.createAnalyzers(this.masterChannel!);
    //this.createAnalyzers(this.channels.get(song.channels[0].id)!);

    const songLength = calculateSongLength(song);
    console.log('Song loaded. Length:', songLength, 'beats');
    this.state.update(s => ({ ...s, songLength, isLooping: song.loop || false }));
  }

  private createAnalyzers(channel: Tone.Channel): void {
    // Create a splitter to separate L/R channels
    const splitter = new Tone.Split();
    
    // Create meters for each channel
    this.leftMeter = new Tone.Meter();
    this.rightMeter = new Tone.Meter();
   
    channel.connect(splitter);
    
    splitter.connect(this.leftMeter, 0); // Left channel to left meter
    
    splitter.connect(this.rightMeter, 1); // Right channel to right meter
    
  }

  getLeftLevel(): number {
    const value = this.leftMeter?.getValue();
    return typeof value === 'number' ? value : (Array.isArray(value) ? value[0] : -Infinity);
  }

  getRightLevel(): number {
    const value = this.rightMeter?.getValue();
    return typeof value === 'number' ? value : (Array.isArray(value) ? value[0] : -Infinity);
  }

  private createMasterChannel(channelConfig: Omit<ChannelConfig, 'id'>): void {
    this.masterChannel = this.createChannel(channelConfig, '_master', Tone.getDestination());
  }

  private createChannels(channelConfigs: ChannelConfig[]): void {
    const masterChannel = this.masterChannel;
    if (masterChannel === undefined) {
      throw new Error('Master channel must be created before channels');
    }
    for (const config of channelConfigs) {
      this.createChannel(config, config.id, masterChannel);
    }
    
    // Log the complete audio graph for debugging
    // logChannelEffectChains(
    //   this.channels,
    //   this.channelEffects,
    //   this.masterChannel,
    //   this.channelEffects.get('_master')
    // );
  }

  private createChannel(channelConfig: Omit<ChannelConfig, 'id'>, id: string | '_master', connectTo: Tone.InputNode): Tone.Channel {
    const channel = new Tone.Channel({ channelCount: 2, pan: channelConfig.pan, volume: channelConfig.volume });
    const channelEffects = channelConfig.effects?.map(effectConfig => buildEffect(effectConfig)) ?? [];
    channel.chain(...channelEffects, connectTo);
    
    
    if (id !== '_master') {
      this.channels.set(id, channel);
      this.channelInstruments.set(id, new Map<string, InstrumentNode>());
    }
    this.channelEffects.set(id, channelEffects);
    
    return channel;
  }

  private storeInstrumentConfigs(instrumentConfigs: Instrument[]): void {
    instrumentConfigs.forEach(config => {
      this.instrumentConfigs.set(config.id, config);
    });
  }

  private getOrCreateChannelInstrument(channelId: string, instrumentId: string): InstrumentNode | undefined {
    const channel = this.channels.get(channelId);
    if (!channel) {
      console.warn(`Channel ${channelId} not found`);
      return undefined;
    }

    const channelPool = this.channelInstruments.get(channelId);
    if (!channelPool) {
      console.warn(`Channel pool for ${channelId} not found`);
      return undefined;
    }

    // Check if instrument already exists for this channel
    let instrumentNode = channelPool.get(instrumentId);
    if (!instrumentNode) {
      // Create new instrument instance for this channel
      const config = this.instrumentConfigs.get(instrumentId);
      if (!config) {
        console.warn(`Instrument config ${instrumentId} not found`);
        return undefined;
      }

      instrumentNode = buildInstrument(config);
      // Connect instrument output to channel
      instrumentNode.output.connect(channel);
      // Store in channel pool
      channelPool.set(instrumentId, instrumentNode);
      console.log(`Created instrument ${instrumentId} for channel ${channelId}`);
    }

    return instrumentNode;
  }

  start(): void {
    if (!this.song || this.state().state === 'playing') {
      return;
    }

    const now = Tone.now();
    this.state.update(s => ({
      ...s,
      state: 'playing',
      positionAtStart: 0,
      timeAtStart: now,
      currentBeat: 0
    }));
    const { isLooping, songLength } = this.state();
    const transport = Tone.getTransport();
    // Reset transport to beginning
    transport.position = 0;

    // Set up looping if enabled
    const beatsPerBar = this.song.beatsPerBar;
    const bars = Math.floor(songLength / beatsPerBar);
    const beats = songLength % beatsPerBar;
    
    console.log('Starting playback. Song length:', songLength, 'beats =', bars, 'bars +', beats, 'beats. Loop:', this.state().isLooping);
    this.clearScheduledEvents();

    if (isLooping) {
      transport.loop = true;
      transport.loopEnd = `${bars}:${beats}:0`;
    } else {
      transport.loop = false;
      const stopId = transport.schedule(() => {
        this.stop();
      }, `${bars}:${beats}:0`);
      this.scheduledEvents.push(stopId);
    }
   
    this.song.sequence.forEach(entry => this.schedulePatternEvents(entry.patternId, entry.beat));
    transport.start();
    this.startBeatTracking();
  }

  stop(): void {
    if (this.state().state === 'stopped') {
      return;
    }

    const transport = Tone.getTransport();
    transport.stop();
    transport.position = 0;
    this.clearScheduledEvents();
    this.stopBeatTracking();

    this.state.update(s => ({
      ...s,
      state: 'stopped',
      currentBeat: 0
    }));
  }

  pause(): void {
    if (this.state().state === 'stopped') {
      return;
    }

    Tone.getTransport().pause();
    this.stopBeatTracking();

    this.state.update(s => ({ ...s, state: 'stopped' }));
  }

  setLooping(isLooping: boolean): void {
    this.state.update(s => ({ ...s, isLooping }));
    
    // If currently playing, restart with new loop settings
    if (this.state().state === 'playing') {
      this.stop();
      this.start();
    }
  }

  private schedulePatternEvents(patternId: string, startBeat: number): void {
    const pattern = this.song!.patterns.find(p => p.id === patternId);
    if (!pattern) {
      console.warn('Pattern not found:', patternId);
      return;
    }

    const beatsPerBar = this.song!.beatsPerBar;
    const patternLengthInBeats = pattern.bars * beatsPerBar;

    let scheduledCount = 0;
    pattern.events.forEach(event => {
      // Only schedule events that occur within the pattern's bar length
      if (event.beat < patternLengthInBeats) {
        if (event.type === 'InstrumentOn') {
          this.scheduleInstrumentEvent(event, startBeat);
          scheduledCount++;
        } else if (event.type === 'StartPattern') {
          // Recursively schedule the nested pattern
          const nestedStartBeat = startBeat + event.beat;
          this.schedulePatternEvents(event.patternId, nestedStartBeat);
          scheduledCount++;
        }
      }
    });
  }

  private scheduleInstrumentEvent(event: InstrumentOnEvent, beat: number): void {
    const instrumentNode = this.getOrCreateChannelInstrument(event.channelId, event.instrumentId);
    
    if (!instrumentNode) return;

    const absoluteBeat = beat + event.beat;
    
    // Convert beat to bars:beats:sixteenths notation
    const timeOffset = beatsToTime(absoluteBeat, this.song!.beatsPerBar);

    const eventId = Tone.getTransport().schedule((time) => {
      instrumentNode.trigger(
        event.note,
        beatsToTime(event.duration, this.song!.beatsPerBar),
        time,
        event.velocity
      );
    }, timeOffset);

    this.scheduledEvents.push(eventId);
  }

  private clearScheduledEvents(): void {
    this.scheduledEvents.forEach(id => {
      Tone.getTransport().clear(id);
    });
    this.scheduledEvents = [];
  }

  /** Keeps the state signal up to date with the current beat.  For informational purposes only. */
  private startBeatTracking(): void {
    this.updateBeatTrackingInterval = setInterval(() => this.updateCurrentBeat(), 50) as unknown as number;
  }

  private stopBeatTracking(): void {
    if (this.updateBeatTrackingInterval !== undefined) {
      this.updateCurrentBeat();
      clearInterval(this.updateBeatTrackingInterval);
      this.updateBeatTrackingInterval = undefined;
    }
  }

  private getCurrentBeat(): number {
    if (!this.song) {
      return 0;
    }
    const beatsPerSecond = this.song.bpm / 60;
    const transportSeconds = Tone.getTransport().seconds;
    return transportSeconds * beatsPerSecond;
  }

  cleanup(): void {
    this.stop();
    this.clearScheduledEvents();

    this.channelInstruments.forEach(channelPool => {
      channelPool.forEach(instrumentNode => {
        instrumentNode.dispose();
      });
      channelPool.clear();
    });
    this.channelInstruments.clear();
    
    // Dispose channel effects
    this.channelEffects.forEach(effects => {
      effects.forEach(effect => effect.dispose());
    });
    this.channelEffects.clear();
    this.channelInputNodes.clear();
    
    this.instrumentConfigs.clear();

    this.channels.forEach(ch => ch.dispose());
    this.channels.clear();
    
    // Dispose analyzers
    if (this.leftMeter) {
      this.leftMeter.dispose();
      this.leftMeter = undefined;
    }
    if (this.rightMeter) {
      this.rightMeter.dispose();
      this.rightMeter = undefined;
    }

    if (this.masterChannel) {
      this.masterChannel.dispose();
      this.masterChannel = undefined;
    }

    this.song = undefined;
  }

  /** Sets the currentBeat in the state. */
  private updateCurrentBeat(): void {
    const currentBeat = this.getCurrentBeat();
    this.state.update(s => ({ ...s, currentBeat }));
  }
}
