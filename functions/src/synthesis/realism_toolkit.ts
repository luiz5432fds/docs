export type RealismFamily = 'classicSynth' | 'woodwinds' | 'strings' | 'brass' | 'choir4tones';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function aftertouchClassicSynth(aftertouch: number) {
  const p = clamp01(aftertouch);
  return {
    filterCutoffNorm: 0.35 + 0.5 * p,
    pwmAmount: 0.1 + 0.7 * p,
    vibratoDepth: 0.02 + 0.15 * p,
    envDecayScale: 1.0 + 0.25 * p,
    midiHint: 'Atualizações de pressão em janelas de 10-50ms para suavidade perceptual.'
  };
}

export function woodwindsEqPreset() {
  return {
    highPassHz: 120,
    formant1Hz: {freq: 1200, gainDb: 1.5, q: 1.1},
    formant2Hz: {freq: 2700, gainDb: 1.2, q: 1.2},
    harshControl: {freq: 4200, gainDb: -1.5, q: 1.4},
    notes: [
      'Preservar parciais ímpares em madeiras tipo clarinete.',
      'Aplicar unmasking em instrumentos concorrentes na região 1-3kHz.'
    ]
  };
}

export function jitterDriftPreset(amount = 0.01) {
  const a = Math.max(0, Math.min(0.05, amount));
  return {
    pitchJitterPct: a,
    ampJitterPct: Math.min(0.5, a * 20),
    lfoRateHz: 8 + a * 120,
    randomDepthFineTuneCents: Math.round(2 + a * 20),
    guidance: 'Aplicar jitter estocástico mínimo e descorrelacionado por layer para evitar som mecânico.'
  };
}

export function choir4TonesOrganicPreset() {
  return {
    tones: [
      {tone: 1, detuneCents: -5, attackMs: 12, pan: -20},
      {tone: 2, detuneCents: 0, attackMs: 18, pan: -5},
      {tone: 3, detuneCents: 4, attackMs: 24, pan: 8},
      {tone: 4, detuneCents: 9, attackMs: 32, pan: 22}
    ],
    modulation: {
      randomLfoHz: [10, 20],
      pwmVariation: true,
      delayMicroShiftMs: [3, 17]
    },
    note: 'Descorrelacionar modulação entre tones para efeito de coro orgânico.'
  };
}

export function brassFmBestPractice() {
  return {
    ratioCore: '1:1',
    ratioAttackOption: '3:1',
    why: '1:1 mantém componentes na série harmônica; variação do índice adiciona brilho dinâmico.',
    modIndex: {min: 0, max: 5},
    aftertouchMap: 'Aftertouch -> modIndex percebido + cutoff + layer edge'
  };
}

export function mapRealismToolkit(family: RealismFamily, aftertouch = 0.5) {
  switch (family) {
    case 'classicSynth':
      return {family, data: aftertouchClassicSynth(aftertouch)};
    case 'woodwinds':
      return {family, data: woodwindsEqPreset()};
    case 'strings':
      return {family, data: {bowForceFromAftertouch: clamp01(aftertouch), bowNote: 'Mapear pressão para amortecimento e leve instabilidade controlada.'}};
    case 'brass':
      return {family, data: brassFmBestPractice()};
    case 'choir4tones':
      return {family, data: choir4TonesOrganicPreset()};
    default:
      return {family, data: {warning: 'Família não reconhecida'}};
  }
}
