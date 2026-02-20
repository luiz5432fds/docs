import 'package:flutter/material.dart';
import 'synthesis_help_sheet.dart';

class EditorPage extends StatefulWidget {
  const EditorPage({super.key});

  @override
  State<EditorPage> createState() => _EditorPageState();
}

class _EditorPageState extends State<EditorPage> {
  double cutoff = 89, resonance = 48, attack = 22, release = 68, chorus = 44, reverb = 57;
  double morph = 0;
  bool safetyLock = false;
  bool freeze = false;

  Widget knob(String label, double value, ValueChanged<double> onChanged, {double max = 127}) {
    return SizedBox(
      width: 150,
      child: Column(
        children: [
          Text(label),
          Slider(value: value, max: max, onChanged: safetyLock ? null : onChanged),
          Text(value.toStringAsFixed(0)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Editor Juno / Painel XPS-10'),
          actions: [
            IconButton(
              tooltip: 'Ajuda de síntese, mixagem e uso ao vivo',
              onPressed: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const SynthesisHelpSheet(),
              ),
              icon: const Icon(Icons.help_outline),
            )
          ],
          bottom: const TabBar(tabs: [Tab(text: 'Painel'), Tab(text: 'Variações'), Tab(text: 'MORPH')]),
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    knob('Cutoff', cutoff, (v) => setState(() => cutoff = v)),
                    knob('Resonance', resonance, (v) => setState(() => resonance = v)),
                    knob('Attack', attack, (v) => setState(() => attack = v)),
                    knob('Release', release, (v) => setState(() => release = v)),
                    knob('Chorus', chorus, (v) => setState(() => chorus = v)),
                    knob('Reverb', reverb, (v) => setState(() => reverb = v)),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(spacing: 8, children: [
                  _btn('Dual/Split', 'Controle lógico (sugestão/planejamento — não envia ao teclado automaticamente)'),
                  _btn('Octave +', 'Controle lógico (sugestão/planejamento — não envia ao teclado automaticamente)'),
                  _btn('Octave -', 'Controle lógico (sugestão/planejamento — não envia ao teclado automaticamente)'),
                  _btn('Transpose', 'Controle lógico (sugestão/planejamento — não envia ao teclado automaticamente)'),
                  _btn('Arpeggio', 'Sugestão/planejamento — não envia ao teclado automaticamente'),
                  _btn('Tempo', 'Controle lógico (sugestão/planejamento — não envia ao teclado automaticamente)'),
                ]),
                SwitchListTile(
                  title: const Text('Performance Safety Lock'),
                  value: safetyLock,
                  onChanged: (v) => setState(() => safetyLock = v),
                ),
                SwitchListTile(
                  title: const Text('Freeze (transpose/master FX/tempo)'),
                  value: freeze,
                  onChanged: (v) => setState(() => freeze = v),
                ),
              ],
            ),
            const Center(child: Text('Recipe steps e variantes: verso / refrão / solo.')),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                const Text('MORPH A/B (0..100)'),
                Slider(value: morph, max: 100, onChanged: (v) => setState(() => morph = v)),
                Text('Valor atual: ${morph.toStringAsFixed(0)}'),
              ]),
            )
          ],
        ),
      ),
    );
  }

  Widget _btn(String label, String tooltip) => Tooltip(
        message: tooltip,
        child: ElevatedButton(onPressed: () {}, child: Text(label)),
      );
}
