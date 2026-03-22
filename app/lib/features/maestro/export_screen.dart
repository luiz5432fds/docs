import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/project_state.dart';
import '../providers/maestro_provider.dart';

/// Maestro IA Export Screen
/// Allows users to export their projects in various formats
class MaestroExportScreen extends StatefulWidget {
  const MaestroExportScreen({super.key});

  @override
  State<MaestroExportScreen> createState() => _MaestroExportScreenState();
}

class _MaestroExportScreenState extends State<MaestroExportScreen> {
  bool _isExporting = false;
  final ExportOptions _options = ExportOptions(
    reaperProject: true,
    audioStems: false,
    midiFile: true,
    musicXml: true,
    pdfScore: true,
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Exportar Projeto'),
      ),
      body: Consumer<MaestroProvider>(
        builder: (context, provider, child) {
          final project = provider.currentProject;

          if (project == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.folder_open,
                    size: 64,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Nenhum projeto para exportar',
                    style: theme.textTheme.titleMedium,
                  ),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildProjectSummary(project, theme),
              const SizedBox(height: 24),
              _buildExportOptions(theme),
              const SizedBox(height: 24),
              _buildExportButton(project, provider, theme),
              const SizedBox(height: 16),
              if (project.exports != null) _buildExistingExports(project.exports!, theme),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProjectSummary(MaestroProject project, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Resumo do Projeto',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (project.analysis != null) ...[
              _buildSummaryRow(
                Icons.speed,
                'Tempo',
                '${project.analysis!.bpm.toInt()} BPM',
                theme,
              ),
              _buildSummaryRow(
                Icons.music_note,
                'Tom',
                project.analysis!.key,
                theme,
              ),
              _buildSummaryRow(
                Icons.piano,
                'Estilo',
                project.arrangement?.style.toUpperCase() ?? 'N/A',
                theme,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(IconData icon, String label, String value, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: theme.colorScheme.primary),
          const SizedBox(width: 12),
          Text(label, style: theme.textTheme.bodyMedium),
          const Spacer(),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExportOptions(ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Formatos de Exportação',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Selecione os formatos desejados para exportação',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 16),
            _buildExportOption(
              Icons.article,
              'Projeto Reaper (.rpp)',
              'Abra no Reaper para continuar editando',
              _options.reaperProject,
              (value) => setState(() => _options.reaperProject = value),
              theme,
            ),
            const Divider(),
            _buildExportOption(
              Icons.audiotrack,
              'Stems de Áudio (.wav)',
              'Arquivos separados para cada instrumento',
              _options.audioStems,
              (value) => setState(() => _options.audioStems = value),
              theme,
            ),
            const Divider(),
            _buildExportOption(
              Icons.piano,
              'Arquivo MIDI (.mid)',
              'Melodia e harmonia em formato MIDI',
              _options.midiFile,
              (value) => setState(() => _options.midiFile = value),
              theme,
            ),
            const Divider(),
            _buildExportOption(
              Icons.library_music,
              'MusicXML (.musicxml)',
              'Partitura editável em outros softwares',
              _options.musicXml,
              (value) => setState(() => _options.musicXml = value),
              theme,
            ),
            const Divider(),
            _buildExportOption(
              Icons.picture_as_pdf,
              'Partitura PDF (.pdf)',
              'Pronta para impressão',
              _options.pdfScore,
              (value) => setState(() => _options.pdfScore = value),
              theme,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExportOption(
    IconData icon,
    String title,
    String subtitle,
    bool value,
    ValueChanged<bool> onChanged,
    ThemeData theme,
  ) {
    return CheckboxListTile(
      value: value,
      onChanged: _isExporting ? null : onChanged,
      title: Row(
        children: [
          Icon(icon, size: 20, color: theme.colorScheme.primary),
          const SizedBox(width: 12),
          Text(title),
        ],
      ),
      subtitle: Text(subtitle),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
    );
  }

  Widget _buildExportButton(
    MaestroProject project,
    MaestroProvider provider,
    ThemeData theme,
  ) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: _isExporting
            ? null
            : () async {
                setState(() => _isExporting = true);

                final result = await provider.exportProject(
                  project.id,
                  _options,
                );

                setState(() => _isExporting = false);

                if (result != null && mounted) {
                  _showExportSuccessDialog(result, theme);
                }
              },
        icon: _isExporting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Icon(Icons.file_download),
        label: Text(_isExporting ? 'Exportando...' : 'Exportar Selecionados'),
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildExistingExports(ExportResult exports, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green),
                const SizedBox(width: 8),
                Text(
                  'Exportações Disponíveis',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (exports.reaperProject != null)
              _buildDownloadItem(
                Icons.article,
                'Projeto Reaper',
                '.rpp',
                exports.reaperProject!,
                theme,
              ),
            if (exports.midiFile != null)
              _buildDownloadItem(
                Icons.piano,
                'Arquivo MIDI',
                '.mid',
                exports.midiFile!,
                theme,
              ),
            if (exports.musicXml != null)
              _buildDownloadItem(
                Icons.library_music,
                'MusicXML',
                '.musicxml',
                exports.musicXml!,
                theme,
              ),
            if (exports.pdfScore != null)
              _buildDownloadItem(
                Icons.picture_as_pdf,
                'Partitura PDF',
                '.pdf',
                exports.pdfScore!,
                theme,
              ),
            if (exports.downloadUrl != null)
              _buildDownloadItem(
                Icons.folder_zip,
                'Pacote Completo',
                '.zip',
                exports.downloadUrl!,
                theme,
                isPrimary: true,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDownloadItem(
    IconData icon,
    String title,
    String extension,
    String path,
    ThemeData theme, {
    bool isPrimary = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: InkWell(
        onTap: () {
          Clipboard.setData(ClipboardData(text: path));
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Caminho copiado: $path')),
          );
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isPrimary
                ? theme.colorScheme.primaryContainer
                : theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(8),
            border: isPrimary
                ? Border.all(color: theme.colorScheme.primary)
                : null,
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isPrimary ? theme.colorScheme.primary : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: isPrimary ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    Text(
                      extension,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.file_copy,
                size: 20,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showExportSuccessDialog(ExportResult result, ThemeData theme) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 48),
        title: const Text('Exportação Concluída!'),
        content: const Text(
          'Seus arquivos foram gerados com sucesso. '
          'Você pode baixá-los individualmente ou como um pacote ZIP.',
        ),
        actions: [
          if (result.downloadUrl != null)
            FilledButton.tonalIcon(
              onPressed: () {
                // Open download URL
                Navigator.pop(context);
              },
              icon: const Icon(Icons.folder_zip),
              label: const Text('Baixar ZIP'),
            ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }
}

/// Export options model
class ExportOptions {
  bool reaperProject;
  bool audioStems;
  bool midiFile;
  bool musicXml;
  bool pdfScore;

  ExportOptions({
    required this.reaperProject,
    required this.audioStems,
    required this.midiFile,
    required this.musicXml,
    required this.pdfScore,
  });
}
