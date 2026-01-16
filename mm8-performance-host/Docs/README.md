# MM8-XPS Performance Manager

Um host de plugins VST3 inspirado na estética do Yamaha MM8. O projeto usa JUCE com CMake e organiza instrumentos em **Categories/Banks → Programs → Performances (16 Parts) → Setlists**.

## Requisitos

- Windows 10/11
- Visual Studio 2022
- CMake 3.21+
- JUCE 7+ (defina `JUCE_DIR` ao configurar)

## Appliance Mode (sem mouse)

- O app inicia em tela cheia por padrão.
- Navegação por Part/Category/Program/Performance deve ser feita via MM8 ou controlador MIDI.
- O modo de captura (“Capture/Learn”) permite mapear botões que não enviam MIDI.
- Na primeira execução, o app tenta auto-configurar MIDI e áudio (MM8/ASIO4ALL) e grava em `config.json`.

## Como compilar (Visual Studio 2022)

```bash
cmake -S . -B build -G "Visual Studio 17 2022" -DJUCE_DIR=C:/dev/JUCE
cmake --build build --config Release
```

O executável estará em `build/MM8XPSPerformanceManagerApp_artefacts/Release`.

## Instalador (Inno Setup)

Use o template em `installer/installer.iss` e ajuste o caminho do executável.

### Gerar instalador em 1 comando

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1
```

## Como escanear VST3

O scanner inicial usa as pastas padrão:

- `C:\Program Files\Common Files\VST3`
- `C:\Program Files\VstPlugins`
- `C:\Program Files (x86)\VstPlugins`

No app, use o botão **Bank** para adicionar caminhos extras.

## Como selecionar ASIO4ALL

1. Abra as configurações de áudio do app.
2. Selecione **ASIO4ALL** como driver.
3. Ajuste buffer e sample rate (padrão recomendado: 48kHz / 256).

## Conectar o MM8 e usar MIDI Learn

1. Conecte o MM8 via USB-MIDI.
2. Aguarde ~6,5s após a detecção para evitar overflow do buffer MIDI.
3. Abra **Monitor** para ver quais controles enviam CC/PC.
4. Use **Capture/Learn** nos knobs/botões virtuais para mapear controles não enviados pelo MM8.

## Criar Performance 16-part

1. Abra **Performance**.
2. Ative até 16 Parts.
3. Defina canal MIDI, key range, velocity range e transpose.
4. Salve a Performance.

## Setlist

- Abra **Setlist**.
- Adicione Performances em ordem de show.
- Use Next/Prev para navegar.

## MM8 Factory Order (Voice List)

Use `Resources/mm8-factory-order.json` para manter a ordem e os MSB/LSB/PC do MM8. A diferença de offset (Program 001 = PC 000) já está documentada no arquivo.

### Linkar VST ao MM8 Factory Order

1. Abra o browser de categorias.
2. Selecione um item da lista MM8 Factory Order.
3. Use a ação **Link** para escolher um VST3 e preset equivalente.
4. A navegação seguirá a ordem original do MM8, apenas trocando o motor de som.

## Performances de exemplo

Veja `Resources/Performances`.

> Importante: este projeto **não** inclui nem referencia modificações de firmware do Yamaha MM8.
