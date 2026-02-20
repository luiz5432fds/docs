# XPS-10 AI Workstation (PT-BR)

## Visão do produto
Aplicativo Android em Flutter para criação, edição e performance de timbres inspirados no Roland XPS-10, com suporte a IA multi-provider, biblioteca pública e fluxo de palco.

## Princípios
- **Idioma**: 100% Português (Brasil).
- **UI**: inspirada em editor estilo Juno/console, tema escuro, controles grandes e agrupados.
- **Segurança musical**: sem promessa de clonagem perfeita de áudio; sempre comunicar aproximação.
- **MIDI/SysEx**: `SysexAdapter` existe, mas desativado por padrão.
- **Provedor IA padrão**: Firebase Functions (fallback obrigatório).

## Módulos funcionais
1. Login Google com Firebase Authentication.
2. Geração de timbres com IA (`generatePatch`).
3. Avaliação de encaixe em banda (`evaluatePatch`).
4. Orquestração multi-agente (`runAgents`).
5. Editor de patch (OSC/FILTER/AMP/LFO/FX/EQ + painel XPS-10).
6. Modo Performance (Setlist, Next/Prev gigante, lock e freeze).
7. Decodificar Som (Aproximação) com aviso de limitação.
8. Comunidade (publicar/copiar/curtir patches).
9. Base de conhecimento com ingestão de PDF e busca.
