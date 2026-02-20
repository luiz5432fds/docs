# Exemplos C++ de Síntese (aplicáveis ao fluxo XPS-10)

> Observação: o XPS-10 não executa C++ diretamente. Estes exemplos representam a matemática por trás dos controles do teclado e do app.

## 1) Oscilador por acumulador de fase (wavetable)
```cpp
#include <vector>
#include <cmath>

struct PhaseOsc {
  double sampleRate {44100.0};
  double phase {0.0};
  std::vector<float> table;

  explicit PhaseOsc(size_t tableSize = 2048) {
    table.resize(tableSize);
    for (size_t i = 0; i < tableSize; ++i) {
      table[i] = std::sin(2.0 * M_PI * (double)i / (double)tableSize);
    }
  }

  float process(double freqHz, float amp) {
    const double incr = freqHz * (double)table.size() / sampleRate; // I
    phase += incr;                                                   // S[i+1] = S[i] + I
    while (phase >= table.size()) phase -= table.size();
    const size_t i0 = (size_t)phase;
    const size_t i1 = (i0 + 1) % table.size();
    const double frac = phase - (double)i0;
    const float y = (float)((1.0 - frac) * table[i0] + frac * table[i1]);
    return amp * y; // O[i] = A * F(S mod L)
  }
};
```

## 2) Síntese aditiva (Fourier)
```cpp
#include <vector>
#include <cmath>

float additiveSample(double t, double f0,
                     const std::vector<double>& amps,
                     const std::vector<double>& phases) {
  double y = 0.0;
  for (size_t n = 0; n < amps.size(); ++n) {
    const double harm = (double)(n + 1);
    y += amps[n] * std::sin(2.0 * M_PI * harm * f0 * t + phases[n]);
  }
  return (float)y;
}
```

## 3) FM clássica (portadora/moduladora)
```cpp
#include <cmath>

float fmSample(double t, double carrierHz, double modHz, double index, float amp) {
  const double mod = std::sin(2.0 * M_PI * modHz * t);
  const double y = std::sin(2.0 * M_PI * carrierHz * t + index * mod);
  return amp * (float)y;
}
```

## 4) Envelope ADSR (TVA/TVF conceitual)
```cpp
enum class EnvState { Idle, Attack, Decay, Sustain, Release };

struct ADSR {
  double sr {44100.0};
  double attackMs {20}, decayMs {120}, sustain {0.7}, releaseMs {250};
  EnvState st {EnvState::Idle};
  double value {0.0};

  void noteOn() { st = EnvState::Attack; }
  void noteOff() { st = EnvState::Release; }

  float process() {
    auto step = [&](double ms) { return (ms <= 0.0) ? 1.0 : 1.0 / (ms * 0.001 * sr); };
    switch (st) {
      case EnvState::Attack: value += step(attackMs); if (value >= 1.0) { value = 1.0; st = EnvState::Decay; } break;
      case EnvState::Decay: value -= step(decayMs); if (value <= sustain) { value = sustain; st = EnvState::Sustain; } break;
      case EnvState::Sustain: value = sustain; break;
      case EnvState::Release: value -= step(releaseMs); if (value <= 0.0) { value = 0.0; st = EnvState::Idle; } break;
      case EnvState::Idle: value = 0.0; break;
    }
    return (float)value;
  }
};
```

## 5) Ring Mod + Soft Clip (MFX)
```cpp
#include <cmath>

float ringMod(float a, float b, float drive) {
  const float ring = a * b;
  return std::tanh(drive * ring); // soft clipping aproximado
}
```

## Mapeamento prático no XPS-10
- **Cutoff/Resonance**: alteram distribuição harmônica percebida.
- **Attack/Release (TVA/TVF)**: moldam tempo e naturalidade do timbre.
- **Chorus/Reverb/MFX**: simulam espaço e espessura; reduzir em arranjo denso.
