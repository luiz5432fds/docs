export async function styleAgent(input: any): Promise<{styleHints: string[]}> {
  const style = String(input?.style ?? 'pop');
  return {
    styleHints: [
      `Estilo alvo: ${style}. Prefira release moderado para groove limpo.`,
      'Em refrão, aumente width e air para sensação de expansão.',
      'No verso, segure resonance para manter inteligibilidade.'
    ]
  };
}
