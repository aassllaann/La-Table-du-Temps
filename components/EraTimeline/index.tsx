'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedEra, useAppDispatch } from '@/lib/store';
import type { Era } from '@/lib/types';
import erasData from '@/data/eras.json';
import OrnamentalDivider from '@/components/OrnamentalDivider';

const eras = erasData as unknown as Era[];

export default function EraTimeline() {
  const selectedEra = useSelectedEra();
  const dispatch = useAppDispatch();

  return (
    <aside
      className="explore-panel-left relative z-10 flex flex-col w-56 flex-shrink-0 h-full py-8 px-3 overflow-y-auto"
      style={{
        background: 'rgba(247,243,234,0.88)',
        borderRight: '1px solid rgba(28,20,16,0.09)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="mb-8 px-2">
        <div
          className="font-display"
          style={{ fontSize: '14px', color: 'rgba(28,20,16,0.80)', letterSpacing: '0.03em', marginBottom: 4, fontWeight: 500 }}
        >
          La Table du Temps
        </div>
        <div
          className="text-xs"
          style={{ color: 'rgba(28,20,16,0.38)', letterSpacing: '0.12em' }}
        >
          时间的餐桌
        </div>
        <div className="mt-3">
          <OrnamentalDivider lineColor="rgba(28,20,16,0.12)" dotColor="rgba(139,26,43,0.45)" />
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
                background: isActive ? `${era.color}10` : 'transparent',
                border: isActive ? `1px solid ${era.color}30` : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(28,20,16,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {/* Era index dot */}
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0 self-stretch">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  animate={{
                    scale: isActive ? [1, 1.45, 1] : 1,
                    opacity: isActive ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: era.color,
                    boxShadow: isActive ? `0 0 6px ${era.color}66` : 'none',
                  }}
                />
                {index < eras.length - 1 && (
                  <div
                    className="w-px flex-1"
                    style={{
                      minHeight: '16px',
                      background: 'rgba(28,20,16,0.10)',
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
                    color: isActive ? era.color : 'rgba(28,20,16,0.65)',
                  }}
                >
                  {era.label.split(' (')[0]}
                </div>
                <div
                  className="text-xs leading-tight"
                  style={{ color: 'rgba(28,20,16,0.32)', letterSpacing: '0.04em' }}
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
                        color: 'rgba(28,20,16,0.46)',
                        marginTop: '8px',
                        fontStyle: 'italic',
                        lineHeight: '1.5',
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
        style={{ color: 'rgba(28,20,16,0.28)', letterSpacing: '0.02em' }}
      >
        点击时期进入图谱
        <br />
        点击菜肴节点查看详情
      </div>
    </aside>
  );
}
