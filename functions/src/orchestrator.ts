import {knowledgeAgent} from './agents/knowledge_agent';
import {mixAgent} from './agents/mix_agent';
import {performanceAgent} from './agents/performance_agent';
import {styleAgent} from './agents/style_agent';
import {synthAgent} from './agents/synth_agent';

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
