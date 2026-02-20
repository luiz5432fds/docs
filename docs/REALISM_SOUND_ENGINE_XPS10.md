# Realism Sound Engine para XPS-10 (síntese + acústico)

## Objetivo
Simular realidades sonoras (sintéticas e acústicas) com foco em controle gestual, EQ contextual e estabilidade de ganho para FOH.

## 1) Aftertouch em sintetizadores clássicos
- Abrir TVF/Cutoff progressivamente.
- Variar PWM em ondas quadradas.
- Introduzir vibrato gradual sob pressão.
- Escalar decaimento do envelope em tempo real.

## 2) Melhor configuração de EQ para madeiras
Preset base:
- HPF: 120 Hz
- Formante 1: 1.2 kHz (+1.5 dB, Q 1.1)
- Formante 2: 2.7 kHz (+1.2 dB, Q 1.2)
- Controle de aspereza: 4.2 kHz (-1.5 dB, Q 1.4)
- Unmasking: criar espaço de 1–3 kHz em instrumentos concorrentes

## 3) Jitter/drift para realismo
- Pitch jitter: ~1%
- Amplitude jitter: até ~20% (contextual)
- LFO aleatório: 8–20 Hz
- Fine tune random por layer: 2–20 cents (leve)

## 4) Cordas com pressão do arco (aftertouch)
- Mapear aftertouch -> bow force.
- Pressão alta reduz cutoff no loop (amortece harmônicos).
- Adicionar instabilidade controlada de pitch para stick-slip aproximado.

## 5) Metais FM realistas
- Ratio base: 1:1
- Ratio de ataque opcional: 3:1
- Índice de modulação: 0..5 com dinâmica/aftertouch

## 6) Coro orgânico com 4 Tones
- Detune leve por tone (ex.: -5, 0, +4, +9 cents).
- Ataques desencontrados (12ms, 18ms, 24ms, 32ms).
- Pan distribuído e modulação aleatória descorrelacionada.
- PWM/phase/delay micro-variados por tone.

## Segurança
- Não existe sinal absolutamente perfeito para qualquer estrutura de ganho.
- Usar presets como baseline robusta e ajustar por sala/PA.
- Sem confirmação MIDI/SysEx: **“Sugestão/planejamento — não envia ao teclado automaticamente”**.
