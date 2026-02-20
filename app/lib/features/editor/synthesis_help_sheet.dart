import 'package:flutter/material.dart';

class SynthesisHelpSheet extends StatelessWidget {
  const SynthesisHelpSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, controller) => Container(
        color: const Color(0xFF161A22),
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.all(16),
          children: const [
            Text('Ajuda de Síntese (PT-BR)', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 12),
            Text('Oscilador digital: S[i+1] = S[i] + I | O[i] = A * F(S[i] mod L)'),
            SizedBox(height: 8),
            Text('Fourier: Waveform = Σ (A_n * sin(nωt + φ_n))'),
            SizedBox(height: 8),
            Text('FM: e = A * sin(αt + I * sin(βt))'),
            SizedBox(height: 12),
            Text('Como usar no XPS-10:'),
            Text('• Cutoff abre/fecha brilho; resonance realça borda harmônica.'),
            Text('• Attack/Release modelam a dinâmica (TVA/TVF).'),
            Text('• Chorus/Reverb criam espaço, mas em banda densa use com cuidado.'),
            SizedBox(height: 8),
            Text('FM via LFO (XPS-10): use LFO rápido no pitch com depth controlada para aproximar inarmônicos.'),
            Text('Ring Mod: multiplicação de sinais para timbres metálicos (soma/diferença espectral).'),
            Text('Aftertouch/Expressão: trate pressão como variável física (sopro/arco/lábio).'),
            SizedBox(height: 12),
            Text('Dica ao vivo:'),
            Text('• Ative Safety Lock e use Registrations para trocar rápido entre verso/refrão/solo.'),
            SizedBox(height: 12),
            Text(
              'Aviso: Decodificação de som é aproximação limitada aos controles do XPS-10; não é clonagem perfeita.',
              style: TextStyle(color: Colors.amber),
            ),
          ],
        ),
      ),
    );
  }
}
