import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/ai_router_service.dart';

class AssistantPage extends StatefulWidget {
  const AssistantPage({super.key});

  @override
  State<AssistantPage> createState() => _AssistantPageState();
}

class _AssistantPageState extends State<AssistantPage> {
  String _family = 'sintetizador';
  double _brightness = 0.55;
  double _density = 0.45;
  double _acousticness = 0.40;
  double _aftertouch = 0.50;
  Map<String, dynamic>? _algorithm;
  Map<String, dynamic>? _consolidation;
  bool _loading = false;

  Future<void> _runAlgorithm() async {
    setState(() => _loading = true);
    try {
      final ai = context.read<AiRouterService>();
      final res = await ai.getIntelligentAssistantAlgorithm(
        family: _family,
        brightnessTarget: _brightness,
        densityTarget: _density,
        acousticness: _acousticness,
        aftertouch: _aftertouch,
      );
      if (!mounted) return;
      setState(() => _algorithm = Map<String, dynamic>.from(res['algorithm'] as Map));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }


  Future<void> _loadConsolidation() async {
    setState(() => _loading = true);
    try {
      final ai = context.read<AiRouterService>();
      final res = await ai.getSourceFindingsConsolidation(
        family: _family,
        targetBrightness: _brightness,
        targetDensity: _density,
      );
      if (!mounted) return;
      setState(() => _consolidation = res);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _slider(String label, double value, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$label: ${(value * 100).toStringAsFixed(0)}%'),
        Slider(value: value, min: 0, max: 1, onChanged: onChanged),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final analysis = _algorithm?['analysis'] as Map<String, dynamic>?;
    final selector = _algorithm?['selector'] as Map<String, dynamic>?;
    final panel = (_algorithm?['xps10PatchProposal'] as Map<String, dynamic>?)?['panel'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(title: const Text('Assistente Multi-IA')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Algoritmo Inteligente de Criação de Timbres', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _family,
            decoration: const InputDecoration(labelText: 'Família alvo'),
            items: const [
              DropdownMenuItem(value: 'metais', child: Text('Metais')),
              DropdownMenuItem(value: 'madeiras', child: Text('Madeiras')),
              DropdownMenuItem(value: 'cordas', child: Text('Cordas')),
              DropdownMenuItem(value: 'pads', child: Text('Pads')),
              DropdownMenuItem(value: 'sintetizador', child: Text('Sintetizador')),
              DropdownMenuItem(value: 'vocal', child: Text('Vocal')),
            ],
            onChanged: (v) => setState(() => _family = v ?? 'sintetizador'),
          ),
          const SizedBox(height: 8),
          _slider('Brilho alvo', _brightness, (v) => setState(() => _brightness = v)),
          _slider('Densidade alvo', _density, (v) => setState(() => _density = v)),
          _slider('Acústico', _acousticness, (v) => setState(() => _acousticness = v)),
          _slider('Aftertouch', _aftertouch, (v) => setState(() => _aftertouch = v)),
          const SizedBox(height: 8),
          FilledButton.icon(
            onPressed: _loading ? null : _runAlgorithm,
            icon: const Icon(Icons.auto_awesome),
            label: Text(_loading ? 'Calculando...' : 'Gerar algoritmo automatizado'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _loading ? null : _loadConsolidation,
            icon: const Icon(Icons.library_books),
            label: const Text('Consolidar achados das fontes em código'),
          ),
          const SizedBox(height: 16),
          if (_algorithm != null) ...[
            Text('Modo selecionado: ${selector?['mode'] ?? '-'}'),
            Text('Justificativa: ${selector?['rationale'] ?? '-'}'),
            const Divider(height: 24),
            Text('f0 estimado: ${analysis?['f0EstimateHz'] ?? '-'} Hz'),
            Text('Centróide espectral: ${analysis?['spectralCentroidNorm'] ?? '-'}'),
            Text('Harmonicidade: ${analysis?['harmonicity'] ?? '-'}'),
            const Divider(height: 24),
            const Text('Patch sugerido (painel XPS-10):', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('Cutoff: ${panel?['cutoff'] ?? '-'} | Resonance: ${panel?['resonance'] ?? '-'}'),
            Text('Attack: ${panel?['attack'] ?? '-'} | Release: ${panel?['release'] ?? '-'}'),
            Text('Chorus: ${panel?['chorus'] ?? '-'} | Reverb: ${panel?['reverb'] ?? '-'}'),
            const SizedBox(height: 16),
            const Text('Resultado esperado: timbre pronto para mix e performance ao vivo.', style: TextStyle(color: Colors.white70)),
          ],

          if (_consolidation != null) ...[
            const Divider(height: 24),
            const Text('Consolidação automática das fontes', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('SysEx XPS-10: ${((_consolidation?['directAnswers'] as Map?)?['sysexTablesXps10'] as Map?)?['status'] ?? '-'}'),
            Text('PhISM/percussão: ${((_consolidation?['directAnswers'] as Map?)?['phismPercussion'] as Map?)?['explanation'] ?? '-'}'),
            Text('Drift/calor: ${((_consolidation?['directAnswers'] as Map?)?['driftWarmth'] as Map?)?['explanation'] ?? '-'}'),
            const SizedBox(height: 8),
            const Text('Aplicação no XPS-10:'),
            Text('• ${((_consolidation?['xps10PracticalMappings'] as Map?)?['accumulatorOnXps10']) ?? '-'}'),
            Text('• ${((_consolidation?['xps10PracticalMappings'] as Map?)?['hanningUse']) ?? '-'}'),
          ],
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('Aplicar no patch'),
        icon: const Icon(Icons.check),
      ),
    );
  }
}
