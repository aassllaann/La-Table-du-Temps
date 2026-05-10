'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedEdge, useAppDispatch } from '@/lib/store';
import { getEraColor } from '@/lib/utils';
import type { Dish } from '@/lib/types';
import dishesRaw from '@/data/dishes.json';

const allDishes = dishesRaw as unknown as Dish[];

const EDGE_TYPE_LABEL: Record<string, string> = {
  evolved_from: '演化自',
  era_sibling:  '同时期代表作',
};

const PLACEHOLDER = '这段故事我还没完全想明白——也许你比我更了解？';

export default function EdgePopup() {
  const selectedEdge = useSelectedEdge();
  const dispatch = useAppDispatch();
  const popupRef = useRef<HTMLDivElement>(null);

  const source = allDishes.find((d) => d.id === selectedEdge?.sourceId);
  const target = allDishes.find((d) => d.id === selectedEdge?.targetId);

  useEffect(() => {
    if (!selectedEdge) return;
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        dispatch({ type: 'SET_EDGE', payload: null });
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedEdge, dispatch]);

  useEffect(() => {
    if (!selectedEdge) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'SET_EDGE', payload: null });
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedEdge, dispatch]);

  function getPosition() {
    if (!selectedEdge) return { x: 0, y: 0 };
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const H = typeof window !== 'undefined' ? window.innerHeight : 800;
    const POPUP_W = 340;
    const POPUP_H = 240;
    const OFFSET = 14;
    let x = selectedEdge.x + OFFSET;
    let y = selectedEdge.y - OFFSET;
    if (x + POPUP_W > W - 16) x = selectedEdge.x - POPUP_W - OFFSET;
    if (y + POPUP_H > H - 16) y = H - POPUP_H - 16;
    if (y < 16) y = 16;
    return { x, y };
  }

  const pos = getPosition();
  const accentColor = source ? getEraColor(source.era) : '#9B7A2E';
  const isEvolved = selectedEdge?.type === 'evolved_from';

  return (
    <AnimatePresence>
      {selectedEdge && source && target && (
        <motion.div
          ref={popupRef}
          key={`${selectedEdge.sourceId}-${selectedEdge.targetId}`}
          className="fixed z-30"
          style={{ left: pos.x, top: pos.y, width: 340 }}
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div
            className="rounded-xl px-5 py-4 flex flex-col gap-3"
            style={{
              background: 'rgba(247,243,234,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${accentColor}38`,
              boxShadow: `0 8px 32px rgba(28,20,16,0.12), 0 0 20px ${accentColor}10`,
            }}
          >
            {/* Header: source → target */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-display text-sm font-medium"
                style={{ color: 'rgba(28,20,16,0.88)', fontSize: '16px' }}
              >
                {source.name_fr}
              </span>
              <span style={{ color: accentColor, fontSize: 13 }}>
                {isEvolved ? '→' : '⟷'}
              </span>
              <span
                className="font-display text-sm font-medium"
                style={{ color: 'rgba(28,20,16,0.88)', fontSize: '16px' }}
              >
                {target.name_fr}
              </span>
            </div>

            {/* Sub-names */}
            <div className="flex items-center gap-2 flex-wrap -mt-1">
              <span className="text-xs" style={{ color: 'rgba(28,20,16,0.42)' }}>
                {source.name_zh}
              </span>
              <span className="text-xs" style={{ color: 'rgba(28,20,16,0.26)' }}>
                {isEvolved ? '→' : '⟷'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(28,20,16,0.42)' }}>
                {target.name_zh}
              </span>
            </div>

            {/* Edge type badge */}
            <div className="flex items-center gap-2">
              <svg width="28" height="8" className="flex-shrink-0">
                {isEvolved ? (
                  <>
                    <line x1="0" y1="4" x2="20" y2="4" stroke={accentColor} strokeWidth="1.4" />
                    <polygon points="20,1.5 28,4 20,6.5" fill={accentColor} />
                  </>
                ) : (
                  <line
                    x1="0" y1="4" x2="28" y2="4"
                    stroke="#8C7060" strokeWidth="1" strokeDasharray="5,4"
                  />
                )}
              </svg>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}28`,
                  color: accentColor,
                  letterSpacing: '0.04em',
                }}
              >
                {EDGE_TYPE_LABEL[selectedEdge.type]}
              </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(28,20,16,0.08)' }} />

            {/* Reason */}
            <p
              className="text-sm leading-relaxed font-display"
              style={{
                color: selectedEdge.reason ? 'rgba(28,20,16,0.68)' : 'rgba(28,20,16,0.32)',
                fontStyle: selectedEdge.reason ? 'normal' : 'italic',
                fontSize: '14px',
              }}
            >
              {selectedEdge.reason ?? PLACEHOLDER}
            </p>

            {/* Close */}
            <button
              className="self-end text-xs transition-colors duration-150 mt-1"
              style={{ color: 'rgba(28,20,16,0.24)' }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(28,20,16,0.55)')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(28,20,16,0.24)')
              }
              onClick={() => dispatch({ type: 'SET_EDGE', payload: null })}
            >
              ✕ 关闭
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
