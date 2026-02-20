# Guia de Programação XPS-10 (Ring Mod, LA, Drift e Articulação)

## 1) Como programar Ring Mod no XPS-10
1. Configure 2 Tones:
   - Tone A = corpo/fundamental
   - Tone B = modulador/edge
2. Selecione algoritmo MFX com Ring Mod (quando disponível).
3. Ajuste detune do Tone B (ex.: +7 semitons ou +11 cents).
4. Use aftertouch/expressão para aumentar nível do Tone B no clímax.

## 2) Melhores waveforms para síntese LA (prática)
- Ataque: categorias PCM de ataque/ruído/pluck.
- Sustentação: saw/square-like pad/brass sustain.
- Estratégia de layers:
  - Tone 1: ataque curto
  - Tone 2: corpo sustentado
  - Tone 3/4: brilho e ambiência com detune leve

## 3) Drift analógico com LFO
- Forma de onda: Random / Sample&Hold.
- Taxa: 10–20 Hz.
- Profundidade de Fine Tune: 2–12 cents.
- Descorrelacione por tone para evitar movimento idêntico.

## 4) Segredos de articulação realista
### Madeiras
- Aftertouch aumenta ruído de sopro + cutoff principal.
- EQ com foco em formantes 1.2kHz / 2.7kHz.

### Cordas
- Aftertouch mapeado para pressão de arco.
- Curvas recomendadas: exponencial, logarítmica, S-curve.
- Pressão alta reduz cutoff do loop e adiciona instabilidade controlada.

### Metais
- FM base 1:1 para harmônicos estáveis.
- Opção 3:1 para ataque característico.
- Assincronia de ataque: brilho entra 20–30ms depois do corpo.

## 5) Limitações práticas
- Nem todos os mapeamentos são diretamente endereçáveis no hardware sem MIDI/SysEx confirmado.
- Quando não confirmado, tratar como:
  - **“Sugestão/planejamento — não envia ao teclado automaticamente”**.
