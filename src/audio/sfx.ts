export type SoundName = 'feed' | 'play' | 'clean' | 'medicine' | 'sleep' | 'wake' | 'refuse' | 'fanfare' | 'growUp';

interface Mixer {
  context: AudioContext;
  master: GainNode;
  noise: AudioBuffer;
}

const MASTER_GAIN = 0.1;
const GESTURE_EVENTS = ['pointerdown', 'keydown', 'touchend'];

let enabled = false;
let audio: Mixer | null = null;

function createNoise(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function ensureAudio(): void {
  if (!audio && typeof AudioContext !== 'undefined') {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(context.destination);
    audio = { context, master, noise: createNoise(context) };
  }
  if (audio?.context.state === 'suspended') {
    void audio.context.resume();
  }
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function unlockAudioOnFirstGesture(): void {
  const unlock = (): void => {
    GESTURE_EVENTS.forEach((type) => window.removeEventListener(type, unlock));
    ensureAudio();
  };
  GESTURE_EVENTS.forEach((type) => window.addEventListener(type, unlock));
}

function envelope({ context }: Mixer, start: number, duration: number, volume: number): GainNode {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  return gain;
}

function tone(type: OscillatorType, frequency: number, start: number, duration: number): void {
  if (!audio) {
    return;
  }
  const oscillator = audio.context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  const volume = type === 'square' ? 0.5 : 1;
  oscillator.connect(envelope(audio, start, duration, volume)).connect(audio.master);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function noise(start: number, duration: number, fromHz: number, toHz: number): void {
  if (!audio) {
    return;
  }
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  const filter = audio.context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(fromHz, start);
  filter.frequency.linearRampToValueAtTime(toHz, start + duration);
  source.connect(filter).connect(envelope(audio, start, duration, 0.8)).connect(audio.master);
  source.start(start);
  source.stop(start + duration);
}

function notes(type: OscillatorType, frequencies: number[], start: number, gap: number, duration: number): void {
  frequencies.forEach((frequency, index) => tone(type, frequency, start + index * gap, duration));
}

const SOUNDS: Record<SoundName, (start: number) => void> = {
  feed: (start) => [0, 0.13, 0.26].forEach((offset) => noise(start + offset, 0.07, 1200, 900)),
  play: (start) => notes('square', [660, 880, 1100, 1320], start, 0.06, 0.08),
  clean: (start) => noise(start, 0.4, 600, 3000),
  medicine: (start) => notes('triangle', [1568, 1976, 2349, 3136], start, 0.07, 0.12),
  sleep: (start) => notes('triangle', [784, 659, 523], start, 0.2, 0.18),
  wake: (start) => notes('triangle', [523, 659, 784], start, 0.2, 0.18),
  refuse: (start) => notes('square', [196, 196], start, 0.16, 0.1),
  fanfare: (start) => {
    notes('square', [523, 659, 784], start, 0.12, 0.1);
    tone('square', 1047, start + 0.36, 0.3);
  },
  growUp: (start) => notes('triangle', [523, 587, 659, 698, 784, 880, 988, 1047], start, 0.08, 0.12),
};

export function playSound(name: SoundName): void {
  if (!enabled || !audio) {
    return;
  }
  ensureAudio();
  SOUNDS[name](audio.context.currentTime + 0.01);
}
