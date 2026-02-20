export function ringModProgrammingGuide() {
  return {
    setup: [
      'Use 2 Tones: Tone A (fundamental/corpo), Tone B (modulador/edge).',
      'Ative MFX com Ring Mod (quando disponível no algoritmo selecionado).',
      'Defina Tone B com afinação não-idêntica (ex.: +7 semitons ou fine tune não inteiro).'
    ],
    controls: {
      toneALevel: 90,
      toneBLevel: 40,
      toneBDetuneCents: 11,
      cutoff: 78,
      resonance: 52
    },
    liveTip: 'Mapeie aftertouch/expressão para subir o nível do Tone B no clímax.'
  };
}

export function laWaveformGuide() {
  return {
    attackTransient: ['PCM Attack', 'Noise Attack', 'Pluck Attack'],
    sustainBody: ['Saw/Square-like PCM', 'Warm Pad PCM', 'Brass Sustain PCM'],
    mapping: [
      'Tone 1 = ataque curto (transiente).',
      'Tone 2 = sustentação (corpo).',
      'Tone 3/4 = brilho/ambiência opcional com detune leve.'
    ],
    note: 'No XPS-10 use categorias de waveform próximas (Attack/Noise/Brass/Pad), variando TVA/TVF para LA perceptual.'
  };
}

export function driftLfoGuide() {
  return {
    lfoWave: 'Random / S&H',
    lfoRateHz: [10, 20],
    fineTuneRangeCents: [2, 12],
    pwmDriftDepth: 0.08,
    wowFlutterDelayMs: [2, 8],
    tip: 'Descorrelacione o drift por Tone para evitar modulação idêntica.'
  };
}

export function stringAftertouchCurves() {
  return {
    curves: [
      {name: 'Exponencial', use: 'mais sensível no início para stick-slip realista'},
      {name: 'Logarítmica', use: 'controle fino em altas pressões sem exagero'},
      {name: 'S-curve', use: 'compromisso musical para palco'}
    ],
    mapping: {
      bowForce: 'aftertouch',
      loopCutoffHz: '20000 - (15000 * pressure)',
      fastPitchLfoDepth: '0.003 + 0.01 * pressure'
    }
  };
}

export function metalAttackAsyncGuide() {
  return {
    concept: 'Harmônicos graves estabelecem antes dos agudos no ataque.',
    xps10: [
      'Tone 1 (corpo): ataque mais rápido.',
      'Tone 2 (brilho): ataque ~20-30ms mais lento.',
      'Opcional: Tone 3 para edge com nível baixo e entrada atrasada.'
    ]
  };
}
