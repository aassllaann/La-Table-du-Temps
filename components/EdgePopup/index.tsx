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

const PLACEHOLDER =
  '（此条转化关系的历史依据待补充——欢迎从 Larousse Gastronomique 或 Wikidata 中提炼）';

export default function EdgePopup() {
  const selectedEdge = useSelectedEdge();
  const dispatch = useAppDispatch();
  const popupRef = useRef<HTMLDivElement>(null);

  const source = allDishes.find((d) => d.id === selectedEdge?.sourceId);
  const target = allDishes.find((d) => d.id === selectedEdge?.targetId);

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!selectedEdge) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'SET_EDGE', payload: null });
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedEdge, dispatch]);

  // Compute popup position — clamp to viewport
  function getPosition() {
    if (!selectedEdge) return { x: 0, y: 0 };
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const H = typeof window !== 'undefined' ? window.innerHeight : 800;
    const POPUP_W = 340;
    const POPUP_H = 240; // estimated
    const OFFSET = 14;
    let x = selectedEdge.x + OFFSET;
    let y = selectedEdge.y - OFFSET;
    if (x + POPUP_W > W - 16) x = selectedEdge.x - POPUP_W - OFFSET;
    if (y + POPUP_H > H - 16) y = H - POPUP_H - 16;
    if (y < 16) y = 16;
    return { x, y };
  }

  const pos = getPosition();

  const accentColor = source ? getEraColor(source.era) : '#C8A84B';
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
            className="rounded-2xl px-5 py-4 flex flex-col gap-3"
            style={{
              background: 'rgba(15,12,7,0.94)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${accentColor}44`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 24px ${accentColor}14`,
            }}
          >
            {/* Header: source → target */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm font-medium"
                style={{ color: 'rgba(240,232,208,0.9)', fontFamily: 'Georgia, serif' }}
              >
                {source.name_fr}
              </span>
              <span style={{ color: accentColor, fontSize: 13 }}>
                {isEvolved ? '→' : '⟷'}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: 'rgba(240,232,208,0.9)', fontFamily: 'Georgia, serif' }}
              >
                {target.name_fr}
              </span>
            </div>

            {/* Sub-names */}
            <div className="flex items-center gap-2 flex-wrap -mt-1">
              <span className="text-xs" style={{ color: 'rgba(240,232,208,0.4)' }}>
                {source.name_zh}
              </span>
              <span className="text-xs" style={{ color: 'rgba(240,232,208,0.25)' }}>
                {isEvolved ? '→' : '⟷'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(240,232,208,0.4)' }}>
                {target.name_zh}
              </span>
            </div>

            {/* Edge type badge */}
            <div className="flex items-center gap-2">
              {/* Icon */}
              <svg width="28" height="8" className="flex-shrink-0">
                {isEvolved ? (
                  <>
                    <line x1="0" y1="4" x2="20" y2="4" stroke={accentColor} strokeWidth="1.4" />
                    <polygon points="20,1.5 28,4 20,6.5" fill={accentColor} />
                  </>
                ) : (
                  <line
                    x1="0" y1="4" x2="28" y2="4"
                    stroke="#7A6040" strokeWidth="1" strokeDasharray="5,4"
                  />
                )}
              </svg>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${accentColor}18`,
                  border: `1px solid ${accentColor}33`,
                  color: accentColor,
                }}
              >
                {EDGE_TYPE_LABEL[selectedEdge.type]}
              </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

            {/* Reason */}
            <p
              className="text-sm leading-relaxed"
              style={{
                color: selectedEdge.reason
                  ? 'rgba(240,232,208,0.75)'
                  : 'rgba(240,232,208,0.3)',
                fontStyle: selectedEdge.reason ? 'normal' : 'italic',
              }}
            >
              {selectedEdge.reason ?? PLACEHOLDER}
            </p>

            {/* Close */}
            <button
              className="self-end text-xs transition-colors duration-150 mt-1"
              style={{ color: 'rgba(240,232,208,0.22)' }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(240,232,208,0.55)')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = 'rgba(240,232,208,0.22)')
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
