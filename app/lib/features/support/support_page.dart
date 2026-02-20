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
        Card(child: ListTile(title: Text('USB Safety'), subtitle: Text('Sempre desligue o XPS-10 antes de inserir/remover USB para evitar corrupção de dados.'))),
        Card(child: ListTile(title: Text('Backup obrigatório'), subtitle: Text('Faça backup antes de reset/restore para evitar perda de patches e samples.'))),
        Card(child: ListTile(title: Text('Polyphony e troca de patch'), subtitle: Text('Em camadas densas, reduza efeitos e evite troca abrupta de patch com MFX diferentes.'))),
        Card(child: ListTile(title: Text('Sync e Samples'), subtitle: Text('SLAVE exige clock MIDI externo; Sample Import requer WAV 44.1kHz/16-bit.'))),
      ],
    );
  }
}
