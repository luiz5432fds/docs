import 'package:flutter/material.dart';
import '../common/section_scaffold.dart';

class StorePage extends StatelessWidget {
  const StorePage({super.key});

  @override
  Widget build(BuildContext context) {
    const items = [
      ('Hardware Synthesizers', 'Sintetizadores e workstations'),
      ('Controllers', 'Teclados, pads e MIDI controllers'),
      ('Audio Interfaces', 'Captação e monitoramento de baixa latência'),
      ('Software Instruments', 'Coleção de instrumentos virtuais'),
      ('Software Effects', 'FX para timbre, mix e master'),
      ('Other', 'Acessórios e bundles'),
      ('Downloads & Manuals', 'Manuais, installers e versões'),
      ('Support', 'Suporte técnico e abertura de ticket'),
      ('FAQ', 'Perguntas frequentes'),
      ('Distributors', 'Rede de distribuição'),
      ('Return & Refund policy', 'Política de devolução e reembolso'),
    ];

    return SectionScaffold(
      title: 'Store & Services',
      children: [
        const Text('Catálogo e serviços para fluxo completo: criação, compra, suporte e manutenção.'),
        const SizedBox(height: 12),
        ...items
            .map((e) => Card(
                  child: ListTile(
                    title: Text(e.$1),
                    subtitle: Text(e.$2),
                  ),
                ))
            .toList(),
      ],
    );
  }
}
