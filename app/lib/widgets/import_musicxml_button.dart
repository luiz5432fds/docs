import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/import/musicxml_parser.dart';
import '../services/import/musicxml_to_patch_mapper.dart';
import '../models/patch_model.dart';

/// Callback quando patches são importados
typedef OnPatchesImported = void Function(List<PatchModel> patches);

/// Widget de botão para importar MusicXML
class ImportMusicxmlButton extends StatefulWidget {
  final OnPatchesImported? onPatchesImported;
  final bool showFullPreview;
  final String? buttonText;
  final bool isChip;

  const ImportMusicxmlButton({
    super.key,
    this.onPatchesImported,
    this.showFullPreview = true,
    this.buttonText,
    this.isChip = false,
  });

  @override
  State<ImportMusicxmlButton> createState() => _ImportMusicxmlButtonState();
}

class _ImportMusicxmlButtonState extends State<ImportMusicxmlButton> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    if (widget.isChip) {
      return ActionChip(
        avatar: _isLoading
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.upload_file, size: 16),
        label: Text(widget.buttonText ?? 'MusicXML'),
        onPressed: _isLoading ? null : _pickAndImport,
      );
    }

    return ElevatedButton.icon(
      onPressed: _isLoading ? null : _pickAndImport,
      icon: _isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.upload_file),
      label: Text(widget.buttonText ?? 'Importar MusicXML'),
    );
  }

  Future<void> _pickAndImport() async {
    setState(() => _isLoading = true);

    try {
      // Escolher arquivo
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xml', 'mxl', 'musicxml'],
        withData: true,
      );

      if (result == null || result.files.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final file = result.files.first;

      // Ler conteúdo
      String xmlContent;
      if (file.bytes != null) {
        xmlContent = String.fromCharCodes(file.bytes!);
      } else if (file.path != null) {
        final content = await File(file.path!).readAsString();
        xmlContent = content;
      } else {
        throw Exception('Não foi possível ler o arquivo');
      }

      // Parse MusicXML
      final document = MusicXmlParser.parse(xmlContent);

      // Mapear para patches
      final mappedResults = MusicXmlToPatchMapper.mapDocument(document);
      final patches = mappedResults.map((r) => r.patch).toList();

      if (patches.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Nenhum instrumento encontrado no arquivo MusicXML'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      // Mostrar preview se solicitado
      if (widget.showFullPreview && mounted) {
        await _showImportPreview(document, mappedResults, patches);
      } else {
        // Importar diretamente
        widget.onPatchesImported?.call(patches);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${patches.length} patches importados de "${document.metadata.title ?? 'Arquivo'}"'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao importar MusicXML: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _showImportPreview(
    MusicXmlDocument document,
    List<MappedPatchResult> results,
    List<PatchModel> patches,
  ) async {
    final selected = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _MusicxmlPreviewSheet(
        document: document,
        results: results,
      ),
    );

    if (selected == true) {
      widget.onPatchesImported?.call(patches);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${patches.length} patches importados de "${document.metadata.title ?? 'Arquivo'}"'),
          ),
        );
      }
    }
  }
}

/// Sheet de preview de importação MusicXML
class _MusicxmlPreviewSheet extends StatelessWidget {
  final MusicXmlDocument document;
  final List<MappedPatchResult> results;

  const _MusicxmlPreviewSheet({
    required this.document,
    required this.results,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, controller) => Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
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
                const Icon(Icons.picture_as_pdf, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        document.metadata.title ?? 'Sem título',
                        style: Theme.of(context).textTheme.titleMedium,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (document.metadata.composer != null)
                        Text(
                          document.metadata.composer!,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey,
                              ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Lista de patches
          Expanded(
            child: ListView.builder(
              controller: controller,
              padding: const EdgeInsets.all(16),
              itemCount: results.length,
              itemBuilder: (_, index) {
                final result = results[index];
                return _PatchPreviewCard(result: result);
              },
            ),
          ),

          // Footer com botões
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).dividerColor,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Cancelar'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: Text('Importar ${results.length} patches'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Card de preview de um patch importado
class _PatchPreviewCard extends StatelessWidget {
  final MappedPatchResult result;

  const _PatchPreviewCard({required this.result});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Nome da parte e categoria
            Row(
              children: [
                Icon(
                  _getCategoryIcon(result.patch.category),
                  size: 20,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.patch.name,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      Text(
                        result.sourcePart.name,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey,
                            ),
                      ),
                    ],
                  ),
                ),
                Chip(
                  label: Text(result.patch.category),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Estatísticas da parte
            Wrap(
              spacing: 12,
              children: [
                _StatItem(
                  icon: Icons.music_note,
                  label: '${result.sourcePart.allNotes.length} notas',
                ),
                _StatItem(
                  icon: Icons.piano,
                  label: 'Range: ${result.sourcePart.minPitch}-${result.sourcePart.maxPitch}',
                ),
                if (result.sourcePart.totalDuration.inSeconds > 0)
                  _StatItem(
                    icon: Icons.schedule,
                    label: '${result.sourcePart.totalDuration.inSeconds}s',
                  ),
              ],
            ),

            // Tags
            if (result.patch.tags.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: result.patch.tags
                    .take(5)
                    .map((tag) => Chip(
                          label: Text(tag),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ))
                    .toList(),
              ),
            ],

            // Notas de mapeamento
            if (result.mappingNotes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Mapeamento:',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 4),
              ...result.mappingNotes.take(3).map(
                    (note) => Padding(
                      padding: const EdgeInsets.only(left: 8, bottom: 2),
                      child: Text(
                        '• $note',
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
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'PNO':
        return Icons.piano;
      case 'EP':
        return Icons.piano;
      case 'ORG':
        return Icons.piano;
      case 'BRS':
        return Icons.trumpet;
      case 'STR':
        return Icons.music_note;
      case 'WW':
        return Icons.flute;
      case 'SYN':
        return Icons.settings_input_component;
      case 'BAS':
        return Icons.graphic_eq;
      default:
        return Icons.music_note;
    }
  }
}

/// Widget de item de estatística
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatItem({
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

/// Botão simples de importar (para uso em lists/cards)
class ImportMusicxmlChip extends StatelessWidget {
  final OnPatchesImported? onTap;

  const ImportMusicxmlChip({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ImportMusicxmlButton(
      onTap: onTap,
      isChip: true,
      buttonText: 'MusicXML',
    );
  }
}
