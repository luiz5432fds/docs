import 'package:flutter/material.dart';
import 'synthesis_help_sheet.dart';
import '../../widgets/export_midi_button.dart';
import '../../widgets/import_musicxml_button.dart';
import '../../models/patch_model.dart';
import '../reaper_import/reaper_import_screen.dart';

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

  // Criar PatchModel atual para exportação
  PatchModel get currentPatch => PatchModel(
        name: 'Current Patch',
        category: 'SYN',
        tags: ['custom'],
        macro: {
          'filterCutoff': cutoff,
          'filterResonance': resonance,
          'envAttack': attack,
          'envRelease': release,
          'chorusRate': chorus,
          'reverbLevel': reverb,
        },
        panel: {},
      );

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
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Editor Juno / Painel XPS-10'),
          actions: [
            // Exportar MIDI
            ExportMidiButton(
              patch: currentPatch,
              customFileName: 'XPS10_${DateTime.now().millisecondsSinceEpoch}',
            ),
            // Importar MusicXML
            IconButton(
              tooltip: 'Importar MusicXML (MuseScore)',
              onPressed: () => _showImportOptions(context),
              icon: const Icon(Icons.upload_file),
            ),
            // Importar projeto Reaper
            IconButton(
              tooltip: 'Importar projeto Reaper',
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const ReaperImportScreen(),
                ),
              ),
              icon: const Icon(Icons.folder_open),
            ),
            // Ajuda
            IconButton(
              tooltip: 'Ajuda de síntese, mixagem e uso ao vivo',
              onPressed: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const SynthesisHelpSheet(),
              ),
              icon: const Icon(Icons.help_outline),
            ),
          ],
          bottom: const TabBar(tabs: [
            Tab(text: 'Painel'),
            Tab(text: 'Variações'),
            Tab(text: 'MORPH'),
            Tab(text: 'Importar'),
          ])),
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
            ),
            // Aba Importar
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Importar de outras DAWs e editores',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _importOptionCard(
                  icon: Icons.picture_as_pdf,
                  title: 'MuseScore (MusicXML)',
                  description: 'Importe partituras do MuseScore como patches do XPS-10',
                  onTap: () => _showImportOptions(context),
                ),
                const SizedBox(height: 12),
                _importOptionCard(
                  icon: Icons.folder_open,
                  title: 'Reaper (.rpp)',
                  description: 'Importe projetos Reaper e converta tracks em patches',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ReaperImportScreen(),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Exportar patch atual',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _exportOptionCard(
                  icon: Icons.music_note,
                  title: 'Exportar MIDI',
                  description: 'Exporte para Reaper, Ableton, ou qualquer DAW',
                  onTap: () => _showExportOptions(context),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _importOptionCard({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(description),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  Widget _exportOptionCard({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(description),
        trailing: const Icon(Icons.download, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _showImportOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Importar MusicXML',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ImportMusicxmlButton(
              showFullPreview: true,
              buttonText: 'Selecionar arquivo .xml/.mxl',
              onPatchesImported: (patches) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${patches.length} patches importados com sucesso'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showExportOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Exportar MIDI',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              'Patch: ${currentPatch.name}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ExportMidiButton(
              patch: currentPatch,
              showFullOptions: true,
              onExportComplete: () {
                Navigator.pop(context);
              },
            ),
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
