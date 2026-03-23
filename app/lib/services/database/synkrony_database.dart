/// SynKrony Local SQLite Database Service
///
/// This service provides local storage for SynKrony projects using SQLite.
/// Used for offline-first functionality and sync with Firestore.

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/synkrony_models.dart';

// ============================================================================
// DATABASE CLASS
// ============================================================================

class SynKronyDatabase {
  static final SynKronyDatabase _instance = SynKronyDatabase._internal();
  static Database? _database;

  factory SynKronyDatabase() => _instance;
  SynKronyDatabase._internal();

  // Database version
  static const int _dbVersion = 1;
  static const String _dbName = 'synkrony.db';

  // Get database instance
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  // Initialize database
  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _dbName);

    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  // Create tables
  Future<void> _onCreate(Database db, int version) async {
    // SynKrony Projects table
    await db.execute('''
      CREATE TABLE synkrony_projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        uid TEXT NOT NULL,
        genre TEXT,
        subgenre TEXT,
        key_signature TEXT,
        mode TEXT,
        tempo INTEGER,
        time_signature_numerator INTEGER,
        time_signature_denominator INTEGER,
        length_bars INTEGER,
        partimento_schema TEXT,
        regional_style TEXT,
        hardware_config TEXT,
        is_public INTEGER DEFAULT 0,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        synced INTEGER DEFAULT 0,
        sync_pending INTEGER DEFAULT 0
      )
    ''');

    // SynKrony Tracks table
    await db.execute('''
      CREATE TABLE synkrony_tracks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        instrument TEXT NOT NULL,
        instrument_id TEXT NOT NULL,
        hardware_target TEXT,
        midi_channel INTEGER DEFAULT 0,
        generated_by TEXT,
        volume INTEGER DEFAULT 100,
        pan INTEGER DEFAULT 50,
        notes_json TEXT NOT NULL,
        dynamics_json TEXT,
        articulations_json TEXT,
        FOREIGN KEY (project_id) REFERENCES synkrony_projects(id) ON DELETE CASCADE
      )
    ''');

    // Scores table
    await db.execute('''
      CREATE TABLE scores (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT NOT NULL,
        composer TEXT,
        arranger TEXT,
        tempo INTEGER,
        time_signature_json TEXT,
        key_signature TEXT,
        lyrics TEXT,
        parts_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES synkrony_projects(id) ON DELETE SET NULL
      )
    ''');

    // Local patches cache (for offline use)
    await db.execute('''
      CREATE TABLE cached_patches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        macro_json TEXT NOT NULL,
        panel_json TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');

    // Theory cache
    await db.execute('''
      CREATE TABLE theory_cache (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        key TEXT,
        mode TEXT,
        data_json TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');

    // Hardware presets
    await db.execute('''
      CREATE TABLE hardware_presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hardware_type TEXT NOT NULL,
        category TEXT,
        parameters_json TEXT NOT NULL,
        midi_channel INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    ''');

    // Usage metrics (for later sync)
    await db.execute('''
      CREATE TABLE usage_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        metadata_json TEXT,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    ''');

    // Create indexes
    await _createIndexes(db);
  }

  // Create indexes for performance
  Future<void> _createIndexes(Database db) async {
    await db.execute('CREATE INDEX idx_projects_uid ON synkrony_projects(uid)');
    await db.execute('CREATE INDEX idx_projects_genre ON synkrony_projects(genre)');
    await db.execute('CREATE INDEX idx_projects_synced ON synkrony_projects(synced)');
    await db.execute('CREATE INDEX idx_tracks_project ON synkrony_tracks(project_id)');
    await db.execute('CREATE INDEX idx_scores_project ON scores(project_id)');
    await db.execute('CREATE INDEX idx_theory_type ON theory_cache(type)');
    await db.execute('CREATE INDEX idx_theory_key_mode ON theory_cache(key, mode)');
    await db.execute('CREATE INDEX idx_usage_uid ON usage_metrics(uid)');
    await db.execute('CREATE INDEX idx_usage_synced ON usage_metrics(synced)');
  }

  // Upgrade database
  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle future migrations
    if (oldVersion < 2) {
      // Example: Add new column
      // await db.execute('ALTER TABLE synkrony_projects ADD COLUMN new_field TEXT');
    }
  }

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

  // Insert or update a project
  Future<void> upsertProject(SynKronyProjectModel project) async {
    final db = await database;

    await db.insert(
      'synkrony_projects',
      {
        'id': project.id,
        'name': project.name,
        'uid': project.uid,
        'genre': project.genre,
        'subgenre': project.subgenre,
        'key_signature': project.keySignature,
        'mode': project.mode,
        'tempo': project.tempo,
        'time_signature_numerator': project.timeSignature?.numerator,
        'time_signature_denominator': project.timeSignature?.denominator,
        'length_bars': project.lengthBars,
        'partimento_schema': project.partimentoSchema,
        'regional_style': project.regionalStyle != null
          ? _regionalStyleToJson(project.regionalStyle!)
          : null,
        'hardware_config': project.hardwareConfig != null
          ? _hardwareConfigToJson(project.hardwareConfig!)
          : null,
        'is_public': project.isPublic ? 1 : 0,
        'tags': project.tags.join(','),
        'created_at': project.createdAt.toIso8601String(),
        'updated_at': project.updatedAt?.toIso8601String(),
        'sync_pending': 1,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Delete existing tracks and insert new ones
    await db.delete(
      'synkrony_tracks',
      where: 'project_id = ?',
      whereArgs: [project.id],
    );

    for (final track in project.tracks) {
      await db.insert('synkrony_tracks', {
        'id': track.id,
        'project_id': project.id,
        'name': track.name,
        'instrument': track.instrument,
        'instrument_id': track.instrumentId,
        'hardware_target': track.hardwareTarget,
        'midi_channel': track.midiChannel,
        'generated_by': track.generatedBy,
        'volume': track.volume,
        'pan': track.pan,
        'notes_json': _notesToJson(track.notes),
        'dynamics_json': _dynamicsToJson(track.dynamics),
        'articulations_json': _articulationsToJson(track.articulations),
      });
    }
  }

  // Get a project by ID
  Future<SynKronyProjectModel?> getProject(String id) async {
    final db = await database;
    final maps = await db.query(
      'synkrony_projects',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;

    final project = _mapToProject(maps.first);
    await _loadTracksForProject(project);
    await _loadScoresForProject(project);

    return project;
  }

  // Get all projects for a user
  Future<List<SynKronyProjectModel>> getUserProjects(String uid) async {
    final db = await database;
    final maps = await db.query(
      'synkrony_projects',
      where: 'uid = ?',
      whereArgs: [uid],
      orderBy: 'updated_at DESC',
    );

    final projects = <SynKronyProjectModel>[];
    for (final map in maps) {
      final project = _mapToProject(map);
      await _loadTracksForProject(project);
      await _loadScoresForProject(project);
      projects.add(project);
    }

    return projects;
  }

  // Get projects pending sync
  Future<List<SynKronyProjectModel>> getPendingSyncProjects() async {
    final db = await database;
    final maps = await db.query(
      'synkrony_projects',
      where: 'sync_pending = ?',
      whereArgs: [1],
      orderBy: 'updated_at DESC',
    );

    final projects = <SynKronyProjectModel>[];
    for (final map in maps) {
      final project = _mapToProject(map);
      await _loadTracksForProject(project);
      projects.add(project);
    }

    return projects;
  }

  // Delete a project
  Future<void> deleteProject(String id) async {
    final db = await database;

    await db.delete(
      'synkrony_tracks',
      where: 'project_id = ?',
      whereArgs: [id],
    );

    await db.delete(
      'scores',
      where: 'project_id = ?',
      whereArgs: [id],
    );

    await db.delete(
      'synkrony_projects',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Mark project as synced
  Future<void> markProjectSynced(String id) async {
    final db = await database;
    await db.update(
      'synkrony_projects',
      {'synced': 1, 'sync_pending': 0},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // ============================================================================
  // SCORE OPERATIONS
  // ============================================================================

  // Insert or update a score
  Future<void> upsertScore(ScoreModel score, {String? projectId}) async {
    final db = await database;

    await db.insert(
      'scores',
      {
        'id': score.id,
        'project_id': projectId,
        'title': score.title,
        'composer': score.composer,
        'arranger': score.arranger,
        'tempo': score.tempo,
        'time_signature_json': score.timeSignature != null
          ? _timeSignatureToJson(score.timeSignature!)
          : null,
        'key_signature': score.keySignature,
        'lyrics': score.lyrics,
        'parts_json': _scorePartsToJson(score.parts),
        'created_at': DateTime.now().toIso8601String(),
        'synced': 0,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get a score by ID
  Future<ScoreModel?> getScore(String id) async {
    final db = await database;
    final maps = await db.query(
      'scores',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;
    return _mapToScore(maps.first);
  }

  // ============================================================================
  // PATCH CACHE OPERATIONS
  // ============================================================================

  // Cache a patch for offline use
  Future<void> cachePatch(Map<String, dynamic> patch) async {
    final db = await database;

    await db.insert(
      'cached_patches',
      {
        'id': patch['id'] as String,
        'name': patch['name'] as String,
        'category': patch['category'] as String,
        'tags': (patch['tags'] as List?)?.join(',') ?? '',
        'macro_json': _encodeJson(patch['macro']),
        'panel_json': _encodeJson(patch['panel']),
        'cached_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get cached patch
  Future<Map<String, dynamic>?> getCachedPatch(String id) async {
    final db = await database;
    final maps = await db.query(
      'cached_patches',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;

    final map = maps.first;
    return {
      'id': map['id'] as String,
      'name': map['name'] as String,
      'category': map['category'] as String,
      'tags': (map['tags'] as String?).split(','),
      'macro': _decodeJson(map['macro_json'] as String),
      'panel': _decodeJson(map['panel_json'] as String),
    };
  }

  // Clear old cache entries
  Future<void> clearOldCache({Duration olderThan = const Duration(days: 7)}) async {
    final db = await database;
    final cutoff = DateTime.now().subtract(olderThan);

    await db.delete(
      'cached_patches',
      where: 'cached_at < ?',
      whereArgs: [cutoff.toIso8601String()],
    );
  }

  // ============================================================================
  // THEORY CACHE OPERATIONS
  // ============================================================================

  // Cache theory data
  Future<void> cacheTheoryData({
    required String type,
    required String key,
    required String mode,
    required Map<String, dynamic> data,
  }) async {
    final db = await database;
    final id = '$type:$key:$mode';

    await db.insert(
      'theory_cache',
      {
        'id': id,
        'type': type,
        'key': key,
        'mode': mode,
        'data_json': _encodeJson(data),
        'cached_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get cached theory data
  Future<Map<String, dynamic>?> getCachedTheoryData(
    String type,
    String key,
    String mode,
  ) async {
    final db = await database;
    final maps = await db.query(
      'theory_cache',
      where: 'type = ? AND key = ? AND mode = ?',
      whereArgs: [type, key, mode],
    );

    if (maps.isEmpty) return null;
    return _decodeJson(maps.first['data_json'] as String);
  }

  // ============================================================================
  // HARDWARE PRESET OPERATIONS
  // ============================================================================

  // Save hardware preset
  Future<void> saveHardwarePreset(HardwarePresetModel preset) async {
    final db = await database;

    await db.insert(
      'hardware_presets',
      {
        'id': preset.id,
        'name': preset.name,
        'hardware_type': preset.hardwareType,
        'category': preset.category,
        'parameters_json': _encodeJson(preset.parameters),
        'midi_channel': preset.midiChannel,
        'is_favorite': 0,
        'created_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Get hardware presets
  Future<List<HardwarePresetModel>> getHardwarePresets(String hardwareType) async {
    final db = await database;
    final maps = await db.query(
      'hardware_presets',
      where: 'hardware_type = ?',
      whereArgs: [hardwareType],
      orderBy: 'name ASC',
    );

    return maps.map((map) => HardwarePresetModel.fromJson({
      'id': map['id'] as String,
      'name': map['name'] as String,
      'hardwareType': map['hardware_type'] as String,
      'category': map['category'] as String?,
      'parameters': _decodeJson(map['parameters_json'] as String),
      'midiChannel': map['midi_channel'] as int,
    })).toList();
  }

  // ============================================================================
  // USAGE METRICS
  // ============================================================================

  // Log usage metric
  Future<void> logUsage({
    required String uid,
    required String action,
    String? resourceType,
    String? resourceId,
    Map<String, dynamic>? metadata,
  }) async {
    final db = await database;

    await db.insert('usage_metrics', {
      'uid': uid,
      'action': action,
      'resource_type': resourceType,
      'resource_id': resourceId,
      'metadata_json': metadata != null ? _encodeJson(metadata) : null,
      'timestamp': DateTime.now().toIso8601String(),
      'synced': 0,
    });
  }

  // Get unsynced metrics
  Future<List<Map<String, dynamic>>> getUnsyncedMetrics() async {
    final db = await database;
    final maps = await db.query(
      'usage_metrics',
      where: 'synced = ?',
      whereArgs: [0],
      orderBy: 'timestamp ASC',
    );

    return maps.map((map) => {
      'id': map['id'] as int,
      'uid': map['uid'] as String,
      'action': map['action'] as String,
      'resource_type': map['resource_type'] as String?,
      'resource_id': map['resource_id'] as String?,
      'metadata': map['metadata_json'] != null
        ? _decodeJson(map['metadata_json'] as String)
        : null,
      'timestamp': map['timestamp'] as String,
    }).toList();
  }

  // Mark metrics as synced
  Future<void> markMetricsSynced(List<int> ids) async {
    final db = await database;
    for (final id in ids) {
      await db.update(
        'usage_metrics',
        {'synced': 1},
        where: 'id = ?',
        whereArgs: [id],
      );
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // Clear all data
  Future<void> clearAll() async {
    final db = await database;
    await db.delete('synkrony_tracks');
    await db.delete('synkrony_projects');
    await db.delete('scores');
    await db.delete('cached_patches');
    await db.delete('theory_cache');
    await db.delete('usage_metrics');
  }

  // Close database
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  String _regionalStyleToJson(RegionalStyle style) {
    return _encodeJson(style.toJson());
  }

  String _hardwareConfigToJson(HardwareConfigModel config) {
    return _encodeJson(config.toJson());
  }

  String _timeSignatureToJson(TimeSignature ts) {
    return _encodeJson(ts.toJson());
  }

  String _notesToJson(List<NoteModel> notes) {
    return _encodeJson(notes.map((n) => n.toJson()).toList());
  }

  String _dynamicsToJson(List dynamics) {
    return _encodeJson(dynamics);
  }

  String _articulationsToJson(List articulations) {
    return _encodeJson(articulations);
  }

  String _scorePartsToJson(List<ScorePartModel> parts) {
    return _encodeJson(parts.map((p) => p.toJson()).toList());
  }

  String _encodeJson(dynamic data) {
    // Simple JSON encoding - in real app use dart:convert
    return data.toString();
  }

  Map<String, dynamic> _decodeJson(String data) {
    // Simple JSON decoding - in real app use dart:convert
    return {};
  }

  SynKronyProjectModel _mapToProject(Map<String, dynamic> map) {
    return SynKronyProjectModel(
      id: map['id'] as String,
      name: map['name'] as String,
      uid: map['uid'] as String,
      genre: map['genre'] as String?,
      subgenre: map['subgenre'] as String?,
      keySignature: map['key_signature'] as String?,
      mode: map['mode'] as String?,
      tempo: map['tempo'] as int?,
      timeSignature: map['time_signature_numerator'] != null
        ? TimeSignature(
            numerator: map['time_signature_numerator'] as int,
            denominator: map['time_signature_denominator'] as int,
          )
        : null,
      lengthBars: map['length_bars'] as int?,
      partimentoSchema: map['partimento_schema'] as String?,
      regionalStyle: map['regional_style'] != null
        ? RegionalStyle.fromJson(_decodeJson(map['regional_style'] as String))
        : null,
      hardwareConfig: map['hardware_config'] != null
        ? HardwareConfigModel.fromJson(_decodeJson(map['hardware_config'] as String))
        : null,
      isPublic: (map['is_public'] as int) == 1,
      tags: (map['tags'] as String?).split(',').where((t) => t.isNotEmpty).toList(),
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: map['updated_at'] != null
        ? DateTime.parse(map['updated_at'] as String)
        : null,
    );
  }

  ScoreModel _mapToScore(Map<String, dynamic> map) {
    return ScoreModel(
      id: map['id'] as String,
      title: map['title'] as String,
      composer: map['composer'] as String?,
      arranger: map['arranger'] as String?,
      tempo: map['tempo'] as int?,
      timeSignature: map['time_signature_json'] != null
        ? TimeSignature.fromJson(_decodeJson(map['time_signature_json'] as String))
        : null,
      keySignature: map['key_signature'] as String?,
      lyrics: map['lyrics'] as String?,
      parts: (map['parts_json'] != null
        ? _decodeJson(map['parts_json'] as String)['parts'] as List
        : []).map((e) => ScorePartModel.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }

  Future<void> _loadTracksForProject(SynKronyProjectModel project) async {
    final db = await database;
    final maps = await db.query(
      'synkrony_tracks',
      where: 'project_id = ?',
      whereArgs: [project.id],
    );

    // This would require additional parsing logic
    // For now, placeholder
  }

  Future<void> _loadScoresForProject(SynKronyProjectModel project) async {
    final db = await database;
    final maps = await db.query(
      'scores',
      where: 'project_id = ?',
      whereArgs: [project.id],
    );

    // This would require additional parsing logic
    // For now, placeholder
  }
}
