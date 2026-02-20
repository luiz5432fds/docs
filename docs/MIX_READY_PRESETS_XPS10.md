# Mix-Ready Presets para XPS-10 (uniformidade e presença)

## Objetivo
Entregar sinal consistente para FOH: presente na mix, sem picos agressivos e sem competir com voz/baixo/bumbo.

## Preset principal: "Invisible Mix"
- Input trim: `-6 dB`
- Compressor: `threshold -15 dB`, `ratio 4:1`, `attack 3 ms`, `release 80 ms`, `makeup +2 dB`
- Limiter final: `ceiling -1 dB`, `attack 0.3 ms`, `release 10 ms`, ratio `inf:1`
- HPF: `100 Hz` (ou `70 Hz` se não houver baixo/kick no arranjo)
- Unmasking vocal: notch `~1 kHz`, `-2 dB`, `Q 1.2`
- Presença: `~3.2 kHz`, `+1.5 a +2.5 dB`
- Ar: `~6.5 kHz`, `+1.2 dB`

## Respostas práticas às perguntas
### Como configurar o limiter no MFX para sinal uniforme?
1. Coloque o limiter no fim da cadeia.
2. Defina ceiling em torno de `-1 dB`.
3. Ataque rápido (`~0.3 ms`) para segurar transientes.
4. Release curto-médio (`~10 ms`) evitando pumping exagerado.

### Melhor razão FM para metais realistas?
- Base: `1:1` (harmônicos estáveis para brass).
- Variação de ataque: `3:1` para enfatizar caráter no início da nota.
- Índice de modulação sugerido: `0..5` com dinâmica/aftertouch.

### Aftertouch para brilho dinâmico
- Mapear aftertouch para:
  - aumento de cutoff
  - ganho de layer de edge/ring-mod
  - leve drive/saturação

## Aviso importante
Não existe “sinal perfeito para qualquer ganho possível”. Este preset é um baseline robusto e previsível, mas sempre exige ajuste final por sala/PA/arranjo.
