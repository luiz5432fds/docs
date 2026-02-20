# Multi-Language DSP Recipes (C++ / Assembly / MATLAB / BASIC) para XPS-10

## 1) C++/JUCE — Wavetable com interpolação linear
- Objetivo: leitura suave entre índices de tabela.
- Fórmula: `y = x[i]*(1-frac) + x[i+1]*frac`.
- Aplicação XPS-10: explica por que mudanças de pitch em PCM soam mais naturais quando a leitura interna é bem interpolada.

## 2) Assembly (SVF)
- Conceito: filtro de estado variável produz LP/HP/BP/Notch simultaneamente.
- Aplicação XPS-10: TVF + Resonance funcionam como o núcleo de coloração espectral/Q.

## 3) MATLAB — Compressor/Limiter
- Conceito: envelope RMS/Peak + ganho dependente de threshold/ratio/attack/release.
- Aplicação XPS-10: usar MFX compressor para segurar picos sem matar transientes.

## 4) Waveguide — Tubos e Cordas
- Equação: `y[n] = x[n-d] + a*y[n-d]`.
- Aplicação XPS-10: camadas (ataque + corpo) com ajuste de TVF e release para simular amortecimento.

## 5) LPC para voz/formante
- Conceito: separar fonte (residual) e filtro (trato).
- Aplicação XPS-10: aproximar formantes com EQ/TVF e layers vocais levemente desafinados.

## 6) BASIC FIR (convolução)
- Conceito: `Σ h[k] * x[n-k]`.
- Aplicação XPS-10: base matemática de equalização/coloração.

## Segredos de articulação (realismo)
- **Metais**: overshoot + brilho por velocity + expressão no edge.
- **Madeiras**: aftertouch abrindo filtro como “pressão de sopro”, noise de ar e micro-jitter de afinação.

## Segurança
Sempre marcar como controle lógico quando não houver mapeamento MIDI/SysEx confirmado:
- **“Sugestão/planejamento — não envia ao teclado automaticamente”**.
