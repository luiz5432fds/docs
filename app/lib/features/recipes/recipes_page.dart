import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/ai_router_service.dart';

class RecipesPage extends StatefulWidget {
  const RecipesPage({super.key});

  @override
  State<RecipesPage> createState() => _RecipesPageState();
}

class _RecipesPageState extends State<RecipesPage> {
  String codebookPreview = 'Sem prévia carregada.';
  String dspPreview = 'Sem playbook DSP carregado.';
  String gesturePreview = 'Sem engine de gesto carregada.';
  String mixPreview = 'Sem preset de mix carregado.';
  String fmGuidePreview = 'Sem guia FM carregado.';
  String realismPreview = 'Sem toolkit de realismo carregado.';
  String xps10GuidePreview = 'Sem guia de programação XPS-10 carregado.';
  String realismFamily = 'classicSynth';
  String selectedFamily = 'woodwinds';
  double aftertouch = 0.5;

  @override
  Widget build(BuildContext context) {
    final families = <Map<String, dynamic>>[
      {'nome': 'Piano/EP', 'resumo': 'Ataque curto, cutoff médio-alto, reverb plate curto.'},
      {'nome': 'Órgãos', 'resumo': 'Attack quase zero, release curto, chorus/rotary leve.'},
      {'nome': 'Strings/Pad', 'resumo': 'Attack lento, release longo, chorus + hall.'},
      {'nome': 'Brass', 'resumo': 'Attack rápido, cutoff médio-alto, brilho no refrão.'},
      {'nome': 'Leads', 'resumo': 'Cutoff alto, presença em 2~5kHz, delay curto.'},
      {'nome': 'Bass', 'resumo': 'Foco em 60..120Hz, release curto/médio, resonance controlada.'},
      {'nome': 'Pluck', 'resumo': 'Decay/release curtos, filtro com envelope positivo.'},
      {'nome': 'Bell/FM-like', 'resumo': 'LFO rápido no pitch para inarmônicos aproximados.'},
      {'nome': 'Choir/Vox', 'resumo': 'Attack médio-lento, reverb amplo, resonance baixa.'},
      {'nome': 'FX/Atmosfera', 'resumo': 'LFOs lentos em pitch/filter/pan + reverb grande.'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Receitas de Timbres (XPS-10)')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Arcabouço matemático aplicado às famílias sonoras.', style: TextStyle(fontSize: 16)),
          const SizedBox(height: 10),
          const Text('Mapa semântico: quente, brilhante, áspero e largo => ajusta cutoff/resonance/attack/release/chorus/reverb.'),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final codebook = await ai.getSynthesisCodebook();
              setState(() => codebookPreview = codebook.toString());
            },
            icon: const Icon(Icons.memory),
            label: const Text('Carregar prévia do Codebook Matemático'),
          ),
          const SizedBox(height: 8),
          Text(codebookPreview, maxLines: 8, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final dsp = await ai.getAdvancedDspPlaybook();
              setState(() => dspPreview = dsp.toString());
            },
            icon: const Icon(Icons.science),
            label: const Text('Carregar Playbook DSP Avançado'),
          ),
          const SizedBox(height: 8),
          Text(dspPreview, maxLines: 8, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final mix = await ai.getMixReadyPreset(
                denseBand: true,
                hasLeadVocal: true,
                hasBassAndKick: true,
                targetLufs: -16,
              );
              setState(() => mixPreview = mix.toString());
            },
            icon: const Icon(Icons.equalizer),
            label: const Text('Carregar Preset "Invisible Mix"'),
          ),
          const SizedBox(height: 8),
          Text(mixPreview, maxLines: 8, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final fmGuide = await ai.getBrassFmGuide();
              setState(() => fmGuidePreview = fmGuide.toString());
            },
            icon: const Icon(Icons.music_note),
            label: const Text('Guia FM para Metais (1:1 / 3:1)'),
          ),
          const SizedBox(height: 8),
          Text(fmGuidePreview, maxLines: 6, overflow: TextOverflow.ellipsis),

          const SizedBox(height: 10),
          const Text('Toolkit de Realidade Sonora', style: TextStyle(fontWeight: FontWeight.bold)),
          DropdownButton<String>(
            value: realismFamily,
            items: const [
              DropdownMenuItem(value: 'classicSynth', child: Text('Synth Clássico + Aftertouch')),
              DropdownMenuItem(value: 'woodwinds', child: Text('Madeiras + EQ')),
              DropdownMenuItem(value: 'strings', child: Text('Cordas + Pressão do Arco')),
              DropdownMenuItem(value: 'brass', child: Text('Metais + FM')),
              DropdownMenuItem(value: 'choir4tones', child: Text('Coro Orgânico 4 Tones')),
            ],
            onChanged: (v) => setState(() => realismFamily = v ?? 'classicSynth'),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final r = await ai.getRealismToolkit(
                family: realismFamily,
                aftertouch: aftertouch,
                jitterAmount: 0.01,
              );
              setState(() => realismPreview = r.toString());
            },
            icon: const Icon(Icons.tips_and_updates),
            label: const Text('Carregar Toolkit de Realismo'),
          ),
          const SizedBox(height: 8),
          Text(realismPreview, maxLines: 8, overflow: TextOverflow.ellipsis),

          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final guide = await ai.getXps10ProgrammingGuide();
              setState(() => xps10GuidePreview = guide.toString());
            },
            icon: const Icon(Icons.settings_input_component),
            label: const Text('Guia de Programação XPS-10 (Ring Mod / LA / Drift)'),
          ),
          const SizedBox(height: 8),
          Text(xps10GuidePreview, maxLines: 8, overflow: TextOverflow.ellipsis),
          const Divider(height: 24),
          const Text('Engine de Gesto Instrumental (Aftertouch)', style: TextStyle(fontWeight: FontWeight.bold)),
          DropdownButton<String>(
            value: selectedFamily,
            items: const [
              DropdownMenuItem(value: 'woodwinds', child: Text('Madeiras')),
              DropdownMenuItem(value: 'strings', child: Text('Cordas')),
              DropdownMenuItem(value: 'brass', child: Text('Metais')),
              DropdownMenuItem(value: 'vocal', child: Text('Vocal')),
            ],
            onChanged: (v) => setState(() => selectedFamily = v ?? 'woodwinds'),
          ),
          Slider(
            value: aftertouch,
            onChanged: (v) => setState(() => aftertouch = v),
          ),
          Text('Aftertouch simulado: ${aftertouch.toStringAsFixed(2)}'),
          ElevatedButton.icon(
            onPressed: () async {
              final ai = context.read<AiRouterService>();
              final gesture = await ai.getGestureArticulationEngine(family: selectedFamily, aftertouch: aftertouch);
              setState(() => gesturePreview = gesture.toString());
            },
            icon: const Icon(Icons.touch_app),
            label: const Text('Simular gesto e mapear no XPS-10'),
          ),
          const SizedBox(height: 8),
          Text(gesturePreview, maxLines: 10, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 14),
          ...families.map((f) => Card(
                child: ListTile(
                  title: Text(f['nome'] as String),
                  subtitle: Text(f['resumo'] as String),
                  trailing: const Icon(Icons.chevron_right),
                ),
              )),
          const SizedBox(height: 12),
          const Text('Articulações inovadoras por família', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('• Metais: overshoot de ataque + velocity no cutoff + expressão no edge.'),
          const Text('• Madeiras: camada de sopro + aftertouch + LFO random sutil para humanização.'),
          const Text('• Cordas: micro-desfase de camadas para massa orgânica.'),
          const Text('• Percussão: componente de impacto + ressonância tonal separada.'),
          const Text('• Vocal/Coral: múltiplas camadas com microdesafinação.'),
          const SizedBox(height: 12),
          const Text(
            'Aviso: Sugestão/planejamento — não envia ao teclado automaticamente quando o controle não estiver confirmado via MIDI/SysEx.',
            style: TextStyle(color: Colors.amber),
          )
        ],
      ),
    );
  }
}
