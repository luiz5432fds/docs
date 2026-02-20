export type PcmBuffer = Float32Array;

export function phaseAccumulatorSaw(length: number, increment = 0.01): PcmBuffer {
  const out = new Float32Array(length);
  let s = 0;
  for (let i = 0; i < length; i++) {
    s += increment;
    if (s >= 1) s -= 1;
    out[i] = (s * 2) - 1;
  }
  return out;
}

export function fmSignal(length: number, sampleRate: number, fc: number, fm: number, index: number): PcmBuffer {
  const out = new Float32Array(length);
  for (let n = 0; n < length; n++) {
    const t = n / sampleRate;
    const mod = Math.sin(2 * Math.PI * fm * t);
    out[n] = Math.sin(2 * Math.PI * fc * t + index * mod);
  }
  return out;
}

export function karplusStrong(length: number, delaySamples: number, feedback = 0.996): PcmBuffer {
  const out = new Float32Array(length);
  const d = Math.max(2, delaySamples);
  const line = new Float32Array(d);
  for (let i = 0; i < d; i++) line[i] = (Math.random() * 2 - 1) * 0.7;
  let p = 0;
  for (let n = 0; n < length; n++) {
    const current = line[p];
    const next = line[(p + 1) % d];
    const avg = ((current + next) * 0.5) * feedback;
    line[p] = avg;
    out[n] = current;
    p = (p + 1) % d;
  }
  return out;
}

export function granularOverlay(source: PcmBuffer, nGrains = 60, minL = 120, maxL = 1600): PcmBuffer {
  const out = new Float32Array(source.length);
  for (let g = 0; g < nGrains; g++) {
    const L = Math.max(minL, Math.floor(minL + Math.random() * (maxL - minL)));
    const start = Math.floor(Math.random() * Math.max(1, source.length - L - 1));
    for (let i = 0; i < L; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (L - 1)); // janela hann
      out[start + i] += source[start + i] * w;
    }
  }
  return out;
}

export function peakFilterCoefficient(cutoffNorm: number): number {
  return -Math.cos(Math.PI * Math.max(0.001, Math.min(0.999, cutoffNorm)));
}

export function normalize(buf: PcmBuffer): PcmBuffer {
  let peak = 0;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  if (peak <= 1e-9) return buf;
  const g = 0.999 / peak;
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * g;
  return out;
}
