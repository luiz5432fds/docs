export type MixContext = {
  denseBand?: boolean;
  hasLeadVocal?: boolean;
  hasBassAndKick?: boolean;
  targetLufs?: number;
};

export function buildInvisibleMixPreset(ctx: MixContext) {
  const targetLufs = ctx.targetLufs ?? -16;
  const highPassHz = ctx.hasBassAndKick === false ? 70 : 100;
  const vocalSpaceCutHz = ctx.hasLeadVocal ? 1000 : 0;
  const presenceBoostDb = ctx.denseBand ? 1.5 : 2.5;

  return {
    gainStage: {
      inputTrimDb: -6,
      softClipDrive: 1.2,
      outputCeilingDb: -1.0
    },
    compressor: {
      thresholdDb: -15,
      ratio: 4.0,
      attackMs: 3,
      releaseMs: 80,
      makeupDb: 2
    },
    limiter: {
      thresholdDb: -1.2,
      ratio: 'inf:1',
      attackMs: 0.3,
      releaseMs: 10
    },
    eq: {
      highPassHz,
      lowShelf: {freqHz: 180, gainDb: -1.5},
      unmaskingNotch: vocalSpaceCutHz > 0 ? {freqHz: vocalSpaceCutHz, q: 1.2, gainDb: -2.0} : null,
      presence: {freqHz: 3200, q: 0.8, gainDb: presenceBoostDb},
      air: {freqHz: 6500, q: 0.7, gainDb: 1.2}
    },
    notes: [
      'Objetivo: presença sem sobressair, pronto para técnico FOH.',
      'Use HPF fixo para liberar baixo e bumbo.',
      'Limiter no final da cadeia para manter picos sob controle.'
    ],
    targetLufs
  };
}

export function brassFmRecommendation() {
  return {
    primaryRatio: '1:1',
    alternateRatio: '3:1 (ataque característico)',
    modIndexRange: [0, 5],
    tip: 'Vincular aftertouch/expressão ao índice de modulação percebido para brilho dinâmico.'
  };
}
