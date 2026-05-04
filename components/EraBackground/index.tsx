'use client';

import { useSelectedEra } from '@/lib/store';
import type { EraId } from '@/lib/types';

const ERA_GRADIENTS: Record<EraId, string> = {
  medieval:
    'radial-gradient(ellipse at 20% 30%, rgba(200,116,42,0.25) 0%, #0f0c07 65%)',
  careme:
    'radial-gradient(ellipse at 50% 20%, rgba(181,148,62,0.22) 0%, #0f0c07 65%)',
  escoffier:
    'radial-gradient(ellipse at 70% 40%, rgba(122,155,62,0.22) 0%, #0f0c07 65%)',
  nouvelle:
    'radial-gradient(ellipse at 30% 70%, rgba(62,143,166,0.22) 0%, #0f0c07 65%)',
  contemporary:
    'radial-gradient(ellipse at 65% 60%, rgba(122,90,170,0.22) 0%, #0f0c07 65%)',
};

const DEFAULT_GRADIENT =
  'radial-gradient(ellipse at 50% 50%, rgba(80,60,30,0.12) 0%, #0f0c07 70%)';

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
