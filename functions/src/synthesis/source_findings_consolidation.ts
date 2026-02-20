export type ConsolidationInput = {
  family?: string;
  targetBrightness?: number;
  targetDensity?: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function brassAdsrByIntent(brightness: number, density: number) {
  const b = clamp01(brightness);
  const d = clamp01(density);
  return {
    attackMs: Math.round(8 + (1 - b) * 20),
    decayMs: Math.round(90 + d * 180),
    sustain: Number((0.55 + d * 0.3).toFixed(2)),
    releaseMs: Math.round(120 + d * 260),
    note: 'Metais realistas: ataque rápido com brilho dinâmico e release controlado para evitar mascaramento.'
  };
}

export function buildSourceFindingsConsolidation(input: ConsolidationInput = {}) {
  const family = String(input.family ?? 'sintetizador');
  const brightness = clamp01(Number(input.targetBrightness ?? 0.6));
  const density = clamp01(Number(input.targetDensity ?? 0.45));

  return {
    directAnswers: {
      sysexTablesXps10: {
        status: 'Não há tabela SysEx oficial completa incluída neste repositório.',
        practicalPolicy: [
          'Tratar SysEx como integração opcional e desativada por padrão no MVP.',
          'Usar fallback com controles lógicos no app e mapeamentos MIDI CC quando possível.',
          'Registrar “não confirmado” para qualquer endereço/offset SysEx sem documentação oficial validada.'
        ],
        safeTemplate: 'F0 41 <deviceId> <modelId...> <address...> <data...> <checksum> F7'
      },
      phismPercussion: {
        explanation: 'PhISM combina excitação (impulso/ruído), ressonadores e não linearidades para emular impacto + corpo + perdas de energia.',
        recipe: [
          'Excitação curta (ruído ou pulso) com envelope rápido.',
          'Banco modal (ressonadores) para parciais principais da membrana/corpo.',
          'Damping dependente da frequência (agudos morrem antes).',
          'Saturação leve (tanh) para colisão/ataque mais natural.'
        ]
      },
      driftWarmth: {
        explanation: 'Drift adiciona microvariações descorrelacionadas de pitch/fase/amplitude entre camadas, reduzindo a rigidez digital.',
        practicalRange: {
          pitchPercent: [0.1, 1.0],
          driftRateHz: [0.08, 0.4],
          stereoDecorrelation: true
        }
      }
    },
    sourceFindingsSummary: [
      {
        pillar: 'Oscilador/Acumulador de Fase',
        finding: 'Núcleo de osciladores digitais; frequência controlada por incremento de fase com wrap.',
        code: 'phase=(phase+inc)%tableSize; out=lerp(wt[i],wt[i+1],frac);'
      },
      {
        pillar: 'FM/PM para metais e madeiras',
        finding: 'Razões racionais preservam harmonicidade; índice de modulação segue dinâmica para brilho realista.',
        code: 'y=sin(2πfc*t + I(env,vel)*sin(2πfm*t));'
      },
      {
        pillar: 'Waveguide / Karplus-Strong',
        finding: 'Modela perdas físicas com delay realimentado e filtro de loop.',
        code: 'y[n]=delay.read(); delay.write(0.5*(y[n]+y[n-1])*g);'
      },
      {
        pillar: 'Granular + Janela de Hanning',
        finding: 'Janelamento suave evita cliques nas bordas dos grãos em overlap-add.',
        code: 'grainWin = grain * hann(N); out[pos:pos+N]+=grainWin;'
      },
      {
        pillar: 'Mix-ready',
        finding: 'Limiter final + EQ contextual + normalização de loudness para presença sem excesso.',
        code: 'out=limiter(eq(compressor(signal)));'
      }
    ],
    implementationCode: {
      phaseAccumulatorTs: {
        snippet: [
          'let phase = 0;',
          'const inc = (freq * tableSize) / sampleRate;',
          'phase = (phase + inc) % tableSize;',
          'const i = Math.floor(phase); const a = phase - i;',
          'const out = wavetable[i] * (1 - a) + wavetable[(i + 1) % tableSize] * a;'
        ]
      },
      phismPercussionTs: {
        snippet: [
          'const hit = noise() * envPerc(0.002, 0.08);',
          'const body = modalBank(hit, [180, 330, 510], [0.996, 0.993, 0.989]);',
          'const out = Math.tanh((hit + body) * 1.4);'
        ]
      },
      driftTs: {
        snippet: [
          'const drift = lfoRandom(0.12, 0.003); // ~0.3% max',
          'osc1Freq = baseFreq * (1 + drift);',
          'osc2Freq = baseFreq * (1 - drift * 0.7);'
        ]
      },
      granularHannTs: {
        snippet: [
          'for (let n=0;n<N;n++) win[n]=0.5 - 0.5*Math.cos((2*Math.PI*n)/(N-1));',
          'for (let n=0;n<N;n++) out[pos+n] += grain[n] * win[n];'
        ]
      }
    },
    xps10PracticalMappings: {
      accumulatorOnXps10: 'Não programável diretamente no teclado; controlar resultado por waveform, pitch, fine tune e TVA/TVF.',
      brassAdsr: brassAdsrByIntent(brightness, density),
      hanningUse: 'Use envelopes curtos e crossfades em layers para simular bordas suaves de grão quando não houver motor granular nativo.',
      requestedFamily: family
    },
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
}
