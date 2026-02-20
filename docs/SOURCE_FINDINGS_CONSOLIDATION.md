# Consolidação das Fontes em Algoritmo (Assistente Inteligente)

Este guia responde diretamente às perguntas práticas e traduz os achados em blocos de código integráveis ao app.

## 1) Tabelas MIDI SysEx do Roland XPS-10
- Neste projeto **não há tabela SysEx oficial completa validada** para o XPS-10.
- Estratégia segura no app:
  1. manter `SysexAdapter` desativado por padrão;
  2. usar fallback com controle lógico + MIDI CC quando disponível;
  3. só habilitar envio SysEx com documentação oficial confirmada.

Template genérico de quadro SysEx:
```text
F0 41 <deviceId> <modelId...> <address...> <data...> <checksum> F7
```

## 2) Como a síntese física (PhISM) gera percussões realistas
- Combina **excitação curta** + **ressonadores modais** + **perdas dependentes da frequência** + **não linearidade**.
- Resultado: ataque crível, corpo ressonante e decaimento natural.

Exemplo TypeScript:
```ts
const hit = noise() * envPerc(0.002, 0.08);
const body = modalBank(hit, [180, 330, 510], [0.996, 0.993, 0.989]);
const out = Math.tanh((hit + body) * 1.4);
```

## 3) Como o drift confere calor
- Drift introduz microvariação descorrelacionada entre camadas (pitch/fase/amplitude).
- Isso reduz a sensação “estática” do digital e aumenta vivacidade.

Exemplo:
```ts
const drift = lfoRandom(0.12, 0.003); // ~0.3%
osc1Freq = baseFreq * (1 + drift);
osc2Freq = baseFreq * (1 - drift * 0.7);
```

## 4) Achados principais traduzidos em código
- Acumulador de fase + interpolação linear.
- FM/PM para brilho dinâmico.
- Waveguide/Karplus para cordas.
- Granular com janela Hann para evitar cliques.
- Condicionamento de saída mix-ready.

## 5) Respostas rápidas de implementação
- **Acumulador de fase no XPS-10:** não programável diretamente; controlar via `waveform + pitch/fine tune + TVA/TVF`.
- **ADSR para metais:** ataque rápido, decay moderado, sustain médio/alto, release controlado para não mascarar a mix.
- **Janela Hann no granular:** suaviza bordas do grão e evita clicks no overlap-add.

> Aviso: sem confirmação de mapeamento MIDI/SysEx, tudo deve ser tratado como sugestão/planejamento sem envio automático.


## 6) Implementação direta pedida

### Como implementar o acumulador de fase no contexto do XPS-10
O acumulador roda no engine interno; no app, implemente o DSP e converta para parâmetros editáveis do teclado:
- incremento de fase -> `coarse/fine tune`;
- tabela -> seleção de `waveform`;
- envelope -> `TVA`;
- brilho -> `TVF`.

```ts
let phase = 0;
const inc = (freq * tableSize) / sampleRate;
phase = (phase + inc) % tableSize;
const i = Math.floor(phase); const a = phase - i;
const sample = table[i] * (1 - a) + table[(i + 1) % tableSize] * a;
```

### Melhores pontos de partida ADSR para metais
- `Soft Brass`: A=22ms D=180ms S=0.72 R=260ms
- `Pop Brass`: A=12ms D=140ms S=0.66 R=180ms
- `Stab Brass`: A=6ms D=90ms S=0.52 R=120ms

### Uso da janela Hann na síntese granular
A Hann reduz descontinuidade de borda em cada grão, eliminando cliques no overlap-add.

```ts
for (let n = 0; n < N; n++) win[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1));
for (let n = 0; n < N; n++) out[pos + n] += grain[n] * win[n];
```
