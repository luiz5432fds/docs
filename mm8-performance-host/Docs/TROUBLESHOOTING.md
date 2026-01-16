# Troubleshooting (MM8-XPS Performance Manager)

## JUCE_DIR not set

Configure CMake with `-DJUCE_DIR=path/to/JUCE`.

## VST3 não aparece

- Confirme que o plugin está em uma pasta suportada.
- Refaça o scan e reinicie o app.

## ASIO4ALL não aparece

- Instale o ASIO4ALL.
- Verifique se o driver está habilitado no Windows.

## MIDI não aparece

- Reinstale o driver USB-MIDI do MM8.
- Verifique se o dispositivo aparece no Gerenciador de Dispositivos.

## Glitches / estalos

- Aumente o buffer.
- Desative plugins pesados.
- Use sample rate fixo (48kHz recomendado).
