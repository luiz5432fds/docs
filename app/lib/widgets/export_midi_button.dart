import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import '../services/export/midi_export_service.dart';
import '../models/patch_model.dart';

/// Widget de botão para exportar patch como MIDI
class ExportMidiButton extends StatefulWidget {
  final PatchModel patch;
  final String? customFileName;
  final VoidCallback? onExportComplete;
  final bool showFullOptions;

  const ExportMidiButton({
    super.key,
    required this.patch,
    this.customFileName,
    this.onExportComplete,
    this.showFullOptions = false,
  });

  @override
  State<ExportMidiButton> createState() => _ExportMidiButtonState();
}

class _ExportMidiButtonState extends State<ExportMidiButton> {
  bool _isExporting = false;
  MidiType _selectedType = MidiType.type1;
  MidiResolution _selectedResolution = MidiResolution.ppq480;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: 'Exportar para Reaper (MIDI)',
      icon: _isExporting
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.music_note),
      onPressed: _isExporting ? null : _showExportDialog,
    );
  }

  void _showExportDialog() {
    if (widget.showFullOptions) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (_) => _ExportOptionsDialog(
          patchName: widget.customFileName ?? widget.patch.name,
          initialType: _selectedType,
          initialResolution: _selectedResolution,
          onExport: (type, resolution) => _exportMidi(type, resolution),
        ),
      );
    } else {
      _exportMidi(_selectedType, _selectedResolution);
    }
  }

  Future<void> _exportMidi(MidiType type, MidiResolution resolution) async {
    setState(() => _isExporting = true);

    try {
      final result = await MidiExportService.exportPatch(
        patchName: widget.customFileName ?? widget.patch.name,
        parameters: Map<String, double>.from(widget.patch.macro),
        midiType: type,
        resolution: resolution,
      );

      // Salvar ou compartilhar
      await _saveOrShareMidi(result);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('MIDI exportado: ${result.fileName} (${result.trackCount} tracks)'),
            action: SnackBarAction(
              label: 'OK',
              onPressed: () {},
            ),
          ),
        );
      }

      widget.onExportComplete?.call();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao exportar MIDI: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isExporting = false);
      }
    }
  }

  Future<void> _saveOrShareMidi(MidiExportResult result) async {
    if (Platform.isAndroid || Platform.isIOS) {
      // Mobile: compartilhar diretamente
      final tempDir = await getTemporaryDirectory();
      final file = File('${tempDir.path}/${result.fileName}');
      await file.writeAsBytes(result.data);

      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Patch MIDI - ${widget.patch.name}',
        text: 'Exportado do XPS-10 AI Workstation',
      );
    } else {
      // Desktop: abrir dialog de salvamento
      final outputPath = await FilePicker.platform.saveFile(
        dialogTitle: 'Salvar arquivo MIDI',
        fileName: result.fileName,
        type: FileType.custom,
        allowedExtensions: ['mid'],
      );

      if (outputPath != null) {
        final file = File(outputPath);
        await file.writeAsBytes(result.data);
      }
    }
  }
}

/// Dialog de opções de exportação MIDI
class _ExportOptionsDialog extends StatefulWidget {
  final String patchName;
  final MidiType initialType;
  final MidiResolution initialResolution;
  final Future<void> Function(MidiType, MidiResolution) onExport;

  const _ExportOptionsDialog({
    required this.patchName,
    required this.initialType,
    required this.initialResolution,
    required this.onExport,
  });

  @override
  State<_ExportOptionsDialog> createState() => _ExportOptionsDialogState();
}

class _ExportOptionsDialogState extends State<_ExportOptionsDialog> {
  late MidiType _selectedType;
  late MidiResolution _selectedResolution;
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    _selectedType = widget.initialType;
    _selectedResolution = widget.initialResolution;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Exportar MIDI',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Patch: ${widget.patchName}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey,
                ),
          ),
          const SizedBox(height: 24),

          // Tipo MIDI
          const Text('Tipo de MIDI:'),
          SegmentedButton<MidiType>(
            segments: const [
              ButtonSegment(
                value: MidiType.type0,
                label: Text('Type 0'),
                icon: Icon(Icons.music_note),
              ),
              ButtonSegment(
                value: MidiType.type1,
                label: Text('Type 1'),
                icon: Icon(Icons.library_music),
              ),
            ],
            selected: {_selectedType},
            onSelectionChanged: (Set<MidiType> selected) {
              setState(() => _selectedType = selected.first);
            },
          ),
          const SizedBox(height: 8),
          Text(
            _getTypeDescription(_selectedType),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey,
                ),
          ),

          const SizedBox(height: 16),

          // Resolução
          const Text('Resolução (PPQ):'),
          DropdownButtonFormField<MidiResolution>(
            value: _selectedResolution,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            items: MidiResolution.values.map((r) {
              return DropdownMenuItem(
                value: r,
                child: Text('${r.value} PPQ${r.value == 480 ? ' (Reaper)' : ''}'),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() => _selectedResolution = value);
              }
            },
          ),

          const SizedBox(height: 24),

          // Botões
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isExporting ? null : () => Navigator.pop(context),
                  child: const Text('Cancelar'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isExporting
                      ? null
                      : () async {
                          setState(() => _isExporting = true);
                          await widget.onExport(_selectedType, _selectedResolution);
                          if (mounted) Navigator.pop(context);
                        },
                  icon: _isExporting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.download),
                  label: const Text('Exportar'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getTypeDescription(MidiType type) {
    switch (type) {
      case MidiType.type0:
        return 'Single track - todos os canais em uma track';
      case MidiType.type1:
        return 'Multi-track - uma track por canal (ideal para Reaper)';
      case MidiType.type2:
        return 'Multi-pattern - padrões independentes';
    }
  }
}

/// Botão simples de exportar MIDI (para uso em lists/cards)
class ExportMidiChip extends StatelessWidget {
  final PatchModel patch;
  final VoidCallback? onTap;

  const ExportMidiChip({
    super.key,
    required this.patch,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: const Icon(Icons.music_note, size: 16),
      label: const Text('MIDI'),
      onPressed: onTap ??
          () {
            showModalBottomSheet(
              context: context,
              builder: (_) => ExportMidiButton(
                key: ValueKey(patch.name),
                patch: patch,
                showFullOptions: true,
              ),
            );
          },
    );
  }
}
