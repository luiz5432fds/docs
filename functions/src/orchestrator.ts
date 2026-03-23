import {knowledgeAgent} from './agents/knowledge_agent';
import {mixAgent} from './agents/mix_agent';
import {performanceAgent} from './agents/performance_agent';
import {styleAgent} from './agents/style_agent';
import {synthAgent} from './agents/synth_agent';
import {composerAgent} from './agents/composer_agent';
import {arrangerAgent} from './agents/arranger_agent';
import {theoristAgent} from './agents/theorist_agent';
import {regionalAgent} from './agents/regional_agent';
import {notationAgent} from './agents/notation_agent';
import {reaperAgent} from './agents/reaper_agent';

export async function runAgentsOrchestrator(uid: string, input: any) {
  const [synth, mix, performance, style, knowledge] = await Promise.all([
    synthAgent(input),
    mixAgent(),
    performanceAgent(),
    styleAgent(input),
    knowledgeAgent(uid, String(input?.query ?? input?.style ?? 'síntese'))
  ]);

  return {
    agents: {synth, mix, performance, style, knowledge},
    merged: {
      ...synth,
      mixHints: mix.mixHints,
      performanceTips: performance.performanceTips,
      styleHints: style.styleHints,
      knowledgeHints: knowledge.knowledgeHints
    }
  };
}

/**
 * SynKrony Multi-Agent Orchestrator
 * Coordinates music production AI agents for Brazilian regional music
 */
export async function runSynKronyOrchestrator(uid: string, input: any) {
  const context = {
    genre: input?.genre ?? 'brega_romantico',
    key: input?.key ?? 'C',
    tempo: input?.tempo ?? 120,
    timeSignature: input?.timeSignature ?? '4/4',
    bars: input?.bars ?? 32,
  };

  // Run core composition agents in parallel
  const [composer, theorist, regional] = await Promise.all([
    composerAgent({
      genre: context.genre,
      key: context.key,
      tempo: context.tempo,
      timeSignature: context.timeSignature,
      bars: context.bars,
    }),
    theoristAgent({
      key: context.key,
      genre: context.genre,
    }),
    regionalAgent({
      genre: context.genre,
      composition: null, // Will be filled by composer
    }),
  ]);

  // Arranger depends on composer output
  const arranger = await arrangerAgent({
    composition: composer.score,
    genre: context.genre,
    density: input?.density ?? 'medium',
  });

  // Export agents run in parallel
  const [notation, reaper] = await Promise.all([
    notationAgent({
      score: composer.score,
      title: input?.title ?? 'SynKrony Composition',
      composer: input?.composerName ?? 'SynKrony AI',
    }),
    reaperAgent({
      score: composer.score,
      arrangement: arranger.arrangement,
      tempo: context.tempo,
      title: input?.title ?? 'SynKrony Composition',
    }),
  ]);

  return {
    agents: {composer, theorist, regional, arranger, notation, reaper},
    context,
    output: {
      score: composer.score,
      arrangement: arranger.arrangement,
      musicxml: notation.musicxml,
      reaperProject: reaper.projectFile,
      analysis: {
        partimentoAnalysis: composer.analysis,
        theoryAnalysis: theorist.analysis,
        regionalAdaptations: regional.adaptations,
        counterpointReport: arranger.counterpointReport,
      },
    },
  };
}

/**
 * Run individual SynKrony agent
 */
export async function runSynKronyAgent(agent: string, input: any) {
  switch (agent) {
    case 'composer':
      return composerAgent(input);
    case 'arranger':
      return arrangerAgent(input);
    case 'theorist':
      return theoristAgent(input);
    case 'regional':
      return regionalAgent(input);
    case 'notation':
      return notationAgent(input);
    case 'reaper':
      return reaperAgent(input);
    default:
      throw new Error(`Unknown SynKrony agent: ${agent}`);
  }
}
