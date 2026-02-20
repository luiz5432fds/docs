class SysexAdapter {
  const SysexAdapter();

  bool get enabledByDefault => false;

  Future<void> sendPatch(Map<String, dynamic> patch) async {
    throw UnsupportedError('SysexAdapter desativado por padrão neste MVP.');
  }
}
