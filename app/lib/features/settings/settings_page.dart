import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/ai_router_service.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final ai = context.watch<AiRouterService>();
    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Provedor de IA ativo'),
          DropdownButton<AiProviderType>(
            value: ai.activeProvider,
            onChanged: (v) {
              if (v != null) ai.setProvider(v);
            },
            items: const [
              DropdownMenuItem(value: AiProviderType.firebaseFunctions, child: Text('ProviderFirebaseFunctions (padrão)')),
              DropdownMenuItem(value: AiProviderType.localStub, child: Text('ProviderLocal (stub)')),
              DropdownMenuItem(value: AiProviderType.externalStub, child: Text('ProviderExternal (stub)')),
            ],
          ),
          SwitchListTile(
            title: const Text('Habilitar Provider External'),
            value: ai.externalEnabled,
            onChanged: (v) {
              ai.externalEnabled = v;
              ai.notifyListeners();
            },
          ),
          TextField(
            decoration: const InputDecoration(labelText: 'Endpoint externo'),
            onChanged: (v) => ai.externalEndpoint = v,
          ),
          const SizedBox(height: 8),
          TextField(
            decoration: const InputDecoration(labelText: 'API Key externa'),
            onChanged: (v) => ai.externalApiKey = v,
            obscureText: true,
          ),
          const SizedBox(height: 14),
          const Text('SysexAdapter: DESATIVADO por padrão (segurança).', style: TextStyle(color: Colors.amber)),
        ],
      ),
    );
  }
}
