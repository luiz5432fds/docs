import 'package:flutter/material.dart';

class AssistantPage extends StatelessWidget {
  const AssistantPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 6,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Assistente Multi-IA'),
          bottom: const TabBar(isScrollable: true, tabs: [
            Tab(text: 'Final'),
            Tab(text: 'Synth'),
            Tab(text: 'Mix'),
            Tab(text: 'Performance'),
            Tab(text: 'Style'),
            Tab(text: 'Knowledge')
          ]),
        ),
        body: const TabBarView(children: [
          Center(child: Text('Resposta consolidada dos agentes.')),
          Center(child: Text('Agente de síntese.')),
          Center(child: Text('Agente de mixagem.')),
          Center(child: Text('Agente de performance.')),
          Center(child: Text('Agente de estilo.')),
          Center(child: Text('Agente de conhecimento (RAG).')),
        ]),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () {},
          label: const Text('Aplicar no patch'),
          icon: const Icon(Icons.check),
        ),
      ),
    );
  }
}
