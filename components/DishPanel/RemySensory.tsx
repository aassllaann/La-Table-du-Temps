'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRemySensoryOpen, useAppDispatch } from '@/lib/store';
import { getEraColor } from '@/lib/utils';
import type { Dish } from '@/lib/types';

interface Props {
  dish: Dish;
}

export default function RemySensory({ dish }: Props) {
  const sensoryOpen = useRemySensoryOpen();
  const dispatch = useAppDispatch();
  const eraColor = getEraColor(dish.era);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${sensoryOpen ? eraColor + '44' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Trigger */}
      <button
        className="flex items-center gap-2.5 w-full px-4 py-3 text-left transition-all duration-150"
        style={{
          background: sensoryOpen
            ? `${eraColor}12`
            : 'rgba(255,255,255,0.03)',
        }}
        onClick={() => dispatch({ type: 'TOGGLE_SENSORY' })}
      >
        <span className="text-lg select-none">🐭</span>
        <span
          className="text-sm flex-1"
          style={{ color: sensoryOpen ? eraColor : 'rgba(240,232,208,0.55)' }}
        >
          听 Remy 说
        </span>
        <motion.span
          animate={{ rotate: sensoryOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-xs"
          style={{ color: 'rgba(240,232,208,0.3)' }}
        >
          ▾
        </motion.span>
      </button>

      {/* Collapsible content (Voice C) */}
      <AnimatePresence initial={false}>
        {sensoryOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1">
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: 'rgba(240,232,208,0.68)' }}
              >
                &ldquo;{dish.remySensory}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
