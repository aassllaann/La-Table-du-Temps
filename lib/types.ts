export type EraId = 'medieval' | 'careme' | 'escoffier' | 'nouvelle' | 'contemporary';

export interface Era {
  id: EraId;
  label: string;
  period: string;
  coreConflict: string;
  remyMonologue: string;
  color: string;
}

export interface Dish {
  id: string;
  name_fr: string;
  name_zh: string;
  era: EraId;
  origin: string;
  description: string;
  remySensory: string;
  keyIngredients: string[];
  chef: string | null;
  image?: string | null;
}

export type EdgeType = 'evolved_from' | 'era_sibling';

export interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  reason?: string;
}

export interface GraphNode extends Dish {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: GraphNode | string;
  target: GraphNode | string;
  type: EdgeType;
  reason?: string;
}

export interface SelectedEdge {
  sourceId: string;
  targetId: string;
  type: EdgeType;
  reason?: string;
  x: number; // viewport clientX
  y: number; // viewport clientY
}

export interface AppState {
  selectedEra: EraId | null;
  selectedDish: Dish | null;
  selectedEdge: SelectedEdge | null;
  remyVisible: boolean;
  remySensoryOpen: boolean;
}
