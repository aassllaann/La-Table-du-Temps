'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedEra, useAppDispatch } from '@/lib/store';
import type { Era } from '@/lib/types';
import erasData from '@/data/eras.json';

const eras = erasData as unknown as Era[];

export default function EraTimeline() {
  const selectedEra = useSelectedEra();
  const dispatch = useAppDispatch();

  return (
    <aside
      className="relative z-10 flex flex-col w-56 flex-shrink-0 h-full py-8 px-3 overflow-y-auto"
      style={{
        background: 'rgba(15,12,7,0.55)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="mb-8 px-2">
        <div
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'rgba(240,232,208,0.4)', fontFamily: 'Georgia, serif' }}
        >
          La Table du Temps
        </div>
        <div
          className="text-base font-medium leading-tight"
          style={{ color: 'rgba(240,232,208,0.85)' }}
        >
          时间的餐桌
        </div>
      </div>

      {/* Era list */}
      <nav className="flex flex-col gap-1 flex-1">
        {eras.map((era, index) => {
          const isActive = selectedEra === era.id;
          return (
            <button
              key={era.id}
              onClick={() =>
                dispatch({ type: 'SET_ERA', payload: isActive ? null : era.id })
              }
              className="flex items-start gap-3 w-full text-left px-3 py-3 rounded-lg transition-all duration-200"
              style={{
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: `2px solid ${isActive ? era.color : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {/* Era index dot */}
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: era.color,
                    opacity: isActive ? 1 : 0.5,
                    boxShadow: isActive ? `0 0 8px ${era.color}88` : 'none',
                  }}
                />
                {index < eras.length - 1 && (
                  <div
                    className="w-px flex-1"
                    style={{
                      height: '28px',
                      background: 'rgba(255,255,255,0.1)',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>

              {/* Era text */}
              <div className="min-w-0">
                <div
                  className="text-xs font-medium leading-tight mb-0.5 transition-colors duration-200"
                  style={{
                    color: isActive ? era.color : 'rgba(240,232,208,0.7)',
                  }}
                >
                  {era.label.split(' (')[0]}
                </div>
                <div
                  className="text-xs leading-tight"
                  style={{ color: 'rgba(240,232,208,0.35)' }}
                >
                  {era.period}
                </div>

                {/* coreConflict — expands when active */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="text-xs leading-relaxed overflow-hidden"
                      style={{
                        color: 'rgba(240,232,208,0.52)',
                        marginTop: '6px',
                        borderLeft: `2px solid ${era.color}55`,
                        paddingLeft: '8px',
                      }}
                    >
                      {era.coreConflict}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div
        className="mt-6 px-2 text-xs leading-relaxed"
        style={{ color: 'rgba(240,232,208,0.25)' }}
      >
        点击时期进入图谱
        <br />
        点击菜肴节点查看详情
      </div>
    </aside>
  );
}
