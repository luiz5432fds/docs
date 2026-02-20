# Synthesis Codebook XPS-10 (5 categorias técnicas)

Este documento consolida as 5 categorias solicitadas: FM, granular, waveguide, DAFX e oscilador fundamental, com tradução direta para menus do XPS-10.

## 1) FM (frequência modulada)
- Equação: `y(t)=A*sin(2πfc*t + I*sin(2πfm*t))`
- Prática: simular no XPS-10 com LFO rápido em pitch + layer desafinado + ring mod/MFX.
- Use razões aproximadas por Fine Tune/Tone pitch para timbres brass/bell.

## 2) Granular
- Ideia: nuvens de grãos curtos com overlap-add e janela Hann.
- Prática: importar samples curtos, fazer layers com diferentes delays/envelopes para densidade.

## 3) Waveguide / Karplus-Strong
- Ideia: linha de atraso + filtro no loop para cordas dedilhadas.
- Prática: layer de ataque ruidoso + camada cíclica sustentada com TVF controlando amortecimento.

## 4) DAFX / filtros dinâmicos
- Coeficiente típico: `d = -cos(pi*Wc)` para frequência central normalizada.
- Prática: TVF cutoff/resonance equivalem ao controle central da “cor espectral”; MFX para caráter.

## 5) Oscilador por acumulador de fase
- Equação: `S[i+1]=S[i]+I`; saída por lookup/tabela.
- Prática: waveform do Tone é a função F, TVA aplica envelope, layering soma fontes.

## Mapeamento direto no teclado
1. **Waveform** = tabela/forma base
2. **TVA** = envelope de amplitude
3. **TVF Cutoff/Resonance** = modelagem espectral
4. **Layer de Tones** = soma de fontes + articulação
5. **MFX/Chorus/Reverb** = espacialidade e caráter

## Segurança de operação
- Quando não houver confirmação de mapeamento MIDI/SysEx, exibir:
  - **“Sugestão/planejamento — não envia ao teclado automaticamente”**
- O sistema é de aproximação de timbre, não de clonagem perfeita.
