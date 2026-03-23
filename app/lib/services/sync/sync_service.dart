/// SynKrony Sync Service
///
/// Handles synchronization between local SQLite storage and remote Firestore.
/// Provides offline-first functionality with conflict resolution.

import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../database/synkrony_database.dart';
import '../../models/synkrony_models.dart';

// ============================================================================
// SYNC STATUS
// ============================================================================

enum SyncStatus {
  idle,
  syncing,
  success,
  error,
}

enum SyncConflictResolution {
  localWins,
  remoteWins,
  merge,
  manual,
}

// ============================================================================
// SYNC RESULT
// ============================================================================

class SyncResult {
  SyncResult({
    required this.status,
    this.projectsUploaded = 0,
    this.projectsDownloaded = 0,
    this.metricsUploaded = 0,
    this.conflicts = 0,
    this.error,
  });

  final SyncStatus status;
  final int projectsUploaded;
  final int projectsDownloaded;
  final int metricsUploaded;
  final int conflicts;
  final String? error;

  bool get isSuccess => status == SyncStatus.success;
  bool get hasChanges => projectsUploaded > 0 || projectsDownloaded > 0;
}

// ============================================================================
// SYNC SERVICE
// ============================================================================

class SyncService {
  SyncService({
    required this.firestore,
    required this.database,
    this.conflictResolution = SyncConflictResolution.remoteWins,
  });

  final FirebaseFirestore firestore;
  final SynKronyDatabase database;
  final SyncConflictResolution conflictResolution;

  final _syncController = StreamController<SyncStatus>.broadcast();
  Stream<SyncStatus> get statusStream => _syncController.stream;

  SyncStatus _currentStatus = SyncStatus.idle;
  SyncStatus get currentStatus => _currentStatus;

  // ============================================================================
  // MAIN SYNC METHODS
  // ============================================================================

  /// Perform full sync
  Future<SyncResult> fullSync(String uid) async {
    _updateStatus(SyncStatus.syncing);

    try {
      int uploaded = 0;
      int downloaded = 0;
      int metrics = 0;
      int conflicts = 0;

      // Upload pending local changes
      final uploadResult = await _uploadPendingChanges(uid);
      uploaded += uploadResult.projects;
      metrics += uploadResult.metrics;
      conflicts += uploadResult.conflicts;

      // Download remote changes
      final downloadResult = await _downloadRemoteChanges(uid);
      downloaded += downloadResult.projects;
      conflicts += downloadResult.conflicts;

      // Upload usage metrics
      await _uploadUsageMetrics(uid);

      _updateStatus(SyncStatus.success);
      return SyncResult(
        status: SyncStatus.success,
        projectsUploaded: uploaded,
        projectsDownloaded: downloaded,
        metricsUploaded: metrics,
        conflicts: conflicts,
      );
    } catch (e) {
      _updateStatus(SyncStatus.error);
      return SyncResult(
        status: SyncStatus.error,
        error: e.toString(),
      );
    }
  }

  /// Quick sync (projects only)
  Future<SyncResult> quickSync(String uid) async {
    _updateStatus(SyncStatus.syncing);

    try {
      int uploaded = 0;
      int downloaded = 0;
      int conflicts = 0;

      // Only sync projects
      final uploadResult = await _uploadPendingProjects(uid);
      uploaded += uploadResult.projects;
      conflicts += uploadResult.conflicts;

      final downloadResult = await _downloadRecentProjects(uid);
      downloaded += downloadResult.projects;
      conflicts += downloadResult.conflicts;

      _updateStatus(SyncStatus.success);
      return SyncResult(
        status: SyncStatus.success,
        projectsUploaded: uploaded,
        projectsDownloaded: downloaded,
        conflicts: conflicts,
      );
    } catch (e) {
      _updateStatus(SyncStatus.error);
      return SyncResult(
        status: SyncStatus.error,
        error: e.toString(),
      );
    }
  }

  // ============================================================================
  // UPLOAD OPERATIONS
  // ============================================================================

  Future<_UploadResult> _uploadPendingChanges(String uid) async {
    int projects = 0;
    int metrics = 0;
    int conflicts = 0;

    // Upload projects
    final pendingProjects = await database.getPendingSyncProjects();
    for (final project in pendingProjects) {
      final result = await _uploadProject(project);
      if (result == _UploadStatus.uploaded) {
        projects++;
        await database.markProjectSynced(project.id);
      } else if (result == _UploadStatus.conflict) {
        conflicts++;
      }
    }

    return _UploadResult(projects: projects, metrics: metrics, conflicts: conflicts);
  }

  Future<_UploadResult> _uploadPendingProjects(String uid) async {
    int projects = 0;
    int conflicts = 0;

    final pendingProjects = await database.getPendingSyncProjects();
    for (final project in pendingProjects) {
      final result = await _uploadProject(project);
      if (result == _UploadStatus.uploaded) {
        projects++;
        await database.markProjectSynced(project.id);
      } else if (result == _UploadStatus.conflict) {
        conflicts++;
      }
    }

    return _UploadResult(projects: projects, metrics: 0, conflicts: conflicts);
  }

  enum _UploadStatus { uploaded, conflict, error }

  Future<_UploadStatus> _uploadProject(SynKronyProjectModel project) async {
    try {
      final ref = firestore.collection('synkrony_projects').doc(project.id);

      // Check for conflicts
      final doc = await ref.get();
      if (doc.exists && doc.data()?['updated_at'] != null) {
        final remoteUpdated = DateTime.parse(doc.data()!['updated_at'] as String);
        final localUpdated = project.updatedAt ?? project.createdAt;

        if (remoteUpdated.isAfter(localUpdated)) {
          // Conflict: remote is newer
          switch (conflictResolution) {
            case SyncConflictResolution.remoteWins:
              // Skip upload, will download on next sync
              return _UploadStatus.conflict;
            case SyncConflictResolution.localWins:
              // Force upload
              break;
            case SyncConflictResolution.merge:
              // Merge would go here
              break;
            case SyncConflictResolution.manual:
              // Would trigger UI prompt
              return _UploadStatus.conflict;
          }
        }
      }

      // Upload project
      await ref.set(project.toJson(), SetOptions(merge: true));
      return _UploadStatus.uploaded;
    } catch (e) {
      return _UploadStatus.error;
    }
  }

  Future<void> _uploadUsageMetrics(String uid) async {
    final metrics = await database.getUnsyncedMetrics();
    if (metrics.isEmpty) return;

    final batch = firestore.batch();
    final collection = firestore.collection('usage_metrics');

    for (final metric in metrics) {
      final ref = collection.doc();
      batch.set(ref, {
        'uid': metric['uid'],
        'action': metric['action'],
        'resource_type': metric['resource_type'],
        'resource_id': metric['resource_id'],
        'metadata': metric['metadata'],
        'timestamp': metric['timestamp'],
      });
    }

    await batch.commit();

    // Mark as synced
    final ids = metrics.map((m) => m['id'] as int).toList();
    await database.markMetricsSynced(ids);
  }

  // ============================================================================
  // DOWNLOAD OPERATIONS
  // ============================================================================

  Future<_DownloadResult> _downloadRemoteChanges(String uid) async {
    int projects = 0;
    int conflicts = 0;

    // Get last sync time from preferences
    final lastSync = await _getLastSyncTime(uid);

    // Query for projects updated since last sync
    final query = firestore
        .collection('synkrony_projects')
        .where('uid', isEqualTo: uid)
        .where('updated_at', isGreaterThan: lastSync?.toIso8601String());

    final snapshot = await query.get();

    for (final doc in snapshot.docs) {
      final data = doc.data();
      final project = SynKronyProjectModel.fromJson(data);

      // Check for local changes
      final localProject = await database.getProject(project.id);
      if (localProject != null) {
        final localUpdated = localProject.updatedAt ?? localProject.createdAt;
        final remoteUpdated = project.updatedAt ?? project.createdAt;

        if (localUpdated != remoteUpdated) {
          conflicts++;
          // Handle conflict based on resolution strategy
          switch (conflictResolution) {
            case SyncConflictResolution.localWins:
              // Keep local, skip download
              continue;
            case SyncConflictResolution.remoteWins:
              // Overwrite with remote
              break;
            case SyncConflictResolution.merge:
              // Would merge here
              break;
            case SyncConflictResolution.manual:
              // Skip and notify
              continue;
          }
        }
      }

      await database.upsertProject(project);
      await database.markProjectSynced(project.id);
      projects++;
    }

    await _saveLastSyncTime(uid);

    return _DownloadResult(projects: projects, conflicts: conflicts);
  }

  Future<_DownloadResult> _downloadRecentProjects(String uid) async {
    int projects = 0;
    int conflicts = 0;

    // Get recent projects (last 30 days)
    final cutoff = DateTime.now().subtract(const Duration(days: 30));

    final query = firestore
        .collection('synkrony_projects')
        .where('uid', isEqualTo: uid)
        .orderBy('updated_at', descending: true)
        .limit(50);

    final snapshot = await query.get();

    for (final doc in snapshot.docs) {
      final data = doc.data();
      final project = SynKronyProjectModel.fromJson(data);

      final localProject = await database.getProject(project.id);
      if (localProject == null) {
        // New project, download
        await database.upsertProject(project);
        await database.markProjectSynced(project.id);
        projects++;
      }
    }

    return _DownloadResult(projects: projects, conflicts: conflicts);
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  Future<SynKronyProjectModel?> resolveConflict({
    required String projectId,
    required SyncConflictResolution strategy,
  }) async {
    final local = await database.getProject(projectId);
    if (local == null) return null;

    final doc = await firestore.collection('synkrony_projects').doc(projectId).get();
    if (!doc.exists) return local;

    final remote = SynKronyProjectModel.fromJson(doc.data()!);

    switch (strategy) {
      case SyncConflictResolution.localWins:
        await _uploadProject(local);
        return local;

      case SyncConflictResolution.remoteWins:
        await database.upsertProject(remote);
        return remote;

      case SyncConflictResolution.manual:
        // Would require UI interaction
        return null;

      case SyncConflictResolution.merge:
        return _mergeProjects(local, remote);
    }
  }

  SynKronyProjectModel _mergeProjects(
    SynKronyProjectModel local,
    SynKronyProjectModel remote,
  ) {
    // Simple merge strategy: use most recent for each field
    final localUpdated = local.updatedAt ?? local.createdAt;
    final remoteUpdated = remote.updatedAt ?? remote.createdAt;

    return SynKronyProjectModel(
      id: local.id,
      name: remoteUpdated.isAfter(localUpdated) ? remote.name : local.name,
      uid: local.uid,
      createdAt: local.createdAt.isBefore(remote.createdAt)
          ? local.createdAt
          : remote.createdAt,
      updatedAt: DateTime.now(),
      genre: remote.genre ?? local.genre,
      subgenre: remote.subgenre ?? local.subgenre,
      keySignature: remote.keySignature ?? local.keySignature,
      mode: remote.mode ?? local.mode,
      tempo: remote.tempo ?? local.tempo,
      timeSignature: remote.timeSignature ?? local.timeSignature,
      lengthBars: remote.lengthBars ?? local.lengthBars,
      partimentoSchema: remote.partimentoSchema ?? local.partimentoSchema,
      regionalStyle: remote.regionalStyle ?? local.regionalStyle,
      tracks: remoteUpdated.isAfter(localUpdated) ? remote.tracks : local.tracks,
      scores: remoteUpdated.isAfter(localUpdated) ? remote.scores : local.scores,
      hardwareConfig: remote.hardwareConfig ?? local.hardwareConfig,
      isPublic: remote.isPublic || local.isPublic,
      tags: {...local.tags, ...remote.tags}.toList(),
    );
  }

  // ============================================================================
  // AUTO SYNC
  // ============================================================================

  Timer? _autoSyncTimer;
  static const defaultAutoSyncInterval = Duration(minutes: 5);

  void startAutoSync(String uid, {Duration? interval}) {
    stopAutoSync();
    _autoSyncTimer = Timer.periodic(
      interval ?? defaultAutoSyncInterval,
      (_) => quickSync(uid),
    );
  }

  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = null;
  }

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  Future<DateTime?> _getLastSyncTime(String uid) async {
    // Would use shared_preferences
    return null;
  }

  Future<void> _saveLastSyncTime(String uid) async {
    // Would use shared_preferences
  }

  // ============================================================================
  // STATUS
  // ============================================================================

  void _updateStatus(SyncStatus status) {
    _currentStatus = status;
    _syncController.add(status);
  }

  void dispose() {
    stopAutoSync();
    _syncController.close();
  }
}

// ============================================================================
// HELPER CLASSES
// ============================================================================

class _UploadResult {
  _UploadResult({
    required this.projects,
    required this.metrics,
    required this.conflicts,
  });

  final int projects;
  final int metrics;
  final int conflicts;
}

class _DownloadResult {
  _DownloadResult({
    required this.projects,
    required this.conflicts,
  });

  final int projects;
  final int conflicts;
}
