# Articulações Avançadas e Realismo por Camadas (Roland XPS-10)

> Objetivo: transformar teoria (FM, aditiva, waveguide, granular) em **patch design aplicável** no XPS-10 usando waveforms, TVA/TVF, LFO, Velocity, controles de expressão e MFX.

## 1) Como implementar “FM” usando LFO no XPS-10 (aproximação)
O XPS-10 é PCM/LA, então a FM aqui é **simulada**:
1. Escolha um Tone base (portadora perceptual) com waveform estável.
2. Aplique LFO em Pitch com rate alto (20–80Hz), depth baixa/média.
3. Vincule depth do LFO à Velocity ou pedal para variar “índice de modulação” percebido.
4. Combine segundo Tone uma quinta/oitava acima para aumentar parciais laterais aparentes.

Equação de referência (FM clássica):
- `y(t) = A sin(2πf_c t + I sin(2πf_m t))`
- No XPS-10, `I` é aproximado por depth de modulação + dinâmica de execução.

## 2) Matemática prática dos metais (brass)
Princípio: brilho cresce com energia de excitação.
- Use `Cutoff = base + k * Velocity`.
- Envelope: ataque rápido com pequeno overshoot (Tone de ataque curto).
- Relação perceptual: maior amplitude => mais conteúdo harmônico alto.

Receita (camadas):
- Tone A (ataque): ruído/ataque brass, decay curto.
- Tone B (corpo): saw/brass sustain, cutoff com tracking por velocity.
- Tone C (edge): layer discreto com ring mod/mfx leve para “raspado”.

## 3) Ring Mod para sons metálicos/inarmônicos
Ring mod multiplica dois sinais:
- `y(t) = x1(t) * x2(t)`
Gera componentes soma/diferença e aumenta inarmonicidade.

Aplicação:
- Base + modulador desafinado (ex.: +7 semitons, ou ratio não inteiro via fine tune).
- Controle de mix por expressão para abrir no refrão/solo.
- Para sinos/gongs, combine com decay longo e filtros em bandas altas.

## 4) Receitas por famílias com articulações realistas

### Metais
- Staccato: ataque rápido, release curto, cutoff alto por velocity.
- Marcato: acrescente overshoot de volume e pitch transitório sutil.
- Swell: assign expressão para abrir cutoff e volume juntos.

### Madeiras
- Ataque de sopro: noise layer curto filtrado.
- Corpo: waveform mais “oca”, resonance moderada.
- Humanização: LFO aleatório mínimo em fine tune.

### Cordas
- Arco: attack médio, release médio-longo, micro variação de afinação.
- Pizzicato: layer percussivo com decay curto + corpo com lowpass.
- Legato fake: portamento leve + release controlado.

### Percussão
- Kick: seno + pitch envelope descendente rápido.
- Snare: tom + ruído filtrado.
- Bell/Gong: ring mod + ratio não inteiro + decay longo.

### Voz/Coral
- Formante aproximado: reforço em bandas fixas (EQ/TVF).
- Choir realista: 2-3 layers com micro desafinação e ataques desfasados.

### Pads/Texturas
- Attack longo, width alta, chorus/reverb moderados.
- Movimento: LFO lento em cutoff/pan; evite excesso em banda densa.

## 5) Técnica transversal de máximo realismo
1. **Micro-desfase entre layers** (ataques ligeiramente diferentes).
2. **Jitter de afinação controlado** (LFO random muito sutil).
3. **Crossfade por dinâmica** (velocity muda peso dos layers).
4. **Cena por trecho** (registrations para verso/refrão/solo).

## 6) Limites e segurança
- Nem todo controle é endereçável automaticamente por MIDI/SysEx no setup atual.
- Marque como: **“Sugestão/planejamento — não envia ao teclado automaticamente”** quando necessário.
- O app propõe aproximações; não garante clonagem perfeita.
