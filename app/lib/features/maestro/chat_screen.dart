import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/project_state.dart';
import '../providers/maestro_provider.dart';
import 'timeline_screen.dart';
import 'export_screen.dart';

/// Maestro IA Chat Screen
/// Conversational interface for musical production assistance
class MaestroChatScreen extends StatefulWidget {
  const MaestroChatScreen({super.key});

  @override
  State<MaestroChatScreen> createState() => _MaestroChatScreenState();
}

class _MaestroChatScreenState extends State<MaestroChatScreen> {
  final TextEditingController _promptController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isRecording = false;

  @override
  void dispose() {
    _promptController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  Future<void> _sendPrompt() async {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty) return;

    _promptController.clear();
    context.read<MaestroProvider>().sendPrompt(prompt);
    _scrollToBottom();
  }

  Future<void> _pickAudioFile() async {
    // TODO: Implement file picker
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Seleção de arquivo em breve disponível')),
    );
  }

  void _showYouTubeDialog() {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Baixar do YouTube'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Cole o link do YouTube',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              if (controller.text.trim().isNotEmpty) {
                await context.read<MaestroProvider>().downloadYouTube(
                      controller.text.trim(),
                    );
              }
            },
            child: const Text('Baixar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: _buildAppBar(theme),
      body: Column(
        children: [
          Expanded(
            child: Consumer<MaestroProvider>(
              builder: (context, provider, child) {
                return _buildMessagesList(provider, theme);
              },
            ),
          ),
          _buildInputArea(theme),
          _buildProgressIndicator(theme),
        ],
      ),
      floatingActionButton: Consumer<MaestroProvider>(
        builder: (context, provider, child) {
          if (provider.currentProject?.isCompleted == true) {
            return FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MaestroExportScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.file_download),
              label: const Text('Exportar'),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(ThemeData theme) {
    return AppBar(
      title: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.music_note, size: 20, color: Colors.white),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Maestro IA',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Assistente de Produção Musical',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
            ],
          ),
        ],
      ),
      actions: [
        Consumer<MaestroProvider>(
          builder: (context, provider, child) {
            return Container(
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: provider.isLoading
                    ? theme.colorScheme.primaryContainer
                    : Colors.green.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: provider.isLoading
                      ? theme.colorScheme.primary
                      : Colors.green,
                  width: 2,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: provider.isLoading
                          ? theme.colorScheme.primary
                          : Colors.green,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    provider.isLoading ? 'Processando...' : 'Online',
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.history),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const MaestroTimelineScreen(),
              ),
            );
          },
          tooltip: 'Histórico',
        ),
        IconButton(
          icon: const Icon(Icons.delete_outline),
          onPressed: () {
            context.read<MaestroProvider>().clearProject();
          },
          tooltip: 'Limpar conversa',
        ),
      ],
    );
  }

  Widget _buildMessagesList(MaestroProvider provider, ThemeData theme) {
    if (provider.messages.isEmpty) {
      return _buildWelcomeScreen(theme);
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: provider.messages.length + (provider.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index < provider.messages.length) {
          return _buildMessageBubble(provider.messages[index], theme);
        } else {
          return _buildTypingIndicator(theme);
        }
      },
    );
  }

  Widget _buildWelcomeScreen(ThemeData theme) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Icon(
                Icons.piano,
                size: 50,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Bem-vindo ao Maestro IA',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Seu assistente de produção musical autônomo',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            _buildSuggestionCard(
              icon: Icons.youtube_searched_for,
              title: 'Baixar do YouTube',
              subtitle: 'Cole um link para começar',
              onTap: _showYouTubeDialog,
              theme: theme,
            ),
            const SizedBox(height: 12),
            _buildSuggestionCard(
              icon: Icons.upload_file,
              title: 'Fazer upload',
              subtitle: 'Envie seu próprio áudio',
              onTap: _pickAudioFile,
              theme: theme,
            ),
            const SizedBox(height: 12),
            _buildSuggestionCard(
              icon: Icons.edit,
              title: 'Criar do zero',
              subtitle: 'Compose uma música original',
              onTap: () => _promptController.text = 'Crie uma música ',
              theme: theme,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuggestionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required ThemeData theme,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: theme.dividerColor),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 28, color: theme.colorScheme.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: theme.colorScheme.onSurface.withValues(alpha: 0.4)),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message, ThemeData theme) {
    final isUser = message.role == ChatRole.user;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: isUser
              ? theme.colorScheme.primary
              : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
            bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.content,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: isUser ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                3,
                (index) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: _buildDot(index, theme),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int index, ThemeData theme) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 400),
      tween: Tween(begin: 0.3, end: 1.0),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
            ),
          ),
        );
      },
      onEnd: () {
        // Restart animation
      },
    );
  }

  Widget _buildInputArea(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.attach_file),
              onPressed: _pickAudioFile,
              tooltip: 'Anexar áudio',
            ),
            IconButton(
              icon: const Icon(Icons.link),
              onPressed: _showYouTubeDialog,
              tooltip: 'YouTube',
            ),
            Expanded(
              child: TextField(
                controller: _promptController,
                decoration: InputDecoration(
                  hintText: 'Descreva o que você quer criar...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  filled: true,
                  fillColor: theme.colorScheme.surfaceContainerHighest,
                ),
                maxLines: null,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendPrompt(),
              ),
            ),
            const SizedBox(width: 8),
            Consumer<MaestroProvider>(
              builder: (context, provider, child) {
                return IconButton.filled(
                  icon: provider.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send),
                  onPressed: provider.isLoading ? null : _sendPrompt,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator(ThemeData theme) {
    return Consumer<MaestroProvider>(
      builder: (context, provider, child) {
        final project = provider.currentProject;
        if (project == null || !provider.isLoading) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: project.progress.percentage / 100,
                      backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text('${project.progress.percentage}%'),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                project.progress.message,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        );
      },
    );
  }
}
