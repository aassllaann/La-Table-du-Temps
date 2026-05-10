'use client';

import { useSelectedEra } from '@/lib/store';
import type { EraId } from '@/lib/types';

const ERA_GRADIENTS: Record<EraId, string> = {
  medieval:
    'radial-gradient(ellipse at 20% 30%, rgba(140,74,31,0.13) 0%, #F7F3EA 65%)',
  careme:
    'radial-gradient(ellipse at 50% 20%, rgba(155,122,46,0.13) 0%, #F7F3EA 65%)',
  escoffier:
    'radial-gradient(ellipse at 70% 40%, rgba(74,122,84,0.12) 0%, #F7F3EA 65%)',
  nouvelle:
    'radial-gradient(ellipse at 30% 70%, rgba(42,95,130,0.13) 0%, #F7F3EA 65%)',
  contemporary:
    'radial-gradient(ellipse at 65% 60%, rgba(139,26,43,0.12) 0%, #F7F3EA 65%)',
};

const DEFAULT_GRADIENT =
  'radial-gradient(ellipse at 50% 50%, rgba(155,130,80,0.08) 0%, #F7F3EA 70%)';

export default function EraBackground() {
  const selectedEra = useSelectedEra();
  const gradient = selectedEra ? ERA_GRADIENTS[selectedEra] : DEFAULT_GRADIENT;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: gradient,
        transition: 'background 1.8s ease',
      }}
    />
  );
}
