import 'package:flutter/material.dart';

class DecoderPage extends StatelessWidget {
  const DecoderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Decodificar Som (Aproximação)')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Envie um áudio curto ou grave no app para gerar um Patch Aproximado.'),
          SizedBox(height: 12),
          Text('Aviso: Não é clonagem perfeita; é aproximação limitada aos controles do XPS-10.', style: TextStyle(color: Colors.amber)),
          SizedBox(height: 12),
          Placeholder(fallbackHeight: 160),
          SizedBox(height: 12),
          Text('Features analisadas (stub): RMS, envelope e brilho aproximado.'),
        ],
      ),
    );
  }
}
