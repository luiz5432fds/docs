import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../services/import/reaper_project_parser.dart';
import '../../models/patch_model.dart';
import '../widgets/import_musicxml_button.dart' show OnPatchesImported;

/// Callback quando patches são importados
typedef OnReaperPatchesImported = void Function(List<PatchModel> patches, ReaperProject project);

/// Tela de importação de projetos Reaper
class ReaperImportScreen extends StatefulWidget {
  final OnReaperPatchesImported? onPatchesImported;

  const ReaperImportScreen({
    super.key,
    this.onPatchesImported,
  });

  @override
  State<ReaperImportScreen> createState() => _ReaperImportScreenState();
}

class _ReaperImportScreenState extends State<ReaperImportScreen> {
  bool _isLoading = false;
  ReaperProject? _project;
  final Set<int> _selectedTracks = {};
  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Importar Projeto Reaper'),
        actions: [
          if (_project != null)
            TextButton.icon(
              onPressed: _selectedTracks.isEmpty ? null : _importSelected,
              icon: const Icon(Icons.check),
              label: Text('Importar (${_selectedTracks.length})'),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return _ErrorView(
        message: _errorMessage!,
        onRetry: _pickReaperProject,
      );
    }

    if (_project == null) {
      return _EmptyView(onPickFile: _pickReaperProject);
    }

    return _ProjectView(
      project: _project!,
      selectedTracks: _selectedTracks,
      onToggleTrack: (trackId) {
        setState(() {
          if (_selectedTracks.contains(trackId)) {
            _selectedTracks.remove(trackId);
          } else {
            _selectedTracks.add(trackId);
          }
        });
      },
      onSelectAll: () {
        setState(() {
          _selectedTracks.clear();
          for (final track in _project!.midiTracks) {
            if (!track.isFolder && track.notes.isNotEmpty) {
              _selectedTracks.add(track.id);
            }
          }
        });
      },
      onDeselectAll: () {
        setState(() => _selectedTracks.clear());
      },
    );
  }

  Future<void> _pickReaperProject() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _project = null;
      _selectedTracks.clear();
    });

    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['rpp'],
        withData: true,
      );

      if (result == null || result.files.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final file = result.files.first;

      // Ler conteúdo
      String rppContent;
      if (file.bytes != null) {
        rppContent = String.fromCharCodes(file.bytes!);
      } else if (file.path != null) {
        final content = await File(file.path!).readAsString();
        rppContent = content;
      } else {
        throw Exception('Não foi possível ler o arquivo');
      }

      // Parse projeto Reaper
      final project = ReaperProjectParser.parse(rppContent);

      // Auto-selecionar tracks com notas
      for (final track in project.midiTracks) {
        if (!track.isFolder && track.notes.isNotEmpty) {
          _selectedTracks.add(track.id);
        }
      }

      setState(() {
        _project = project;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _importSelected() async {
    if (_project == null || _selectedTracks.isEmpty) return;

    final suggestions = _project!.generatePatchSuggestions();
    final selectedSuggestions = suggestions
        .where((s) => _selectedTracks.contains(s.sourceTrack.id))
        .toList();

    final patches = selectedSuggestions.map((s) => s.patch).toList();

    widget.onPatchesImported?.call(patches, _project!);

    if (mounted) {
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${patches.length} patches importados do projeto Reaper'),
        ),
      );
    }
  }
}

/// View vazia (inicial)
class _EmptyView extends StatelessWidget {
  final VoidCallback onPickFile;

  const _EmptyView({required this.onPickFile});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.folder_open,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Importar Projeto Reaper',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Selecione um arquivo .rpp para importar',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey,
                ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onPickFile,
            icon: const Icon(Icons.file_upload),
            label: const Text('Selecionar Arquivo'),
          ),
        ],
      ),
    );
  }
}

/// View de erro
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Erro ao importar',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey,
                  ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.retry),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}

/// View do projeto Reaper
class _ProjectView extends StatelessWidget {
  final ReaperProject project;
  final Set<int> selectedTracks;
  final ValueChanged<int> onToggleTrack;
  final VoidCallback onSelectAll;
  final VoidCallback onDeselectAll;

  const _ProjectView({
    required this.project,
    required this.selectedTracks,
    required this.onToggleTrack,
    required this.onSelectAll,
    required this.onDeselectAll,
  });

  @override
  Widget build(BuildContext context) {
    final suggestions = project.generatePatchSuggestions();

    return Column(
      children: [
        // Header com metadados
        _ProjectHeader(project: project),

        // Toolbar
        _Toolbar(
          project: project,
          selectedCount: selectedTracks.length,
          onSelectAll: onSelectAll,
          onDeselectAll: onDeselectAll,
        ),

        // Lista de tracks
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: suggestions.length,
            itemBuilder: (_, index) {
              final suggestion = suggestions[index];
              final isSelected = selectedTracks.contains(suggestion.sourceTrack.id);

              return _TrackSuggestionCard(
                suggestion: suggestion,
                isSelected: isSelected,
                onToggle: () => onToggleTrack(suggestion.sourceTrack.id),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Header do projeto
class _ProjectHeader extends StatelessWidget {
  final ReaperProject project;

  const _ProjectHeader({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.audio_file, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  project.metadata.title ?? 'Projeto sem título',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 16,
            children: [
              _MetadataChip(
                icon: Icons.speed,
                label: '${project.metadata.tempo.toStringAsFixed(1)} BPM',
              ),
              if (project.metadata.timeSignatureNumerator != null)
                _MetadataChip(
                  icon: Icons.music_note,
                  label: '${project.metadata.timeSignatureNumerator}/${project.metadata.timeSignatureDenominator}',
                ),
              _MetadataChip(
                icon: Icons.settings,
                label: '${project.metadata.sampleRate.toInt()} Hz',
              ),
              _MetadataChip(
                icon: Icons.graphic_eq,
                label: '${project.midiTracks.length} tracks',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Toolbar de seleção
class _Toolbar extends StatelessWidget {
  final ReaperProject project;
  final int selectedCount;
  final VoidCallback onSelectAll;
  final VoidCallback onDeselectAll;

  const _Toolbar({
    required this.project,
    required this.selectedCount,
    required this.onSelectAll,
    required this.onDeselectAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
          ),
        ),
      ),
      child: Row(
        children: [
          Text(
            '$selectedCount selecionado${selectedCount != 1 ? 's' : ''}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const Spacer(),
          TextButton(
            onPressed: onSelectAll,
            child: const Text('Selecionar todos'),
          ),
          TextButton(
            onPressed: onDeselectAll,
            child: const Text('Desmarcar'),
          ),
        ],
      ),
    );
  }
}

/// Card de sugestão de patch
class _TrackSuggestionCard extends StatelessWidget {
  final ReaperPatchSuggestion suggestion;
  final bool isSelected;
  final VoidCallback onToggle;

  const _TrackSuggestionCard({
    required this.suggestion,
    required this.isSelected,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final track = suggestion.sourceTrack;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onToggle,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Checkbox
              Checkbox(
                value: isSelected,
                onChanged: (_) => onToggle(),
              ),

              // Info da track
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      track.name,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 12,
                      children: [
                        _TrackInfo(
                          icon: Icons.music_note,
                          label: '${track.notes.length} notas',
                        ),
                        _TrackInfo(
                          icon: Icons.piano,
                          label: 'Range: ${track.minPitch}-${track.maxPitch}',
                        ),
                        if (track.volume != null)
                          _TrackInfo(
                            icon: Icons.volume_up,
                            label: 'Vol: ${track.volume!.toStringAsFixed(0)}',
                          ),
                      ],
                    ),
                    // Reasoning
                    if (suggestion.reasoning.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      ...suggestion.reasoning.take(2).map(
                            (r) => Padding(
                              padding: const EdgeInsets.only(left: 8, bottom: 2),
                              child: Text(
                                '• $r',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                              ),
                            ),
                          ),
                    ],
                  ],
                ),
              ),

              // Categoria
              Chip(
                label: Text(suggestion.patch.category),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Widget de info da track
class _TrackInfo extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TrackInfo({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
      ],
    );
  }
}

/// Chip de metadado
class _MetadataChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetadataChip({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
      ],
    );
  }
}
