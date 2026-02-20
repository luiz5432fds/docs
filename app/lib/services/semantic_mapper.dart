class SemanticMapper {
  static Map<String, int> mapDescriptors(List<String> descriptors) {
    var cutoff = 64;
    var resonance = 40;
    var attack = 24;
    var release = 50;
    var chorus = 35;
    var reverb = 45;

    for (final d in descriptors.map((e) => e.toLowerCase().trim())) {
      if (d == 'quente') {
        cutoff -= 12;
        resonance += 6;
        release += 10;
      } else if (d == 'brilhante') {
        cutoff += 16;
        resonance += 4;
      } else if (d == 'áspero' || d == 'aspero') {
        resonance += 18;
      } else if (d == 'largo') {
        chorus += 18;
        reverb += 14;
      } else if (d == 'seco') {
        reverb -= 18;
        chorus -= 8;
      } else if (d == 'percussivo') {
        attack -= 10;
        release -= 10;
      }
    }

    int clamp(int v) => v.clamp(0, 127);
    return {
      'cutoff': clamp(cutoff),
      'resonance': clamp(resonance),
      'attack': clamp(attack),
      'release': clamp(release),
      'chorus': clamp(chorus),
      'reverb': clamp(reverb),
    };
  }
}
