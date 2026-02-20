# Arcabouço Matemático Fundamental (Síntese Digital aplicada ao XPS-10)

## 1) Oscilador digital (acumulador de fase)
A frequência percebida nasce do incremento de fase `I` aplicado ao acumulador `S` a cada amostra:

- `S[i+1] = S[i] + I`
- `O[i] = A * F(S[i] mod L)`

Onde:
- `A` = amplitude,
- `F` = forma de onda (tabela),
- `L` = tamanho da tabela.

**Interpretação prática no XPS-10:** ao ajustar parâmetros de afinação, wave e abertura de filtro, você altera o resultado da função de oscilação e do conteúdo espectral.

## 2) Síntese aditiva (Fourier)
Um timbre pode ser visto como soma de harmônicos:

- `Waveform = Σ (A_n * sin(nωt + φ_n))`

**Aplicação no editor:** controles de Cutoff/Resonance e EQ mudam o peso relativo dos harmônicos percebidos (brilho, presença, aspereza).

## 3) Modulação de Frequência (FM)
Modelo clássico (Chowning):

- `e = A * sin(αt + I * sin(βt))`

Onde `α` é portadora, `β` moduladora e `I` índice de modulação.

**Aplicação no fluxo de design:** mesmo sem editar um algoritmo FM “puro” no XPS-10, o comportamento de modulações rápidas e riqueza tímbrica pode ser aproximado via LFO, envelope e combinação de camadas.

## 4) Envelopes (TVA/TVF)
No app, Attack/Release representam o conceito de envelope de amplitude/filtro.

- Ataque rápido: metais e leads com definição.
- Ataque lento: pads e cordas mais suaves.
- Release longo: ambiência; cuidado em arranjo denso.

## 5) Filtro e efeitos no contexto de banda
- **Cutoff**: controla quão “aberto” é o timbre.
- **Resonance**: reforço na frequência de corte; excesso pode soar agressivo.
- **Chorus/Reverb**: espacialidade. Em banda cheia, use com moderação.

## Nota de segurança musical
O app não promete clonagem perfeita de timbres nem de áudio. O módulo de “Decodificar Som (Aproximação)” gera sugestões limitadas aos controles disponíveis no XPS-10.
