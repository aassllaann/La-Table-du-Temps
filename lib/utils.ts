import type { EraId, EdgeType } from './types';

const ERA_COLORS: Record<EraId, string> = {
  medieval:     '#C8742A',
  careme:       '#B5943E',
  escoffier:    '#7A9B3E',
  nouvelle:     '#3E8FA6',
  contemporary: '#7A5AAA',
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
