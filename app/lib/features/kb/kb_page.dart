import 'package:flutter/material.dart';

class KbPage extends StatelessWidget {
  const KbPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Base de Conhecimento (PDF)')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Upload PDF para Storage -> processamento em Cloud Functions.'),
          SizedBox(height: 8),
          Placeholder(fallbackHeight: 140),
          SizedBox(height: 12),
          TextField(decoration: InputDecoration(labelText: 'Buscar na base (searchKB)')),
          SizedBox(height: 12),
          Text('Trechos com citação: docId, chunkIndex, snippet.'),
        ],
      ),
    );
  }
}
