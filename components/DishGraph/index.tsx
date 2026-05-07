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
        className="absolute bottom-5 right-5 z-10 flex flex-col gap-2 px-3 py-2.5 rounded-lg"
        style={{
          background: 'rgba(15,12,7,0.78)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="34" height="10">
            <path
              d="M0,5 C8,5 18,5 26,5"
              fill="none"
              stroke="#C8A84B"
              strokeWidth="1.5"
            />
            <polygon points="26,2 34,5 26,8" fill="#C8A84B" />
          </svg>
          <span className="text-xs" style={{ color: 'rgba(240,232,208,0.42)' }}>
            演化自
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="34" height="10">
            <path
              d="M0,5 Q17,1 34,5"
              fill="none"
              stroke="#7A6040"
              strokeWidth="1"
              strokeDasharray="5,4"
            />
          </svg>
          <span className="text-xs" style={{ color: 'rgba(240,232,208,0.42)' }}>
            同时期代表作
          </span>
        </div>
      </div>

      {/* Scroll hint (shown when no era selected) */}
      {!selectedEra && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            background: 'rgba(15,12,7,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '5px 14px',
          }}
        >
          <span
            className="text-xs tracking-wide"
            style={{ color: 'rgba(240,232,208,0.35)' }}
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
