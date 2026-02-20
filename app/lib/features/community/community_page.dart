import 'package:flutter/material.dart';

class CommunityPage extends StatelessWidget {
  const CommunityPage({super.key});

  @override
  Widget build(BuildContext context) {
    final sections = [
      (
        'Presets & Patches',
        'Publique timbres, receba likes e copie presets para sua biblioteca pessoal.',
        Icons.library_music,
      ),
      (
        'Dicas de som',
        'Workflows de síntese, mix e performance para acelerar resultados práticos.',
        Icons.tips_and_updates,
      ),
      (
        'Desafios',
        'Participe de desafios de design sonoro e remix para evoluir seu repertório.',
        Icons.emoji_events,
      ),
      (
        'Showcase',
        'Compartilhe músicas e performances construídas com seus patches.',
        Icons.mic,
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Community')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Troque presets, aprenda técnicas e participe de desafios com outros músicos.',
          ),
          const SizedBox(height: 12),
          ...sections
              .map((s) => Card(
                    child: ListTile(
                      leading: Icon(s.$3),
                      title: Text(s.$1),
                      subtitle: Text(s.$2),
                    ),
                  ))
              .toList(),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.group_add), label: const Text('Entrar na comunidade')),
              OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.upload_file), label: const Text('Enviar preset')),
            ],
          ),
        ],
      ),
    );
  }
}
