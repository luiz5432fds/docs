/**
 * SynKrony Regional Agent
 *
 * Adapts musical compositions to regional Brazilian styles:
 * - Brega Romântico: Emotional, melodramatic, with lush arrangements
 * - Forró Piseiro: Fast-paced, danceable, syncopated rhythms
 * - Tecnobrega: Electronic, heavy bass, synth-oriented
 * - Forró Baião: Traditional, accordion-led, rhythmic
 *
 * This agent applies authentic regional characteristics while
 * maintaining musical coherence.
 */

import {NoteData, RegionalStyle, Progression} from '../types';

// ============================================================================
// REGIONAL STYLE PROFILES
// ============================================================================

interface RegionalProfile {
  name: string;
  category: 'brega' | 'forro' | 'tecnobrega';
  tempo_range: {min: number; max: number};
  characteristics: string[];
  instrumentation: string[];
  harmony_rules: string[];
  melody_rules: string[];
  rhythm_rules: string[];
  mix_recommendations: string[];
}

const REGIONAL_PROFILES: Record<string, RegionalProfile> = {
  brega_romantico: {
    name: 'Brega Romântico',
    category: 'brega',
    tempo_range: {min: 85, max: 105},
    characteristics: [
      'Melodias emotivas e dramáticas',
      'Harmonias românticas com acordes maiores e suspensões',
      'Arranjos luxuriantes com metais e cordas',
      'Baixo melódico e expressivo'
    ],
    instrumentation: [
      'inst_piano', 'inst_organ', 'inst_saxophone',
      'inst_trumpet', 'inst_violin', 'inst_cello'
    ],
    harmony_rules: [
      'Usar cadências II-V-I com sétimas suspensas',
      'Acorde de suspense no grau VI antes do refrão',
      'Acordes maiores preferenciais mesmo em tonalidades menores',
      'Sextas e oitavas abertas no baixo'
    ],
    melody_rules: [
      'Linhas melódicas cantáveis com intervalos expressivos',
      'Uso de appoggiaturas para efeito emocional',
      'Registro agudo para moments de clímax',
      'Fermatas em pontos de tensão emocional'
    ],
    rhythm_rules: [
      'Andamento médio (85-105 BPM)',
      'Acentos leves nos tempos 2 e 4',
      'Liberdade rítmica para expressividade'
    ],
    mix_recommendations: [
      'Reverb amplo para atmosfera emocional',
      'Compressão moderada para manter dinâmicas',
      'Largura estéreo média (60-80%)',
      'Boost em graves (2-4 dB) para presença'
    ]
  },

  forro_piseiro: {
    name: 'Forró Piseiro',
    category: 'forro',
    tempo_range: {min: 155, max: 175},
    characteristics: [
      'Ritmo acelerado para dança',
      'Sincopação característica',
      'Instrumentação regional: zabumba, triângulo, sanfona',
      'Energia contagiante e festiva'
    ],
    instrumentation: [
      'inst_zabumba', 'inst_triangle', 'inst_sanfona',
      'inst_pifano', 'inst_flute'
    ],
    harmony_rules: [
      'Progressões I-IV-V simples e diretas',
      'Acordes maiores e menores diatônicos',
      'Cadências V-I autênticas no final de frases',
      'Harmonias rítmicas sincopadas'
    ],
    melody_rules: [
      'Linhas melódicas curtas e repetitivas',
      'Frases de 4 ou 8 compassos',
      'Uso de tríades em arpejo para sanfona',
      'Ornamentações típicas: mordentes, trilos'
    ],
    rhythm_rules: [
      'Tempo rápido (155-175 BPM)',
      'Binário acentuado: FOR-ró, FOR-ró',
      'Sextilas no baixo (dum-tiqui-tá-dum-tiqui-tá)',
      'Zabumba com padrão característico'
    ],
    mix_recommendations: [
      'Instrumentação seca e presente',
      'Percussão à frente',
      'Estéreo mais fechado (40-60%)',
      'Presença de médios-graves'
    ]
  },

  forro_baião: {
    name: 'Forró Baião',
    category: 'forro',
    tempo_range: {min: 95, max: 115},
    characteristics: [
      'Gênero criado por Luiz Gonzaga',
      'Binário acentuado característico',
      'Letras sobre a vida do sertanejo',
      'Sanfona como instrumento principal'
    ],
    instrumentation: [
      'inst_sanfona', 'inst_zabumba', 'inst_triangle',
      'inst_cavaquinho', 'inst_pifano'
    ],
    harmony_rules: [
      'Progressões I-V-IV-V (baião clássico)',
      'Acordes diatônicos simples',
      'Uso de relativas (vi e III) para modulação',
      'Cadências suspensas antes da resolução'
    ],
    melody_rules: [
      'Melodia com influência do sertão',
      'Uso de escalas pentatônicas',
      'Frases simétricas',
      'Espaço para improvisação da sanfona'
    ],
    rhythm_rules: [
      'Tempo médio (95-115 BPM)',
      'Padrão: Zum-zum-zum (sincopado)',
      'Zabumba no contra-tempo',
      'Triângulo marcando o 2 e o 4'
    ],
    mix_recommendations: [
      'Sanfona em destaque',
      'Mix seco e orgânico',
      'Estéreo natural',
      'Dinâmicas preservadas'
    ]
  },

  tecnobrega: {
    name: 'Tecnobrega',
    category: 'tecnobrega',
    tempo_range: {min: 125, max: 145},
    characteristics: [
      'Movimento de Belém do Pará',
      'Sintetizadores pesados',
      'Baixo 808 prominente',
      'Fusão de carimbó com música eletrônica'
    ],
    instrumentation: [
      'inst_xps10_leads', 'inst_xps10_pads',
      'inst_bass_drum', 'inst_snare_drum'
    ],
    harmony_rules: [
      'Harmonias simples em loops',
      'Progressões i-IV-V em menor',
      'Uso de acordes de sétima e nona',
      'Padrões harmônicos repetitivos'
    ],
    melody_rules: [
      'Sintes com_attack e decay curtos',
      'Frases curtas e repetitivas',
      'Uso de glide/portamento',
      'Lead synth para melodias principais'
    ],
    rhythm_rules: [
      'Tempo médio-rápido (125-145 BPM)',
      'Padrão de bateria eletrônica',
      'Kick 808 com decay longo',
      'Snare claps em 2 e 4'
    ],
    mix_recommendations: [
      'Baixo muito presente e com sub-grave',
      'Estéreo amplo (100%)',
      'Compressão agressiva (ratio 4:1-6:1)',
      'Reverb em pads e leads'
    ]
  }
};

// ============================================================================
// ADAPTATION FUNCTIONS
// ============================================================================

interface RegionalRequest {
  notes: NoteData[];
  genre: 'brega' | 'forro' | 'tecnobrega';
  subgenre?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
}

interface RegionalResponse {
  adapted_notes: NoteData[];
  style_profile: RegionalProfile;
  suggested_instruments: string[];
  suggested_progression: string[];
  groove_template: RegionalStyle;
  description: string;
  tips: string[];
}

/**
 * Adapt notes to regional style
 */
function adaptToRegionalStyle(
  notes: NoteData[],
  genre: 'brega' | 'forro' | 'tecnobrega',
  subgenre: string | undefined,
  key: string,
  mode: 'major' | 'minor'
): NoteData[] {
  const adapted = [...notes];
  const profileKey = subgenre || `${genre}_${genre === 'forro' ? 'baião' : genre === 'brega' ? 'romantico' : 'default'}`;
  const profile = REGIONAL_PROFILES[profileKey] || REGIONAL_PROFILES.brega_romantico;

  for (let i = 0; i < adapted.length; i++) {
    const note = adapted[i];

    // Brega adaptations
    if (genre === 'brega') {
      // Add emotional articulations
      if (!note.articulations) note.articulations = [];

      // Add expressive dynamics
      if (i % 4 === 0) {
        note.velocity = Math.min(120, note.velocity + 15);
      }

      // Add fermatas at climactic points
      if (i === adapted.length - 2) {
        note.articulations.push('fermata');
      }
    }

    // Forró adaptations
    if (genre === 'forro') {
      // Add syncopation
      if (i % 2 === 1) {
        note.position += 120;  // Small rhythmic displacement
      }

      // Add staccato for rhythmic clarity
      if (!note.articulations) note.articulations = [];
      if (Math.random() > 0.5) {
        note.articulations.push('staccato');
      }
    }

    // Tecnobrega adaptations
    if (genre === 'tecnobrega') {
      // Add electronic feel
      note.velocity = Math.max(80, Math.min(127, note.velocity + 10));

      // Add electronic ornaments
      if (!note.ornaments) note.ornaments = [];
      if (Math.random() > 0.7) {
        note.ornaments.push('trill');
      }
    }
  }

  return adapted;
}

/**
 * Generate groove template for genre
 */
function generateGrooveTemplate(genre: 'brega' | 'forro' | 'tecnobrega'): RegionalStyle {
  switch (genre) {
    case 'brega':
      return {
        groove_template: 'brega_ballad',
        swing_amount: 0.0,
        accent_pattern: [1.0, 0.5, 0.8, 0.5]
      };

    case 'forro':
      return {
        groove_template: 'forro_baião',
        swing_amount: 0.25,
        accent_pattern: [1.0, 0.3, 0.8, 0.3]
      };

    case 'tecnobrega':
      return {
        groove_template: 'tecnobrega_808',
        swing_amount: 0.2,
        accent_pattern: [1.0, 0.7, 0.5, 0.7]
      };

    default:
      return {
        groove_template: 'straight',
        swing_amount: 0.0,
        accent_pattern: [1.0, 0.5, 0.5, 0.5]
      };
  }
}

/**
 * Get suggested progression for genre
 */
function getSuggestedProgression(
  genre: 'brega' | 'forro' | 'tecnobrega',
  key: string
): string[] {
  switch (genre) {
    case 'brega':
      return [
        'Am - F - C - G (vi-IV-I-V)',
        'F - G - Em - Am (IV-V-vi-vi)',
        'C - Am - Dm - G7 (I-vi-ii-V7)'
      ];

    case 'forro':
      return [
        'C - G7 - F - G7 (I-V-IV-V)',
        'C - Am - Dm - G7 (I-vi-ii-V7)',
        'G - D7 - C - D7 (I-V-IV-V in G)'
      ];

    case 'tecnobrega':
      return [
        'Cm - Ab - Eb - Bb (i-VI-III-VII)',
        'Cm - G - Ab - Bb (i-v-VI-VII)',
        'Am - F - C - G (vi-IV-I-V)'
      ];

    default:
      return ['C - Am - F - G (I-vi-IV-V)'];
  }
}

/**
 * Generate description
 */
function generateDescription(
  genre: 'brega' | 'forro' | 'tecnobrega',
  subgenre: string | undefined,
  profile: RegionalProfile,
  tempo: number
): string {
  return `${profile.name}
  - Categoria: ${profile.category.toUpperCase()}
  - Andamento sugerido: ${tempo} BPM
  - Características: ${profile.characteristics.slice(0, 2).join(', ')}
  - Instrumentação típica: ${profile.instrumentation.slice(0, 3).join(', ')}`;
}

/**
 * Generate tips
 */
function generateTips(
  genre: 'brega' | 'forro' | 'tecnobrega',
  profile: RegionalProfile
): string[] {
  const tips: string[] = [];

  tips.push(`Tempo ideal: ${profile.tempo_range.min}-${profile.tempo_range.max} BPM`);
  tips.push(`Harmonia: ${profile.harmony_rules[0]}`);
  tips.push(`Melodia: ${profile.melody_rules[0]}`);
  tips.push(`Ritmo: ${profile.rhythm_rules[0]}`);

  if (genre === 'brega') {
    tips.push('Use acordes de suspense antes do refrão para efeito dramático');
    tips.push('Metais e cordas aumentam o impacto emocional');
  } else if (genre === 'forro') {
    tips.push('Zabumba deve marcar o contra-tempo característico');
    tips.push('Sanfona pode improvisar usando escalas pentatônicas');
  } else if (genre === 'tecnobrega') {
    tips.push('Kick 808 com decay longo cria o baixo característico');
    tips.push('Pads com reverb criam atmosphere eletrônica');
  }

  return tips;
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

export async function regionalAgent(request: RegionalRequest): Promise<RegionalResponse> {
  const {
    notes,
    genre,
    subgenre,
    key,
    mode,
    tempo
  } = request;

  // Get profile
  const profileKey = subgenre || `${genre}_${genre === 'forro' ? 'baião' : genre === 'brega' ? 'romantico' : 'default'}`;
  const style_profile = REGIONAL_PROFILES[profileKey] || REGIONAL_PROFILES.brega_romantico;

  // Adapt notes to regional style
  const adapted_notes = adaptToRegionalStyle(notes, genre, subgenre, key, mode);

  // Generate groove template
  const groove_template = generateGrooveTemplate(genre);

  // Get suggested instruments
  const suggested_instruments = style_profile.instrumentation;

  // Get suggested progressions
  const suggested_progression = getSuggestedProgression(genre, key);

  // Generate description
  const description = generateDescription(genre, subgenre, style_profile, tempo);

  // Generate tips
  const tips = generateTips(genre, style_profile);

  return {
    adapted_notes,
    style_profile,
    suggested_instruments,
    suggested_progression,
    groove_template,
    description,
    tips
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {RegionalRequest, RegionalResponse, RegionalProfile};
export {REGIONAL_PROFILES};
