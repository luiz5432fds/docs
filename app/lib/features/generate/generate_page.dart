import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/ai_router_service.dart';

class GeneratePage extends StatefulWidget {
  const GeneratePage({super.key});

  @override
  State<GeneratePage> createState() => _GeneratePageState();
}

class _GeneratePageState extends State<GeneratePage> {
  final role = TextEditingController(text: 'Tecladista base');
  final section = TextEditingController(text: 'Refrão');
  final tags = TextEditingController(text: 'pop, worship');
  String output = '';

  @override
  Widget build(BuildContext context) {
    final ai = context.read<AiRouterService>();
    return Scaffold(
      appBar: AppBar(title: const Text('Gerar Timbre')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: role, decoration: const InputDecoration(labelText: 'Função do timbre na banda')),
          const SizedBox(height: 8),
          TextField(controller: section, decoration: const InputDecoration(labelText: 'Seção (verso/refrão/solo)')),
          const SizedBox(height: 8),
          TextField(controller: tags, decoration: const InputDecoration(labelText: 'Tags e estilo')),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () async {
              final res = await ai.generatePatch({
                'role': role.text,
                'section': section.text,
                'style': tags.text,
                'query': tags.text,
              });
              setState(() => output = res.toString());
            },
            child: const Text('Gerar com IA'),
          ),
          const SizedBox(height: 16),
          Text(output.isEmpty ? 'Sem resultado ainda.' : output),
        ],
      ),
    );
  }
}
