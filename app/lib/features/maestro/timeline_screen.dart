import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/project_state.dart';
import '../providers/maestro_provider.dart';

/// Maestro IA Timeline Screen
/// Visual timeline of project progress and stages
class MaestroTimelineScreen extends StatelessWidget {
  const MaestroTimelineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Linha do Tempo'),
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
                    Icons.history,
                    size: 64,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Nenhum projeto ativo',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Inicie uma nova conversa para criar um projeto',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildProjectHeader(project, theme),
              const SizedBox(height: 24),
              _buildTimeline(project, theme),
              const SizedBox(height: 24),
              if (project.analysis != null) _buildAnalysisCard(project.analysis!, theme),
              const SizedBox(height: 16),
              if (project.arrangement != null) _buildArrangementCard(project.arrangement!, theme),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProjectHeader(MaestroProject project, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getStatusIcon(project.status),
                  color: _getStatusColor(project.status),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getStatusText(project.status),
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Criado em ${_formatDate(project.createdAt)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                _buildStatusBadge(project.status, theme),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              project.prompt,
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(MaestroProject project, ThemeData theme) {
    final steps = [
      {'id': 'downloading', 'label': 'Download de Áudio', 'icon': Icons.download},
      {'id': 'analyzing', 'label': 'Análise Musical', 'icon': Icons.analyze},
      {'id': 'arranging', 'label': 'Criação de Arranjo', 'icon': Icons.music_note},
      {'id': 'exporting', 'label': 'Exportação', 'icon': Icons.file_download},
    ];

    final completedSteps = project.progress.completedSteps;
    final currentStep = project.progress.currentStep;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Progresso do Projeto',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...steps.mapAsList((index, step) {
              final stepId = step['id'] as String;
              final isCompleted = completedSteps.contains(stepId);
              final isCurrent = currentStep == stepId;
              final icon = step['icon'] as IconData;

              return Column(
                children: [
                  _buildTimelineStep(
                    step['label'] as String,
                    icon,
                    isCompleted,
                    isCurrent,
                    index,
                    theme,
                  ),
                  if (index < steps.length - 1)
                    _buildTimelineConnector(isCompleted, theme),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineStep(
    String label,
    IconData icon,
    bool isCompleted,
    bool isCurrent,
    int index,
    ThemeData theme,
  ) {
    final color = isCompleted
        ? Colors.green
        : isCurrent
            ? theme.colorScheme.primary
            : theme.colorScheme.onSurface.withValues(alpha: 0.3);

    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
              color: isCompleted || isCurrent ? color : null,
            ),
          ),
        ),
        if (isCompleted)
          Icon(Icons.check_circle, color: Colors.green, size: 20)
        else if (isCurrent)
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: color),
          ),
      ],
    );
  }

  Widget _buildTimelineConnector(bool isActive, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.only(left: 20),
      child: Container(
        width: 2,
        height: 24,
        color: isActive
            ? Colors.green
            : theme.colorScheme.onSurface.withValues(alpha: 0.2),
      ),
    );
  }

  Widget _buildAnalysisCard(MusicalAnalysis analysis, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.equalizer, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Análise Musical',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildStatChip(
                  Icons.speed,
                  '${analysis.bpm.toInt()} BPM',
                  theme,
                ),
                _buildStatChip(
                  Icons.music_note,
                  'Tom ${analysis.key}',
                  theme,
                ),
                _buildStatChip(
                  Icons.schedule,
                  analysis.timeSignature,
                  theme,
                ),
              ],
            ),
            if (analysis.sections.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Seções',
                style: theme.textTheme.labelLarge,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: analysis.sections
                    .map((section) => Chip(
                          label: Text(section.label),
                          backgroundColor: theme.colorScheme.primaryContainer,
                        ))
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildArrangementCard(MusicalArrangement arrangement, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.piano, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Arranjo',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Chip(
                  label: Text(arrangement.style.toUpperCase()),
                  backgroundColor: theme.colorScheme.primaryContainer,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Instrumentos',
              style: theme.textTheme.labelLarge,
            ),
            const SizedBox(height: 8),
            ...arrangement.instruments.map((inst) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Icon(
                        _getInstrumentIcon(inst.role),
                        size: 16,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: Text(inst.name)),
                      Text(
                        inst.role,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String label, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 6),
          Text(label, style: theme.textTheme.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(MaestroStatus status, ThemeData theme) {
    Color color;
    String label;

    switch (status) {
      case MaestroStatus.completed:
        color = Colors.green;
        label = 'Concluído';
        break;
      case MaestroStatus.error:
        color = Colors.red;
        label = 'Erro';
        break;
      default:
        color = theme.colorScheme.primary;
        label = 'Em andamento';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  IconData _getStatusIcon(MaestroStatus status) {
    switch (status) {
      case MaestroStatus.completed:
        return Icons.check_circle;
      case MaestroStatus.error:
        return Icons.error;
      default:
        return Icons.pending;
    }
  }

  Color _getStatusColor(MaestroStatus status) {
    switch (status) {
      case MaestroStatus.completed:
        return Colors.green;
      case MaestroStatus.error:
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  String _getStatusText(MaestroStatus status) {
    switch (status) {
      case MaestroStatus.processing:
        return 'Processando';
      case MaestroStatus.analyzing:
        return 'Analisando';
      case MaestroStatus.arranging:
        return 'Criando arranjo';
      case MaestroStatus.generating:
        return 'Gerando conteúdo';
      case MaestroStatus.exporting:
        return 'Exportando';
      case MaestroStatus.completed:
        return 'Concluído';
      case MaestroStatus.error:
        return 'Erro';
    }
  }

  IconData _getInstrumentIcon(String role) {
    switch (role) {
      case 'melody':
        return Icons.music_note;
      case 'harmony':
        return Icons.piano;
      case 'bass':
        return Icons.graphic_eq;
      case 'drums':
        return Icons.album;
      default:
        return Icons.speaker;
    }
  }

  String _formatDate(int timestamp) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return '${date.day}/${date.month}/${date.year}';
  }
}
