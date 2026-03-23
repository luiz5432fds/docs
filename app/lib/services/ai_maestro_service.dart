import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;

/// AI Maestro Service - Conecta ao backend Python
///
/// Fornece métodos para composição, análise de áudio e consultas RAG.
class AIMaestroService {
  /// URL base da API (configurável)
  final String baseUrl;

  /// Cliente HTTP
  final http.Client _client;

  /// Timeout para requisições (em segundos)
  final int timeoutSeconds;

  AIMaestroService({
    this.baseUrl = 'http://localhost:8000',
    http.Client? client,
    this.timeoutSeconds = 120,
  }) : _client = client ?? http.Client();

  /// Verifica saúde do serviço
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final response = await _client
          .get(Uri.parse('$baseUrl/health'))
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      throw Exception('Serviço indisponível: ${response.statusCode}');
    } catch (e) {
      throw Exception('Erro ao conectar: $e');
    }
  }

  /// Lista todos os gêneros suportados
  Future<Map<String, dynamic>> getGenres() async {
    final response = await _client
        .get(Uri.parse('$baseUrl/genres'))
        .timeout(Duration(seconds: 10));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao buscar gêneros: ${response.statusCode}');
  }

  /// Gera uma composição musical
  Future<Map<String, dynamic>> compose({
    required String genre,
    int? tempo,
    String key = 'C',
    int lengthBars = 32,
    String mood = 'neutral',
    String? title,
  }) async {
    final request = {
      'genre': genre,
      'tempo': tempo,
      'key': key,
      'length_bars': lengthBars,
      'mood': mood,
      if (title != null) 'title': title,
    };

    final response = await _client
        .post(
          Uri.parse('$baseUrl/compose'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: timeoutSeconds));

    if (response.statusCode == 200) {
      final result = jsonDecode(response.body) as Map<String, dynamic>;
      // Download URL para absoluto
      if (result['download_url'] != null) {
        result['download_url'] = '$baseUrl${result['download_url']}';
      }
      return result;
    }
    throw Exception('Erro ao compor: ${response.statusCode}');
  }

  /// Baixa e analisa áudio do YouTube
  Future<Map<String, dynamic>> analyzeYouTube(String youtubeUrl) async {
    final request = {'youtube_url': youtubeUrl};

    final response = await _client
        .post(
          Uri.parse('$baseUrl/analyze'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: 300)); // 5 min para download/análise

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao analisar: ${response.statusCode}');
  }

  /// Cria projeto completo (Reaper + MuseScore)
  Future<Map<String, dynamic>> createProject({
    required String name,
    required String genre,
    int? tempo,
    String key = 'C',
  }) async {
    final request = {
      'name': name,
      'genre': genre,
      'tempo': tempo,
      'key': key,
    };

    final response = await _client
        .post(
          Uri.parse('$baseUrl/project/create'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: 30));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao criar projeto: ${response.statusCode}');
  }

  /// Faz pergunta ao AI Maestro (RAG)
  Future<Map<String, dynamic>> query(
    String question, {
    String? context,
  }) async {
    final request = {
      'question': question,
      if (context != null) 'context': context,
    };

    final response = await _client
        .post(
          Uri.parse('$baseUrl/query'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: 60));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro na consulta: ${response.statusCode}');
  }

  /// Sugere arranjo para um gênero
  Future<Map<String, dynamic>> suggestArrangement({
    required String genre,
    String? mood,
    List<String>? instruments,
  }) async {
    final request = {
      'genre': genre,
      'mood': mood,
      'instruments': instruments,
    };

    final response = await _client
        .post(
          Uri.parse('$baseUrl/arrange/suggest'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: 60));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao sugerir arranjo: ${response.statusCode}');
  }

  /// Explica uma técnica musical
  Future<Map<String, dynamic>> explainTechnique(
    String technique, {
    String? context,
  }) async {
    final request = {
      'technique': technique,
      'context': context,
    };

    final response = await _client
        .post(
          Uri.parse('$baseUrl/technique/explain'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(request),
        )
        .timeout(Duration(seconds: 60));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao explicar técnica: ${response.statusCode}');
  }

  /// Lista projetos criados
  Future<Map<String, dynamic>> listProjects() async {
    final response = await _client
        .get(Uri.parse('$baseUrl/projects'))
        .timeout(Duration(seconds: 10));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao listar projetos: ${response.statusCode}');
  }

  /// Download de arquivo gerado
  Future<http.Response> downloadFile(String filename) async {
    final response = await _client
        .get(Uri.parse('$baseUrl/download/$filename'))
        .timeout(Duration(seconds: 60));

    if (response.statusCode == 200) {
      return response;
    }
    throw Exception('Erro ao baixar arquivo: ${response.statusCode}');
  }

  /// Inicia treinamento em background
  Future<Map<String, dynamic>> startTraining() async {
    final response = await _client
        .post(Uri.parse('$baseUrl/train'))
        .timeout(Duration(seconds: 5));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao iniciar treinamento: ${response.statusCode}');
  }

  /// Verifica status do treinamento
  Future<Map<String, dynamic>> getTrainingStatus() async {
    final response = await _client
        .get(Uri.parse('$baseUrl/train/status'))
        .timeout(Duration(seconds: 5));

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Erro ao verificar status: ${response.statusCode}');
  }

  /// Fecha o cliente HTTP
  void dispose() {
    _client.close();
  }
}

/// Modelo para resultado de composição
class CompositionResult {
  final String title;
  final String genre;
  final int tempo;
  final String timeSignature;
  final String key;
  final int numNotes;
  final String downloadUrl;
  final String filename;

  CompositionResult({
    required this.title,
    required this.genre,
    required this.tempo,
    required this.timeSignature,
    required this.key,
    required this.numNotes,
    required this.downloadUrl,
    required this.filename,
  });

  factory CompositionResult.fromJson(Map<String, dynamic> json) {
    final comp = json['composition'] as Map<String, dynamic>;
    return CompositionResult(
      title: comp['title'] as String,
      genre: comp['genre'] as String,
      tempo: comp['tempo'] as int,
      timeSignature: comp['time_signature'] as String,
      key: comp['key'] as String,
      numNotes: comp['num_notes'] as int,
      downloadUrl: json['download_url'] as String,
      filename: json['filename'] as String,
    );
  }
}

/// Modelo para resultado de análise de áudio
class AudioAnalysisResult {
  final double bpm;
  final String key;
  final double duration;
  final int onsetCount;

  AudioAnalysisResult({
    required this.bpm,
    required this.key,
    required this.duration,
    required this.onsetCount,
  });

  factory AudioAnalysisResult.fromJson(Map<String, dynamic> json) {
    final analysis = json['analysis'] as Map<String, dynamic>;
    return AudioAnalysisResult(
      bpm: (analysis['bpm'] as num).toDouble(),
      key: analysis['key'] as String,
      duration: (analysis['duration'] as num).toDouble(),
      onsetCount: analysis['onset_count'] as int,
    );
  }
}

/// Modelo para gênero musical
class MusicalGenre {
  final String id;
  final String name;
  final String? origin;
  final List<int>? tempoRange;
  final String? period;

  MusicalGenre({
    required this.id,
    required this.name,
    this.origin,
    this.tempoRange,
    this.period,
  });

  factory MusicalGenre.fromJson(Map<String, dynamic> json) {
    return MusicalGenre(
      id: json['id'] as String,
      name: json['name'] as String,
      origin: json['origin'] as String?,
      tempoRange: json['tempo_range'] != null
          ? List<int>.from(json['tempo_range'] as List)
          : null,
      period: json['period'] as String?,
    );
  }
}

/// Modelo para lista de gêneros
class GenresList {
  final List<MusicalGenre> brazilian;
  final List<MusicalGenre> classical;

  GenresList({
    required this.brazilian,
    required this.classical,
  });

  factory GenresList.fromJson(Map<String, dynamic> json) {
    return GenresList(
      brazilian: (json['brazilian'] as List)
          .map((e) => MusicalGenre.fromJson(e as Map<String, dynamic>))
          .toList(),
      classical: (json['classical'] as List)
          .map((e) => MusicalGenre.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  /// Retorna todos os gêneros
  List<MusicalGenre> get all => [...brazilian, ...classical];
}
