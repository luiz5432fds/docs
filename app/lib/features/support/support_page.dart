import 'package:flutter/material.dart';
import '../common/section_scaffold.dart';

class SupportPage extends StatelessWidget {
  const SupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionScaffold(
      title: 'Support',
      children: [
        Text('Acesso rápido a recursos de suporte e pós-venda.'),
        SizedBox(height: 12),
        Card(child: ListTile(title: Text('Downloads & Manuals'), subtitle: Text('Guias, firmware, manuais e installers.'))),
        Card(child: ListTile(title: Text('FAQ'), subtitle: Text('Respostas para dúvidas comuns.'))),
        Card(child: ListTile(title: Text('Distributors'), subtitle: Text('Encontre revendas e assistência autorizada.'))),
        Card(child: ListTile(title: Text('Return and Refund policy'), subtitle: Text('Políticas transparentes de devolução/reembolso.'))),
      ],
    );
  }
}
