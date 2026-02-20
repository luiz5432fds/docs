import {fmSignal, karplusStrong, normalize, phaseAccumulatorSaw} from './algorithms';
import {buildInvisibleMixPreset} from './mix_bus';
import {mapGestureToXps10} from './gesture_engine';

export type TimbreIntent = {
  family: 'metais' | 'madeiras' | 'cordas' | 'pads' | 'sintetizador' | 'vocal';
  brightnessTarget: number; // 0..1
  densityTarget: number; // 0..1
  acousticness: number; // 0..1
  aftertouch: number; // 0..1
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function centroidEstimate(signal: ArrayLike<number>): number {
  const arr = Array.from(signal);
  const energy = arr.reduce((acc, s) => acc + Math.abs(s), 0) || 1;
  const weighted = arr.reduce((acc, s, i) => acc + Math.abs(s) * (i + 1), 0);
  return weighted / (arr.length * energy);
}

function harmonicityScore(signal: ArrayLike<number>): number {
  const abs = Array.from(signal).map((v) => Math.abs(v));
  const even = abs.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const odd = abs.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) || 1;
  return clamp01(even / (even + odd));
}

function chooseSynthesisMode(intent: TimbreIntent) {
  if (intent.family === 'metais' || intent.family === 'madeiras') return 'fm_pm';
  if (intent.family === 'cordas' && intent.acousticness > 0.5) return 'waveguide';
  if (intent.family === 'pads' || intent.densityTarget > 0.65) return 'granular';
  return 'hybrid_pcm_va';
}

function mapXps10Panel(intent: TimbreIntent, metrics: {centroid: number; harmonicity: number}) {
  const cutoff = Math.round(25 + (intent.brightnessTarget * 70) + metrics.centroid * 25);
  const resonance = Math.round(24 + (1 - metrics.harmonicity) * 46);
  const attack = Math.round(10 + (intent.acousticness * 38));
  const release = Math.round(20 + (intent.densityTarget * 62));
  const chorus = Math.round(18 + intent.densityTarget * 52);
  const reverb = Math.round(22 + intent.acousticness * 48);

  const clamp127 = (v: number) => Math.max(0, Math.min(127, v));
  return {
    cutoff: clamp127(cutoff),
    resonance: clamp127(resonance),
    attack: clamp127(attack),
    release: clamp127(release),
    chorus: clamp127(chorus),
    reverb: clamp127(reverb),
  };
}

export function buildIntelligentTimbreAlgorithm(raw: Partial<TimbreIntent> = {}) {
  const intent: TimbreIntent = {
    family: (raw.family as TimbreIntent['family']) ?? 'sintetizador',
    brightnessTarget: clamp01(Number(raw.brightnessTarget ?? 0.55)),
    densityTarget: clamp01(Number(raw.densityTarget ?? 0.45)),
    acousticness: clamp01(Number(raw.acousticness ?? 0.4)),
    aftertouch: clamp01(Number(raw.aftertouch ?? 0.5)),
  };

  const sampleRate = 44100;
  const base = normalize(phaseAccumulatorSaw(2048, 220 / sampleRate));
  const fm = normalize(fmSignal(2048, sampleRate, 220, 220, 3.6));
  const waveguide = normalize(karplusStrong(2048, Math.floor(sampleRate / 220), 0.994));

  const centroid = centroidEstimate(base);
  const harmonicity = harmonicityScore(fm);
  const selectedMode = chooseSynthesisMode(intent);
  const panel = mapXps10Panel(intent, {centroid, harmonicity});

  const gesture = mapGestureToXps10(
    intent.family === 'metais' ? 'brass' :
    intent.family === 'madeiras' ? 'woodwinds' :
    intent.family === 'cordas' ? 'strings' :
    'pads',
    intent.aftertouch,
  );

  const mixPreset = buildInvisibleMixPreset({
    denseBand: intent.densityTarget > 0.6,
    hasLeadVocal: true,
    hasBassAndKick: true,
    targetLufs: -16,
  });

  return {
    input: intent,
    analysis: {
      f0EstimateHz: 220,
      spectralCentroidNorm: centroid,
      harmonicity,
      pmfBandHint: [
        {band: 'grave', p: Number((1 - centroid).toFixed(3))},
        {band: 'médio', p: Number((0.65 + (centroid * 0.2)).toFixed(3))},
        {band: 'agudo', p: Number(centroid.toFixed(3))},
      ],
    },
    selector: {
      mode: selectedMode,
      rationale: {
        fm_pm: 'Metais/madeiras com brilho dinâmico controlado por índice de modulação.',
        granular: 'Texturas densas e opacas com nuvens assíncronas de grãos.',
        waveguide: 'Cordas/sopros com perdas de energia e resposta física aproximada.',
        hybrid_pcm_va: 'Camadas PCM + síntese virtual para aplicação prática no XPS-10.',
      }[selectedMode],
    },
    ugens: {
      phaseAccumulator: 'S[i+1]=S[i]+I (wrap em 2π)',
      wavetableInterpolation: 'y=(1-a)T[i]+aT[i+1]',
      adsrGain: 'y=x*env_adsr',
      exampleFrames: {
        base: base.slice(0, 8),
        fm: fm.slice(0, 8),
        waveguide: waveguide.slice(0, 8),
      },
    },
    articulation: {
      aftertouchMapping: gesture,
      antiquing: {
        jitterPercent: 1,
        driftLfoHz: [0.12, 0.35],
        softClip: 'tanh(x * drive)',
      },
    },
    outputConditioning: {
      preset: mixPreset,
      formantEq: {
        woodwinds: ['HPF 100Hz', 'Bell +2dB @1.2kHz Q1.1', 'Bell +1.5dB @2.7kHz Q1.0'],
        brass: ['HPF 90Hz', 'Bell +1.5dB @2.5kHz Q0.9', 'Shelf -1dB @8kHz'],
      },
      loudnessPolicy: 'Limiter final com ceiling -1dBFS + normalização de saída orientada a LUFS alvo.',
    },
    xps10PatchProposal: {
      panel,
      notes: [
        'Use Tone 1 (ataque PCM) + Tone 2 (sustain) para síntese LA prática.',
        'Ring Mod e controles avançados devem ser tratados como planejamento quando não houver confirmação de mapeamento MIDI/SysEx.',
      ],
    },
  };
}
