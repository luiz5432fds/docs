# Plano Visual de Áudio "de Ponta" (Implementável)

Este plano transforma conceitos matemáticos em objetos visuais manipuláveis para o assistente de timbres.

## Camada 1 — Arquitetura espacial e hierárquica
- Navegação por páginas: Síntese, Score, Mix, Performance.
- Escala micro→macro (amostra até performance).
- Gráficos dinâmicos em tempo real para relações entre parâmetros.

## Camada 2 — Motor modular (paradigma Mathews)
- Patching visual com nós: Osc, Filter, Env, LFO, Mixer, FX.
- Grafo de fluxo de sinal com blocos matemáticos.
- Trajetórias de parâmetros para observar evolução temporal.

## Camada 3 — Laboratório granular (Roads/Truax)
- Grid tempo-frequência com "spray" de grãos.
- Densidade visual (transparência/opacidade) para nuvens estocásticas.
- Scrubbing circular para seleção de segmentos.
- Base DSP: overlap-add + janela Hann.

## Camada 4 — Mixagem semântica (DAFX)
- Controles perceptuais: Warmth, Presence, Width, Glue.
- Feedback adaptativo de ganho, sidechain e headroom.
- Edição por score gráfico para estruturas rítmicas/melódicas.

## Interação avançada
- Gestos/aftertouch alterando curvatura de envelope e modulação.
- Undo/Redo visual para reversibilidade.
- Modo palco: alto contraste, texto grande, botões grandes, trava de edição.

## Entrega no app
- Callable backend: `getVisualArchitecturePlan`.
- UI do assistente: botão para gerar plano visual + resumo no painel.
- Aviso de segurança: sem confirmação MIDI/SysEx, tratar como sugestão/planejamento.
