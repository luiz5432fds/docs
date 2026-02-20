export function wavetableLinearInterpolation(index: number, table: number[]): number {
  if (table.length == 0) return 0;
  const i0 = Math.floor(index) % table.length;
  const i1 = (i0 + 1) % table.length;
  const frac = index - Math.floor(index);
  return table[i1] * frac + (1 - frac) * table[i0];
}

export function simpleCompressorGainDb(xDb: number, thresholdDb: number, ratio: number): number {
  if (xDb <= thresholdDb) return 0;
  const exceeded = xDb - thresholdDb;
  const compressed = exceeded / ratio;
  return (thresholdDb + compressed) - xDb;
}

export function waveguideStep(xDelayed: number, yDelayed: number, feedback: number): number {
  return xDelayed + feedback * yDelayed;
}

export function lpcResidualEstimate(input: number[], a: number[]): number[] {
  // residual e[n] = x[n] + a1*x[n-1] + ... + ap*x[n-p] (forma simplificada)
  const out = new Array<number>(input.length).fill(0);
  for (let n = 0; n < input.length; n++) {
    let e = input[n];
    for (let k = 1; k < a.length; k++) {
      const idx = n - k;
      if (idx >= 0) e += a[k] * input[idx];
    }
    out[n] = e;
  }
  return out;
}

export function basicFirStep(buffer: number[], ir: number[]): number {
  let acc = 0;
  const n = Math.min(buffer.length, ir.length);
  for (let i = 0; i < n; i++) acc += ir[i] * buffer[i];
  return acc;
}
