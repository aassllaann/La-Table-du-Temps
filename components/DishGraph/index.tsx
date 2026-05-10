'use client';

import { useRef, useCallback } from 'react';
import { useSelectedEra, useSelectedDish, useAppDispatch } from '@/lib/store';
import { useDishGraph } from './useDishGraph';
import type { Dish, Edge, SelectedEdge } from '@/lib/types';
import dishesRaw from '@/data/dishes.json';
import edgesRaw from '@/data/edges.json';

const allDishes = dishesRaw as unknown as Dish[];
const allEdges = edgesRaw as unknown as Edge[];

export default function DishGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dispatch = useAppDispatch();
  const selectedEra = useSelectedEra();
  const selectedDish = useSelectedDish();

  const handleDishClick = useCallback(
    (dish: Dish) => {
      dispatch({ type: 'SET_DISH', payload: dish });
    },
    [dispatch]
  );

  const handleEdgeClick = useCallback(
    (info: SelectedEdge) => {
      dispatch({ type: 'SET_EDGE', payload: info });
    },
    [dispatch]
  );

  useDishGraph(svgRef, {
    dishes: allDishes,
    edges: allEdges,
    selectedEra,
    selectedDish,
    onDishClick: handleDishClick,
    onEdgeClick: handleEdgeClick,
  });

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      {/* Legend */}
      <div
        className="absolute bottom-5 right-5 z-10 flex flex-col gap-2 px-3.5 py-3 rounded-lg"
        style={{
          background: 'rgba(247,243,234,0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(28,20,16,0.10)',
          boxShadow: '0 1px 8px rgba(28,20,16,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="34" height="10">
            <path
              d="M0,5 C8,5 18,5 26,5"
              fill="none"
              stroke="#9B7A2E"
              strokeWidth="1.5"
            />
            <polygon points="26,2 34,5 26,8" fill="#9B7A2E" />
          </svg>
          <span className="text-xs" style={{ color: 'rgba(28,20,16,0.50)', letterSpacing: '0.03em' }}>
            演化自
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="34" height="10">
            <path
              d="M0,5 Q17,1 34,5"
              fill="none"
              stroke="#8C7060"
              strokeWidth="1"
              strokeDasharray="5,4"
            />
          </svg>
          <span className="text-xs" style={{ color: 'rgba(28,20,16,0.50)', letterSpacing: '0.03em' }}>
            同时期代表作
          </span>
        </div>
      </div>

      {/* Scroll hint (shown when no era selected) */}
      {!selectedEra && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            background: 'rgba(247,243,234,0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(28,20,16,0.09)',
            borderRadius: '20px',
            padding: '5px 16px',
            boxShadow: '0 1px 6px rgba(28,20,16,0.05)',
          }}
        >
          <span
            className="text-xs tracking-wide"
            style={{ color: 'rgba(28,20,16,0.38)', letterSpacing: '0.06em' }}
          >
            滚轮缩放 · 拖拽平移 · 悬停查看关系
          </span>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}
