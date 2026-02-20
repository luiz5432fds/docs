import {PatchDraft} from '../types';

export async function synthAgent(input: any): Promise<Partial<PatchDraft>> {
  const role = String(input?.role ?? 'tecladista');
  return {
    name: `Patch ${role} IA`,
    category: String(input?.category ?? 'Synth Lead'),
    tags: ['xps10', 'ia', role],
    macro: {brightness: 62, bite: 48, warmth: 55, width: 60, dirt: 20, air: 50},
    panel: {cutoff: 89, resonance: 48, attack: 22, release: 68, chorus: 44, reverb: 57},
    recipeSteps: [
      'Oscilador digital: aumente I (incremento de fase) para elevar sensação de altura/frequência.',
      'Fourier na prática: ajuste Cutoff/Resonance para redistribuir harmônicos audíveis.',
      'Envelope TVA/TVF: Attack curto para definição, Release moderado para não borrar a mix.',
      'Use Reverb moderado para não embolar com bateria e guitarra.'
    ]
  };
}
