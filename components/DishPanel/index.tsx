'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedDish, useAppDispatch } from '@/lib/store';
import DishInfo from './DishInfo';
import RemySensory from './RemySensory';

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center"
    >
      <div className="text-5xl select-none opacity-20">🍽</div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'rgba(240,232,208,0.25)' }}
      >
        点击图谱中的菜肴节点
        <br />
        探索每道菜肴的历史与 Remy 的感官旁白
      </p>
    </motion.div>
  );
}

export default function DishPanel() {
  const selectedDish = useSelectedDish();
  const dispatch = useAppDispatch();

  return (
    <aside
      className="relative z-10 flex flex-col w-96 flex-shrink-0 h-full overflow-hidden"
      style={{
        background: 'rgba(15,12,7,0.50)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <AnimatePresence mode="wait">
        {!selectedDish && <EmptyState key="empty" />}
        {selectedDish && (
          <motion.div
            key={selectedDish.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full overflow-y-auto"
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span
                className="text-xs tracking-widest uppercase"
                style={{ color: 'rgba(240,232,208,0.3)' }}
              >
                菜肴详情
              </span>
              <button
                className="text-xs transition-colors duration-150"
                style={{ color: 'rgba(240,232,208,0.25)' }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = 'rgba(240,232,208,0.6)')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = 'rgba(240,232,208,0.25)')
                }
                onClick={() => dispatch({ type: 'SET_DISH', payload: null })}
              >
                ✕
              </button>
            </div>

            {/* Panel content */}
            <div className="flex flex-col gap-6 px-6 py-5 flex-1">
              <DishInfo dish={selectedDish} />
              <div
                className="border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              />
              <RemySensory dish={selectedDish} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
