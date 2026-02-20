export type VisualPlanInput = {
  focus?: 'modular' | 'granular' | 'mix' | 'full';
  stageMode?: boolean;
};

export function buildVisualArchitecturePlan(input: VisualPlanInput = {}) {
  const focus = input.focus ?? 'full';
  const stageMode = Boolean(input.stageMode ?? false);

  return {
    title: 'Plano Visual de Ponta para Assistente de Criação de Timbres',
    focus,
    layers: {
      spatialHierarchy: {
        concept: 'Navegação micro→macro em páginas (síntese, score, mix, performance).',
        screens: ['Página de Síntese', 'Página de Score', 'Página de Mixagem', 'Modo Performance'],
        widgets: ['Mapa de níveis', 'HUD de parâmetros globais', 'Indicadores de faixa dinâmica']
      },
      modularSynthesis: {
        concept: 'Fluxo Mathews-style por módulos interconectados (UGens).',
        nodes: ['Osc', 'Filter', 'Env', 'LFO', 'Mixer', 'FX'],
        interactions: ['Patch por cabos virtuais', 'Trajetórias de parâmetros', 'Comparação A/B']
      },
      granularCloudLab: {
        concept: 'Grid tempo-frequência com partículas/grãos e densidade estocástica.',
        interactions: ['Spray de grãos', 'Scrubbing circular', 'Controle de opacidade por densidade'],
        mathHint: 'OLA + janela Hann para evitar cliques'
      },
      semanticMixing: {
        concept: 'Controle perceptual (quente, brilhante, largo, vários artistas) mapeado para DSP.',
        controls: ['Warmth', 'Presence', 'Glue', 'Width', 'Headroom Guard'],
        adaptiveView: ['Ganhos em tempo real', 'Sidechain visual', 'Limiter ceiling monitor']
      }
    },
    interactionModel: {
      gesturalAftertouch: 'Pressão altera curvatura de envelopes e intensidade de modulação.',
      reversibility: 'Undo/Redo visual com trilha de estados.',
      stageMode: {
        enabled: stageMode,
        traits: ['alto contraste', 'texto grande', 'botões grandes', 'travar edição']
      }
    },
    implementationRoadmap: [
      'Fase 1: painel hierárquico + navegação por páginas',
      'Fase 2: patching modular visual + grafo de sinal',
      'Fase 3: laboratório granular em grid tempo-frequência',
      'Fase 4: mapeamento semântico + feedback adaptativo de mix',
      'Fase 5: performance/gestos e validação com presets reais'
    ],
    safety: 'Sugestão/planejamento — controles dependem de mapeamento MIDI/SysEx confirmado para envio ao hardware.'
  };
}
