export type Family = 'woodwinds' | 'strings' | 'brass' | 'vocal' | 'pads';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function woodwindsGesture(aftertouch: number) {
  const p = clamp01(aftertouch);
  const breathNoiseGain = 0.15 + 0.75 * p;
  const reedDrive = 1.0 + 1.4 * p;
  const tvfCutoffNorm = 0.35 + 0.45 * p;
  return {breathNoiseGain, reedDrive, tvfCutoffNorm};
}

export function stringsGesture(aftertouch: number) {
  const p = clamp01(aftertouch);
  const bowForce = p;
  const loopCutoffHz = 20000 - (15000 * p);
  const fastPitchLfoDepth = 0.003 + 0.01 * p;
  return {bowForce, loopCutoffHz, fastPitchLfoDepth};
}

export function brassGesture(aftertouch: number) {
  const p = clamp01(aftertouch);
  const modIndex = 0.5 + (5.0 * p);
  const harmonicEdgeGain = 0.1 + 0.8 * p;
  const cutoffNorm = 0.45 + 0.4 * p;
  return {modIndex, harmonicEdgeGain, cutoffNorm};
}

export function vocalGesture(aftertouch: number) {
  const p = clamp01(aftertouch);
  const pulseWidth = 1.0 - (0.5 * p);
  const formantShift = 1.0 + (0.25 * p);
  const drift = (Math.random() * 0.004) - 0.002;
  return {pulseWidth, formantShift, drift};
}

export function mapGestureToXps10(family: Family, aftertouch: number) {
  switch (family) {
    case 'woodwinds': {
      const g = woodwindsGesture(aftertouch);
      return {
        family,
        xps10: {
          noiseTvaLevel: Math.round(g.breathNoiseGain * 127),
          mainTvfCutoff: Math.round(g.tvfCutoffNorm * 127),
          note: 'Mapear aftertouch/pedal para ruído de sopro + cutoff principal.'
        },
        equations: [
          'noiseEnv = pressure * whiteNoise',
          'output = tanh(excitation * (1 + pressure))'
        ]
      };
    }
    case 'strings': {
      const g = stringsGesture(aftertouch);
      return {
        family,
        xps10: {
          mainTvfCutoff: Math.round((g.loopCutoffHz / 20000) * 127),
          pitchLfoDepth: Math.round(Math.min(1, g.fastPitchLfoDepth * 40) * 127),
          note: 'Aftertouch reduz cutoff e aumenta instabilidade controlada (arco).'
        },
        equations: [
          'reflection = bowTable(velocityRel, bowForce)',
          'cutoff = 20000 - (bowForce * 15000)'
        ]
      };
    }
    case 'brass': {
      const g = brassGesture(aftertouch);
      return {
        family,
        xps10: {
          ringModLayerLevel: Math.round(Math.min(1, g.harmonicEdgeGain) * 127),
          mainTvfCutoff: Math.round(g.cutoffNorm * 127),
          note: 'Aftertouch aumenta índice FM percebido via layer + ring mod.'
        },
        equations: [
          'modIndex = env * pressure * k',
          'carrier = sin(wc*t + modulator)'
        ]
      };
    }
    case 'vocal': {
      const g = vocalGesture(aftertouch);
      return {
        family,
        xps10: {
          pwmAmount: Math.round((1 - g.pulseWidth) * 127),
          formantEqShift: Math.round(Math.min(1.5, g.formantShift) / 1.5 * 127),
          note: 'Aftertouch comprime pulso/formante e adiciona drift humano.'
        },
        equations: [
          'P_WIDTH = 1 - (aftertouch*0.5)',
          'freq = baseFreq * (1 + drift)'
        ]
      };
    }
    default:
      return {
        family,
        xps10: {note: 'Sugestão/planejamento — não envia ao teclado automaticamente.'},
        equations: []
      };
  }
}
