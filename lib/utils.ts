import type { EraId, EdgeType } from './types';

const ERA_COLORS: Record<EraId, string> = {
  medieval:     '#8C4A1F',
  careme:       '#9B7A2E',
  escoffier:    '#4A7A54',
  nouvelle:     '#2A5F82',
  contemporary: '#8B1A2B',
};

export function getEraColor(eraId: EraId): string {
  return ERA_COLORS[eraId] ?? '#888888';
}

export function getNodeRadius(hasChef: boolean): number {
  return hasChef ? 11 : 8;
}

export function getEdgeDash(type: EdgeType): string {
  return type === 'evolved_from' ? 'none' : '6,4';
}
