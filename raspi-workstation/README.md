# Firmware para Workstation em Raspberry Pi

Este projeto fornece uma estrutura inicial para criar uma firmware de workstation musical em um Raspberry Pi. O objetivo é oferecer motores sonoros desenvolvidos do zero e uma interface visual em tema escuro com animações. Cada motor sonoro possui sua própria página, além de seções para efeitos, ADSR, performance, global, master e arpeggiador.

## Estrutura Básica

- `main.py`: ponto de entrada da aplicação e inicialização da interface.
- `engines/`: diretório contendo os motores sonoros (sintetizador, sampler,
  orgão, piano, analógico, FM, D-50, XP-80, QuadraSynth, Korg M, DX7, orquestral,
  coral, sanfona, metais e madeiras).
- `ui/`: componentes de interface criados com PyQt5.

## Pré-Requisitos

- Python 3.9 ou superior instalado no Raspberry Pi.
- Dependências de interface: `PyQt5` e `QDarkStyle` para tema escuro.

Instalação das dependências (exemplo):
```bash
pip install PyQt5 qdarkstyle
```

## Executando

No terminal do Raspberry Pi, execute:
```bash
python main.py
```

Isso abrirá a janela principal com abas para cada motor sonoro e páginas adicionais (efeitos, ADSR, etc.).

Este repositório contém apenas um esqueleto inicial. Todos os motores listados
acima ainda utilizam implementações simplificadas. Personalize cada engine com
algoritmos de síntese (por exemplo, síntese subtrativa, FM ou amostragem) para
atingir a qualidade desejada.

## Criando uma imagem bootável

Você pode transformar este firmware em um sistema operacional leve que inicia
diretamente no Raspberry Pi. Recomendamos o uso do
[Buildroot](https://buildroot.org/) para gerar a distribuição personalizada.

1. Instale as dependências do Buildroot em uma máquina Linux.
2. Execute `scripts/build_image.sh` para baixar o Buildroot, aplicar este
   projeto como _overlay_ e gerar `raspi-workstation.img` em `output/`.
3. Grave a imagem em um cartão SD:

   ```bash
   sudo dd if=output/raspi-workstation.img of=/dev/sdX bs=4M status=progress
   ```

4. Na primeira inicialização, habilite o serviço para que a interface carregue
   automaticamente:

   ```bash
   sudo cp raspi-workstation.service /etc/systemd/system/
   sudo systemctl enable raspi-workstation.service
   ```

Assim o Raspberry Pi será iniciado como um teclado workstation dedicado.
