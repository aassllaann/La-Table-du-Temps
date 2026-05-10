'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRemyVisible, useSelectedEra, useAppDispatch } from '@/lib/store';
import type { Era } from '@/lib/types';
import erasData from '@/data/eras.json';

const eras = erasData as unknown as Era[];

export default function RemyMonologue() {
  const remyVisible = useRemyVisible();
  const selectedEra = useSelectedEra();
  const dispatch = useAppDispatch();

  const era = eras.find((e) => e.id === selectedEra);

  return (
    <AnimatePresence>
      {remyVisible && era && (
        <motion.div
          key={era.id}
          className="fixed bottom-8 left-60 z-20 max-w-sm"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 22 }}
        >
          {/* Remy emoji */}
          <motion.div
            className="text-4xl mb-2 select-none"
            animate={{ rotate: [0, -8, 6, -3, 0] }}
            transition={{ duration: 1.0, delay: 0.2 }}
            style={{ display: 'inline-block' }}
          >
            🐭
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            className="rounded-xl px-5 py-4"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            style={{
              background: 'rgba(247,243,234,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${era.color}40`,
              boxShadow: `0 4px 24px rgba(28,20,16,0.12), 0 0 16px ${era.color}12`,
            }}
          >
            <div
              className="text-xs font-medium mb-2 tracking-wide"
              style={{ color: era.color, letterSpacing: '0.08em' }}
            >
              Remy · {era.label.split(' (')[0]}
            </div>
            <p
              className="font-display text-sm leading-relaxed italic"
              style={{ color: 'rgba(28,20,16,0.72)', fontSize: '15px' }}
            >
              &ldquo;{era.remyMonologue}&rdquo;
            </p>
            <button
              className="mt-3 text-xs transition-colors duration-150"
              style={{ color: 'rgba(28,20,16,0.28)' }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(28,20,16,0.60)')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(28,20,16,0.28)')
              }
              onClick={() => dispatch({ type: 'HIDE_REMY' })}
            >
              ✕ 关闭
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
