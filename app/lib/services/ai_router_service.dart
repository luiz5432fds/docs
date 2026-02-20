import 'package:flutter/foundation.dart';
import 'package:cloud_functions/cloud_functions.dart';

enum AiProviderType { firebaseFunctions, localStub, externalStub }

class AiRouterService extends ChangeNotifier {
  AiProviderType activeProvider = AiProviderType.firebaseFunctions;
  bool externalEnabled = false;
  String externalEndpoint = '';
  String externalApiKey = '';

  Future<Map<String, dynamic>> generatePatch(Map<String, dynamic> input) async {
    try {
      return await _fromProvider(activeProvider, 'generatePatch', input);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'generatePatch', input);
    }
  }

  Future<Map<String, dynamic>> evaluatePatch(Map<String, dynamic> input) async {
    try {
      return await _fromProvider(activeProvider, 'evaluatePatch', input);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'evaluatePatch', input);
    }
  }

  Future<Map<String, dynamic>> getSynthesisCodebook({int sampleRate = 44100, int length = 2048}) async {
    try {
      return await _fromProvider(activeProvider, 'getSynthesisCodebook', {'sampleRate': sampleRate, 'length': length});
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getSynthesisCodebook', {'sampleRate': sampleRate, 'length': length});
    }
  }

  Future<Map<String, dynamic>> getAdvancedDspPlaybook() async {
    try {
      return await _fromProvider(activeProvider, 'getAdvancedDspPlaybook', {});
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getAdvancedDspPlaybook', {});
    }
  }

  Future<Map<String, dynamic>> getGestureArticulationEngine({required String family, required double aftertouch}) async {
    try {
      return await _fromProvider(activeProvider, 'getGestureArticulationEngine', {'family': family, 'aftertouch': aftertouch});
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getGestureArticulationEngine', {'family': family, 'aftertouch': aftertouch});
    }
  }

  Future<Map<String, dynamic>> getMixReadyPreset({
    required bool denseBand,
    required bool hasLeadVocal,
    required bool hasBassAndKick,
    double targetLufs = -16,
  }) async {
    final payload = {
      'denseBand': denseBand,
      'hasLeadVocal': hasLeadVocal,
      'hasBassAndKick': hasBassAndKick,
      'targetLufs': targetLufs,
    };
    try {
      return await _fromProvider(activeProvider, 'getMixReadyPreset', payload);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getMixReadyPreset', payload);
    }
  }

  Future<Map<String, dynamic>> getBrassFmGuide() async {
    try {
      return await _fromProvider(activeProvider, 'getBrassFmGuide', {});
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getBrassFmGuide', {});
    }
  }


  Future<Map<String, dynamic>> getRealismToolkit({
    required String family,
    required double aftertouch,
    double jitterAmount = 0.01,
  }) async {
    final payload = {'family': family, 'aftertouch': aftertouch, 'jitterAmount': jitterAmount};
    try {
      return await _fromProvider(activeProvider, 'getRealismToolkit', payload);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getRealismToolkit', payload);
    }
  }



  Future<Map<String, dynamic>> getIntelligentAssistantAlgorithm({
    required String family,
    required double brightnessTarget,
    required double densityTarget,
    required double acousticness,
    required double aftertouch,
  }) async {
    final payload = {
      'family': family,
      'brightnessTarget': brightnessTarget,
      'densityTarget': densityTarget,
      'acousticness': acousticness,
      'aftertouch': aftertouch,
    };

    try {
      return await _fromProvider(activeProvider, 'getIntelligentAssistantAlgorithm', payload);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getIntelligentAssistantAlgorithm', payload);
    }
  }


  Future<Map<String, dynamic>> getSourceFindingsConsolidation({
    required String family,
    double targetBrightness = 0.6,
    double targetDensity = 0.45,
  }) async {
    final payload = {
      'family': family,
      'targetBrightness': targetBrightness,
      'targetDensity': targetDensity,
    };

    try {
      return await _fromProvider(activeProvider, 'getSourceFindingsConsolidation', payload);
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getSourceFindingsConsolidation', payload);
    }
  }

  Future<Map<String, dynamic>> getXps10ProgrammingGuide() async {
    try {
      return await _fromProvider(activeProvider, 'getXps10ProgrammingGuide', {});
    } catch (_) {
      return _fromProvider(AiProviderType.firebaseFunctions, 'getXps10ProgrammingGuide', {});
    }
  }

  Future<Map<String, dynamic>> _fromProvider(AiProviderType provider, String fn, Map<String, dynamic> data) async {
    switch (provider) {
      case AiProviderType.localStub:
        return {'stub': true, 'provider': 'local', 'data': data};
      case AiProviderType.externalStub:
        return {'stub': true, 'provider': 'external', 'endpoint': externalEndpoint};
      case AiProviderType.firebaseFunctions:
        final callable = FirebaseFunctions.instance.httpsCallable(fn);
        final res = await callable.call(data);
        return Map<String, dynamic>.from(res.data as Map);
    }
  }

  void setProvider(AiProviderType value) {
    activeProvider = value;
    notifyListeners();
  }
}
