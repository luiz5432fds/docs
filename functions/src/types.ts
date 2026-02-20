export type Macro = {
  brightness: number;
  bite: number;
  warmth: number;
  width: number;
  dirt: number;
  air: number;
};

export type Panel = {
  cutoff: number;
  resonance: number;
  attack: number;
  release: number;
  chorus: number;
  reverb: number;
};

export type PatchDraft = {
  name: string;
  category: string;
  tags: string[];
  macro: Macro;
  panel: Panel;
  mixHints: string[];
  recipeSteps: string[];
  variants: Record<string, {macro: Macro; panel: Panel}>;
};
