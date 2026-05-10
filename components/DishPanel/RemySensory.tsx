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
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${sensoryOpen ? eraColor + '40' : 'rgba(28,20,16,0.09)'}`,
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Trigger */}
      <button
        className="flex items-center gap-2.5 w-full px-4 py-3 text-left transition-all duration-150"
        style={{
          background: sensoryOpen
            ? `${eraColor}0C`
            : 'rgba(28,20,16,0.025)',
        }}
        onClick={() => dispatch({ type: 'TOGGLE_SENSORY' })}
      >
        <span className="text-lg select-none">🐭</span>
        <span
          className="text-sm flex-1"
          className="font-display"
          style={{ color: sensoryOpen ? eraColor : 'rgba(28,20,16,0.52)', fontSize: '15px' }}
        >
          听 Remy 说
        </span>
        <motion.span
          animate={{ rotate: sensoryOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-xs"
          style={{ color: 'rgba(28,20,16,0.28)' }}
        >
          ▾
        </motion.span>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {sensoryOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${eraColor}20` }}>
              <p
                className="text-sm leading-relaxed italic"
                className="font-display"
                style={{ color: 'rgba(28,20,16,0.65)', fontSize: '15px' }}
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
