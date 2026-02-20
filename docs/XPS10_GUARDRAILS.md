# XPS-10 Guardrails Operacionais

Checklist de robustez para evitar bugs comuns em uso real (palco/ensaio), alinhado ao comportamento do XPS-10.

## A) USB e integridade de dados
- Nunca inserir/remover USB com o teclado ligado.
- No app, toda ação de import/export deve mostrar confirmação explícita de segurança.

## B) Backup/Restore/Reset
- Sempre exigir backup antes de qualquer fluxo destrutivo.
- Em caso de reset, bloquear avanço sem confirmação de backup concluído.

## C) Polyphony e cortes de áudio
- Em arranjos densos, reduzir camadas e efeitos para evitar cortes.
- Exibir alerta de risco de polifonia ao gerar patches complexos.

## D) Troca de patch e MFX
- Troca de patch pode cortar som por mudança de MFX.
- Recomendar transição em silêncio e setlists com variações previsíveis.

## E) Sync MASTER/SLAVE
- Em SLAVE, arpejo/rhythm depende de clock MIDI externo.
- Exibir dica contextual quando usuário habilitar sync externo.

## F) Samples e Pads
- Sample Import: WAV 44.1kHz/16-bit.
- Audio Pad: WAV/AIFF/MP3.
- Validar formato antes de upload para evitar erro no teclado.
