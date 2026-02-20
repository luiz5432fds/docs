import * as admin from 'firebase-admin';
import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import {onObjectFinalized} from 'firebase-functions/v2/storage';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {runAgentsOrchestrator} from './orchestrator';
import {ingestPdfFromStorage} from './kb/pdf_ingest';
import {searchKbChunks} from './kb/search';
import {fmSignal, granularOverlay, karplusStrong, normalize, peakFilterCoefficient, phaseAccumulatorSaw} from './synthesis/algorithms';
import {basicFirStep, lpcResidualEstimate, simpleCompressorGainDb, waveguideStep, wavetableLinearInterpolation} from './synthesis/advanced_playbook';
import {mapGestureToXps10} from './synthesis/gesture_engine';
import {brassFmRecommendation, buildInvisibleMixPreset} from './synthesis/mix_bus';
import {jitterDriftPreset, mapRealismToolkit} from './synthesis/realism_toolkit';
import {driftLfoGuide, laWaveformGuide, metalAttackAsyncGuide, ringModProgrammingGuide, stringAftertouchCurves} from './synthesis/xps10_programming';
import {buildIntelligentTimbreAlgorithm} from './synthesis/intelligent_assistant_algorithm';
import {buildSourceFindingsConsolidation} from './synthesis/source_findings_consolidation';
import {buildVisualArchitecturePlan} from './synthesis/visual_architecture_plan';

admin.initializeApp();

function mapDescriptors(descriptors: string[]) {
  let cutoff = 64;
  let resonance = 40;
  let attack = 24;
  let release = 50;
  let chorus = 35;
  let reverb = 45;

  for (const raw of descriptors) {
    const d = String(raw).toLowerCase().trim();
    if (d === 'quente') { cutoff -= 12; resonance += 6; release += 10; }
    else if (d === 'brilhante') { cutoff += 16; resonance += 4; }
    else if (d === 'áspero' || d === 'aspero') { resonance += 18; }
    else if (d === 'largo') { chorus += 18; reverb += 14; }
    else if (d === 'seco') { reverb -= 18; chorus -= 8; }
    else if (d === 'percussivo') { attack -= 10; release -= 10; }
  }

  const clamp = (v: number) => Math.max(0, Math.min(127, v));
  return { cutoff: clamp(cutoff), resonance: clamp(resonance), attack: clamp(attack), release: clamp(release), chorus: clamp(chorus), reverb: clamp(reverb) };
}


function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function assertAuth(req: any): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Faça login para continuar.');
  return uid;
}

export const runAgents = onCall(async (request: any) => {
  const uid = assertAuth(request);
  return runAgentsOrchestrator(uid, request.data ?? {});
});

export const generatePatch = onCall(async (request: any) => {
  const uid = assertAuth(request);
  const result = await runAgentsOrchestrator(uid, request.data ?? {});
  return {
    patch: {
      name: result.merged.name ?? 'Patch IA',
      category: result.merged.category ?? 'Synth',
      tags: result.merged.styleHints ?? [],
      macro: result.merged.macro,
      panel: result.merged.panel,
      mixHints: result.merged.mixHints,
      recipeSteps: result.merged.recipeSteps,
      variants: {
        verso: {macro: result.merged.macro, panel: result.merged.panel},
        refrão: {macro: {...result.merged.macro, width: 78, air: 70}, panel: {...result.merged.panel, reverb: 70}},
        solo: {macro: {...result.merged.macro, bite: 68, brightness: 72}, panel: {...result.merged.panel, cutoff: 102, resonance: 56}}
      },
      agentAudit: result.agents
    }
  };
});

export const evaluatePatch = onCall(async (request: any) => {
  assertAuth(request);
  const panel = request.data?.panel ?? {};
  const issues: string[] = [];
  const suggestions: string[] = [];

  if ((panel.reverb ?? 0) > 95) {
    issues.push('Reverb alto para arranjo denso.');
    suggestions.push('Reduza Reverb para faixa de 40..65.');
  }
  if ((panel.resonance ?? 0) > 100) {
    issues.push('Resonance exagerada pode causar aspereza.');
    suggestions.push('Tente resonance entre 40..75 e compense com bite.');
  }

  return {
    issues,
    suggestions,
    quickAdjust: {
      reverb: Math.min(panel.reverb ?? 0, 65),
      resonance: Math.min(panel.resonance ?? 0, 75)
    }
  };
});

export const likePublicPatch = onCall(async (request: any) => {
  assertAuth(request);
  const patchId = String(request.data?.patchId ?? '');
  if (!patchId) throw new HttpsError('invalid-argument', 'patchId é obrigatório.');
  const ref = admin.firestore().collection('publicPatches').doc(patchId);
  await ref.set({likes: admin.firestore.FieldValue.increment(1)}, {merge: true});
  return {ok: true};
});


export const mapSemanticDescriptor = onCall(async (request: any) => {
  assertAuth(request);
  const descriptors = (request.data?.descriptors ?? []) as string[];
  const mapped = mapDescriptors(descriptors);
  return {panel: mapped};
});

export const getRecipeCatalog = onCall(async (request: any) => {
  assertAuth(request);
  return {
    families: [
      {name: 'Piano/EP', tips: ['Attack curto', 'Reverb plate curto', 'Cutoff médio-alto']},
      {name: 'Órgãos', tips: ['Attack mínimo', 'Release curto', 'Chorus/rotary moderado']},
      {name: 'Strings/Pad', tips: ['Attack lento', 'Release longo', 'Hall moderado']},
      {name: 'Brass', tips: ['Attack rápido', 'Cutoff médio-alto', 'Resonance moderada']},
      {name: 'Leads', tips: ['Presença em 2~5kHz', 'Cutoff alto', 'Delay curto']},
      {name: 'Bass', tips: ['Foco 60..120Hz', 'Release curto', 'Resonance sob controle']},
      {name: 'Bell/FM-like', tips: ['LFO rápido em pitch', 'Decay médio', 'Sustain baixo']},
      {name: 'Choir/Vox', tips: ['Attack médio-lento', 'Reverb amplo', 'Resonance baixa']},
      {name: 'FX/Atmosfera', tips: ['LFO lento', 'Reverb grande', 'Registro dedicado']}
    ]
  };
});


export const getArticulationIdeas = onCall(async (request: any) => {
  assertAuth(request);
  return {
    families: {
      metais: ['Velocity -> Cutoff para brilho dinâmico', 'Layer de ataque curto com overshoot', 'Expressão para abrir edge no solo'],
      madeiras: ['Noise de sopro filtrado no ataque', 'LFO random mínimo no fine tune', 'Envelope com brilho inicial e estabilização'],
      cordas: ['Micro-desfase entre layers', 'Pizzicato com decay curto', 'Legato com portamento leve'],
      percussao: ['Kick com pitch descendente rápido', 'Snare com tom + ruído', 'Bell/Gong com ring mod e decay longo'],
      vocal: ['Formantes aproximados via EQ/TVF', '2-3 layers com micro desafinação', 'Ataques defasados para coro orgânico'],
      pads: ['Attack longo e movimento lento de cutoff/pan', 'Chorus/reverb moderados', 'Registrations por trecho']
    },
    notes: [
      'Sugestão/planejamento — não envia ao teclado automaticamente quando não houver mapeamento MIDI/SysEx confirmado.',
      'Aproximação musical: não representa clonagem perfeita do instrumento de referência.'
    ]
  };
});


export const getSynthesisCodebook = onCall(async (request: any) => {
  assertAuth(request);
  const sampleRate = Number(request.data?.sampleRate ?? 44100);
  const len = Number(request.data?.length ?? 2048);

  const phase = normalize(phaseAccumulatorSaw(len, 440 / sampleRate));
  const fm = normalize(fmSignal(len, sampleRate, 440, 440, 4.0));
  const ks = normalize(karplusStrong(len, Math.floor(sampleRate / 220), 0.994));
  const gran = normalize(granularOverlay(phase, 30, 80, 240));
  const peakD = peakFilterCoefficient(0.42);

  return {
    formulas: {
      oscillator: 'S[i+1] = S[i] + I; O[i] = A*F(S mod L)',
      fm: 'y(t)=A*sin(2πfc*t + I*sin(2πfm*t))',
      waveguide: 'y[n] = 0.5*(x[p]+x[p+1])*g (Karplus-Strong loop)',
      granular: 'Overlap-add com grãos janelados (Hann)',
      filterPeak: 'd = -cos(pi*Wc)'
    },
    snippets: {
      phaseAccumulator: Array.from(phase.slice(0, 16)),
      fm: Array.from(fm.slice(0, 16)),
      karplusStrong: Array.from(ks.slice(0, 16)),
      granular: Array.from(gran.slice(0, 16)),
      peakCoefficient: peakD
    },
    mappingXps10: {
      waveform: 'Tabela F (wave PCM/LA)',
      tva: 'Envelope de amplitude',
      tvfCutoff: 'Coeficiente espectral principal',
      layering: 'Somatório de fontes por Tone',
      warning: 'Sugestão/planejamento — não envia ao teclado automaticamente sem mapeamento MIDI/SysEx confirmado'
    }
  };
});


export const getAdvancedDspPlaybook = onCall(async (request: any) => {
  assertAuth(request);

  const table = [0, 0.6, 1.0, 0.6, 0, -0.6, -1.0, -0.6];
  const interp = wavetableLinearInterpolation(2.35, table);
  const gainDb = simpleCompressorGainDb(-8, -18, 4);
  const wg = waveguideStep(0.25, 0.41, 0.97);
  const residual = lpcResidualEstimate([0.1, 0.2, 0.15, -0.05, 0.03], [1, -0.8, 0.21]);
  const fir = basicFirStep([0.2, 0.1, -0.1, 0.05], [0.5, 0.3, 0.15, 0.05]);

  return {
    categories: {
      wavetableCpp: {
        formula: 'y = w1*x[n] + w2*x[n+1] (interpolação linear)',
        sample: interp,
        xps10: 'Leitura suave de waveform PCM para transposição sem aspereza perceptiva'
      },
      svfAssembly: {
        concept: 'SVF produz LP/HP/BP/Notch simultaneamente',
        xps10: 'TVF Cutoff/Resonance equivalem ao controle central/fator Q'
      },
      compressorMatlab: {
        formula: 'G = f(threshold, ratio, envelope attack/release)',
        gainDb,
        xps10: 'MFX compressor/limiter para controle dinâmico'
      },
      waveguide: {
        formula: 'y[n] = x[n-d] + a*y[n-d]',
        sample: wg,
        xps10: 'Camada de ataque + sustain com feedback perceptual'
      },
      lpcVoice: {
        concept: 'Separação fonte/filtro via residual',
        residualPreview: residual.slice(0, 4),
        xps10: 'Aproximação de formantes por EQ/TVF e layering vocal'
      },
      firBasic: {
        formula: 'convolução direta Σ h[k]x[n-k]',
        sample: fir,
        xps10: 'Base conceitual para EQ e coloração espectral'
      }
    },
    articulationSecrets: {
      brass: [
        'Ataque com overshoot curto em layer dedicado',
        'Velocity abrindo cutoff para brilho proporcional',
        'Expressão para aumentar edge apenas no clímax'
      ],
      woodwinds: [
        'Aftertouch para abrir TVF levemente (pressão de sopro simulada)',
        'Noise layer sutil de sopro',
        'LFO random mínimo no fine tune para instabilidade humana'
      ]
    },
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
});


export const getGestureArticulationEngine = onCall(async (request: any) => {
  assertAuth(request);
  const family = String(request.data?.family ?? 'woodwinds') as any;
  const aftertouch = Number(request.data?.aftertouch ?? 0.5);
  const mapped = mapGestureToXps10(family, aftertouch);

  return {
    input: {family, aftertouch},
    mapped,
    realismSecrets: [
      'Assincronia de ataque: graves estabelecem antes dos agudos em metais (~20-30ms).',
      'Soft clipping (tanh) para corpo e saturação musical.',
      'Micro-jitter de afinação para evitar repetição mecânica.',
      'PCM de ataque + camada sintética controlada por pressão.'
    ],
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
});


export const getMixReadyPreset = onCall(async (request: any) => {
  assertAuth(request);
  const ctx = (request.data ?? {}) as any;
  const preset = buildInvisibleMixPreset({
    denseBand: Boolean(ctx.denseBand ?? true),
    hasLeadVocal: Boolean(ctx.hasLeadVocal ?? true),
    hasBassAndKick: Boolean(ctx.hasBassAndKick ?? true),
    targetLufs: Number(ctx.targetLufs ?? -16)
  });

  return {
    preset,
    xps10Application: [
      'MFX compressor: threshold -15dB, ratio 4:1, attack curto, release médio.',
      'Limiter no final: ceiling ~ -1dB, ataque rápido.',
      'TVF/eq: corte de mascaramento em torno de 1kHz quando vocal principal estiver presente.'
    ],
    warning: 'Sinal perfeito absoluto não existe; usar como baseline robusta para diferentes estruturas de ganho.'
  };
});

export const getBrassFmGuide = onCall(async (request: any) => {
  assertAuth(request);
  return brassFmRecommendation();
});


export const getRealismToolkit = onCall(async (request: any) => {
  assertAuth(request);
  const family = String(request.data?.family ?? 'classicSynth') as any;
  const aftertouch = Number(request.data?.aftertouch ?? 0.5);
  const jitterAmount = Number(request.data?.jitterAmount ?? 0.01);

  return {
    toolkit: mapRealismToolkit(family, aftertouch),
    jitter: jitterDriftPreset(jitterAmount),
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
});



export const getIntelligentAssistantAlgorithm = onCall(async (request: any) => {
  assertAuth(request);
  const payload = (request.data ?? {}) as any;
  const algorithm = buildIntelligentTimbreAlgorithm({
    family: payload.family,
    brightnessTarget: payload.brightnessTarget,
    densityTarget: payload.densityTarget,
    acousticness: payload.acousticness,
    aftertouch: payload.aftertouch,
  });

  return {
    algorithm,
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
});


export const getSourceFindingsConsolidation = onCall(async (request: any) => {
  assertAuth(request);
  const payload = (request.data ?? {}) as any;
  return buildSourceFindingsConsolidation({
    family: payload.family,
    targetBrightness: payload.targetBrightness,
    targetDensity: payload.targetDensity,
  });
});


export const getVisualArchitecturePlan = onCall(async (request: any) => {
  assertAuth(request);
  const payload = (request.data ?? {}) as any;
  return buildVisualArchitecturePlan({
    focus: payload.focus,
    stageMode: payload.stageMode,
  });
});

export const getXps10ProgrammingGuide = onCall(async (request: any) => {
  assertAuth(request);
  return {
    ringMod: ringModProgrammingGuide(),
    laWaveforms: laWaveformGuide(),
    drift: driftLfoGuide(),
    stringsAftertouch: stringAftertouchCurves(),
    brassAsyncAttack: metalAttackAsyncGuide(),
    safety: 'Sugestão/planejamento — não envia ao teclado automaticamente sem confirmação MIDI/SysEx.'
  };
});

export const searchKB = onCall(async (request: any) => {
  const uid = assertAuth(request);
  const query = String(request.data?.query ?? '');
  if (!query.trim()) throw new HttpsError('invalid-argument', 'query é obrigatório.');
  const hits = await searchKbChunks(uid, query, 5);
  return {hits};
});

export const onPdfUploaded = onObjectFinalized(async (event: any) => {
  const path = event.data.name ?? '';
  if (!path.startsWith('users/') || !path.endsWith('.pdf')) return;
  const [_, uid, ...rest] = path.split('/');
  const fileName = rest[rest.length - 1];
  const baseDocId = fileName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const docId = `${uid}_${baseDocId}`;
  await ingestPdfFromStorage(uid, docId, event.data.bucket, path, fileName);
});

export const onPatchWrite = onDocumentWritten('users/{uid}/patches/{patchId}', async (event: any) => {
  const after = event.data?.after;
  const before = event.data?.before;
  const patchId = event.params.patchId;

  if (!after?.exists) {
    if (before?.exists) {
      await admin.firestore().collection('publicPatches').doc(patchId).delete().catch(() => undefined);
    }
    return;
  }

  const uid = event.params.uid;
  const data = after.data() ?? {};
  const prev = before?.data() ?? {};

  const normalizedTags = Array.from(new Set((data.tags ?? []).map((t: string) => String(t).trim().toLowerCase()).filter(Boolean))) as string[];
  const nextVersion = before?.exists ? Number(prev.version ?? 0) + 1 : 1;
  const currentVersion = Number(data.version ?? 0);
  const currentTags = ((data.tags ?? []) as string[]).map((t) => String(t));
  const needsPatchUpdate = !arraysEqual(currentTags, normalizedTags) || currentVersion !== nextVersion;

  if (needsPatchUpdate) {
    await after.ref.set({
      tags: normalizedTags,
      version: nextVersion,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, {merge: true});
  }

  const finalVersion = needsPatchUpdate ? nextVersion : currentVersion;
  const pubRef = admin.firestore().collection('publicPatches').doc(patchId);
  if (data.isPublic) {
    await pubRef.set({
      ...data,
      ownerUid: uid,
      patchId,
      tags: normalizedTags,
      version: finalVersion,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, {merge: true});
  } else {
    await pubRef.delete().catch(() => undefined);
  }
});
