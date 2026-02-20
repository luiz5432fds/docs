# Algoritmo Automatizado do Assistente Inteligente de Timbres

Este documento consolida o fluxo hierárquico usado pelo assistente para transformar intenção musical em proposta prática de patch para o Roland XPS-10.

## 1) Entrada e Análise
- Estima `f0` (fundamental) inicial.
- Calcula centróide espectral normalizado (proxy de brilho).
- Estima harmonicidade do sinal de referência.
- Gera PMF simples por bandas (`grave`, `médio`, `agudo`) para orientar unmasking e EQ.

## 2) Seletor de Paradigma de Síntese
- `fm_pm`: metais e madeiras com brilho dinâmico.
- `waveguide`: cordas/sopros quando o alvo é mais acústico.
- `granular`: texturas densas e atmosféricas.
- `hybrid_pcm_va`: fallback prático para fluxo LA/PCM em workstation.

## 3) Unidades Geradoras (DSP Base)
- Acumulador de fase (`S[i+1]=S[i]+I`).
- Interpolação linear de wavetable.
- Controle de ganho ADSR.

## 4) Articulação e Realismo Adaptativo
- Mapeamento de aftertouch/velocity para parâmetros físicos por família.
- `Antiquing`: jitter de ~1% com LFO lento aleatório.
- Soft clipping (`tanh`) para saturação musical.

## 5) Condicionamento de Saída (Mix Ready)
- Preset de dinâmica estilo “Invisible Mix”.
- EQ de formantes e unmasking por contexto.
- Política de loudness com limiter final e teto de segurança.

## Resultado
O assistente retorna:
- análise técnica,
- modo de síntese escolhido com justificativa,
- proposta de painel XPS-10 (`cutoff`, `resonance`, `attack`, `release`, `chorus`, `reverb`),
- recomendações de articulação e mix para palco/FOH.

> Aviso: quando não houver mapeamento MIDI/SysEx confirmado, o retorno é tratado como sugestão/planejamento (sem envio automático ao teclado).
