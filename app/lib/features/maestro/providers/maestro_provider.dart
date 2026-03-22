import 'package:flutter/foundation.dart';
import 'package:cloud_functions/cloud_functions.dart';
import '../models/project_state.dart';

/// Maestro IA State Management Provider
/// Manages the state for Maestro IA musical production assistant
class MaestroProvider with ChangeNotifier {
  final FirebaseFunctions _functions;

  // State
  MaestroProject? _currentProject;
  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  MaestroProject? get currentProject => _currentProject;
  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasActiveProject => _currentProject != null;

  MaestroProvider({FirebaseFunctions? functions})
      : _functions = functions ?? FirebaseFunctions.instance;

  /// Send a prompt to Maestro IA and process it
  Future<void> sendPrompt(String prompt, {AudioSource? audioSource}) async {
    _setLoading(true);
    _clearError();

    try {
      // Add user message
      final userMessage = ChatMessage(
        id: _generateId(),
        content: prompt,
        role: ChatRole.user,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        metadata: audioSource != null ? {'audioSource': audioSource.toJson()} : null,
      );
      _addMessage(userMessage);

      // Call Firebase function
      final result = await _functions.httpsCallable('runMaestroAgent').call({
        'prompt': prompt,
        if (audioSource != null) 'audioSource': audioSource.toJson(),
      });

      // Update project state
      final projectData = result.data as Map<String, dynamic>;
      _currentProject = MaestroProject.fromJson(projectData);

      // Add assistant response
      final assistantMessage = ChatMessage(
        id: _generateId(),
        content: _generateResponseMessage(_currentProject!),
        role: ChatRole.assistant,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        metadata: {'projectId': _currentProject!.id},
      );
      _addMessage(assistantMessage);

      notifyListeners();
    } on FirebaseFunctionsException catch (e) {
      _setError('Erro ao processar: ${e.message}');
      _addErrorMessage('Desculpe, ocorreu um erro ao processar sua solicitação.');
    } catch (e) {
      _setError('Erro inesperado: $e');
      _addErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      _setLoading(false);
    }
  }

  /// Upload audio file
  Future<String?> uploadAudioFile(String filePath, String fileName) async {
    _setLoading(true);
    _clearError();

    try {
      // This would integrate with Firebase Storage
      // For now, return a placeholder
      notifyListeners();
      return 'storage_path/$fileName';
    } catch (e) {
      _setError('Erro ao fazer upload: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Download YouTube audio
  Future<String?> downloadYouTube(String url) async {
    _setLoading(true);
    _clearError();

    try {
      final result = await _functions.httpsCallable('downloadYouTubeAudio').call({
        'url': url,
      });

      final downloadPath = result.data['path'] as String?;
      return downloadPath;
    } catch (e) {
      _setError('Erro ao baixar do YouTube: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Load existing projects
  Future<void> loadProjects() async {
    _setLoading(true);
    _clearError();

    try {
      // This would load from Firestore
      notifyListeners();
    } catch (e) {
      _setError('Erro ao carregar projetos: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Load specific project
  Future<void> loadProject(String projectId) async {
    _setLoading(true);
    _clearError();

    try {
      // This would load from Firestore
      notifyListeners();
    } catch (e) {
      _setError('Erro ao carregar projeto: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Export project files
  Future<ExportResult?> exportProject(String projectId, ExportOptions options) async {
    _setLoading(true);
    _clearError();

    try {
      final result = await _functions.httpsCallable('exportMaestroProject').call({
        'projectId': projectId,
        'options': {
          'reaperProject': options.reaperProject,
          'audioStems': options.audioStems,
          'midiFile': options.midiFile,
          'musicXml': options.musicXml,
          'pdfScore': options.pdfScore,
        },
      });

      final exportData = result.data as Map<String, dynamic>;
      return ExportResult.fromJson(exportData);
    } catch (e) {
      _setError('Erro ao exportar: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Delete project
  Future<void> deleteProject(String projectId) async {
    _setLoading(true);
    _clearError();

    try {
      // This would delete from Firestore
      if (_currentProject?.id == projectId) {
        _currentProject = null;
      }
      notifyListeners();
    } catch (e) {
      _setError('Erro ao deletar projeto: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Clear current project
  void clearProject() {
    _currentProject = null;
    _messages = [];
    notifyListeners();
  }

  /// Retry current operation
  Future<void> retry() async {
    if (_currentProject != null) {
      await sendPrompt(_currentProject!.prompt);
    }
  }

  // Private methods

  void _addMessage(ChatMessage message) {
    _messages.add(message);
  }

  void _addErrorMessage(String content) {
    final errorMessage = ChatMessage(
      id: _generateId(),
      content: content,
      role: ChatRole.assistant,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    _addMessage(errorMessage);
  }

  String _generateResponseMessage(MaestroProject project) {
    final buffer = StringBuffer();

    switch (project.status) {
      case MaestroStatus.completed:
        buffer.writeln('Projeto concluído! 🎵');
        if (project.analysis != null) {
          final analysis = project.analysis!;
          buffer.writeln('${analysis.bpm} BPM • Tom ${analysis.key}');
        }
        if (project.exports != null) {
          final exports = project.exports!;
          if (exports.reaperProject != null) {
            buffer.writeln('✓ Projeto Reaper criado');
          }
          if (exports.musicXml != null) {
            buffer.writeln('✓ Partitura gerada');
          }
        }
        break;

      case MaestroStatus.error:
        buffer.writeln('Ocorreu um erro ao processar seu projeto.');
        buffer.writeln('Por favor, tente novamente.');
        break;

      default:
        buffer.writeln(project.progress.message);
    }

    return buffer.toString().trim();
  }

  String _generateId() {
    return DateTime.now().millisecondsSinceEpoch.toString() +
        '_' +
        (messages.length + 1).toString();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }
}

/// Export options model
class ExportOptions {
  final bool reaperProject;
  final bool audioStems;
  final bool midiFile;
  final bool musicXml;
  final bool pdfScore;

  ExportOptions({
    this.reaperProject = false,
    this.audioStems = false,
    this.midiFile = false,
    this.musicXml = false,
    this.pdfScore = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'reaperProject': reaperProject,
      'audioStems': audioStems,
      'midiFile': midiFile,
      'musicXml': musicXml,
      'pdfScore': pdfScore,
    };
  }
}
