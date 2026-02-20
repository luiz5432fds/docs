export async function mixAgent(): Promise<{mixHints: string[]}> {
  return {
    mixHints: [
      'HP sugerido: 120Hz para liberar espaço do baixo e bumbo (arranjo denso).',
      'Se o arranjo estiver denso, reduza Reverb para 35-45 e encurte Release.',
      'Realce de presença em ~2.5kHz ajuda o solo a furar a mix.',
      'Abra estéreo com Chorus moderado, evitando fase excessiva ao vivo.'
    ]
  };
}
