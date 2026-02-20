# Gestural Articulation Engine (Aftertouch/Pressão) para XPS-10

## Ideia central
Realismo não é só waveform: é **gesto instrumental** mapeando pressão/dinâmica para múltiplos parâmetros em conjunto.

## Madeiras (woodwinds)
- Pressão controla ruído de sopro + não linearidade de palheta.
- Modelo: `output = tanh(excitation * (1 + pressure))`.
- Mapeamento XPS-10:
  - aumentar TVA de ruído
  - abrir TVF do tone principal
  - micro-jitter em afinação

## Cordas (strings)
- Pressão do arco altera amortecimento/harmônicos (stick-slip aproximado).
- Modelo: `cutoff = 20000 - (bowForce*15000)`.
- Mapeamento XPS-10:
  - aftertouch reduz TVF cutoff levemente
  - aumenta LFO rápido de pitch (instabilidade controlada)

## Metais (brass)
- Pressão expande borda harmônica via índice FM percebido.
- Modelo: `modIndex = env * pressure * k`.
- Mapeamento XPS-10:
  - elevar layer de ring mod
  - abrir cutoff em picos de expressão

## Vocal
- Pressão desloca formante/PWM e injeta drift pequeno.
- Modelo: `P_WIDTH = 1 - (aftertouch*0.5)` e `freq = base*(1+drift)`.

## Segredos adicionais de realismo
1. Assincronia de ataque entre graves/agudos (~20-30ms em metais).
2. Saturação suave (`tanh`) para corpo.
3. PCM de ataque + camada sintética dinâmica.
4. Variação estocástica mínima para evitar repetição mecânica.

## Segurança
Quando não houver confirmação MIDI/SysEx:
- **“Sugestão/planejamento — não envia ao teclado automaticamente”**.
