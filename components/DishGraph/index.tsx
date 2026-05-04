'use client';

import { useRef, useCallback, useMemo } from 'react';
import { useSelectedEra, useSelectedDish, useAppDispatch } from '@/lib/store';
import { useDishGraph } from './useDishGraph';
import type { Dish, Edge } from '@/lib/types';
import dishesRaw from '@/data/dishes.json';
import edgesRaw from '@/data/edges.json';

const allDishes = dishesRaw as unknown as Dish[];
const allEdges = edgesRaw as unknown as Edge[];

export default function DishGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dispatch = useAppDispatch();
  const selectedEra = useSelectedEra();
  const selectedDish = useSelectedDish();

  const filteredDishes = useMemo(
    () =>
      selectedEra ? allDishes.filter((d) => d.era === selectedEra) : allDishes,
    [selectedEra]
  );

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredDishes.map((d) => d.id));
    return allEdges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [filteredDishes]);

  const handleDishClick = useCallback(
    (dish: Dish) => {
      dispatch({ type: 'SET_DISH', payload: dish });
    },
    [dispatch]
  );

  useDishGraph(svgRef, {
    dishes: filteredDishes,
    edges: filteredEdges,
    selectedDish,
    onDishClick: handleDishClick,
  });

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      {/* Legend */}
      <div
        className="absolute bottom-5 left-5 z-10 flex flex-col gap-2 px-3 py-2.5 rounded-lg"
        style={{
          background: 'rgba(15,12,7,0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="32" height="8">
            <line
              x1="0"
              y1="4"
              x2="26"
              y2="4"
              stroke="#C8A84B"
              strokeWidth="1.6"
            />
            <polygon points="26,1 32,4 26,7" fill="#C8A84B" />
          </svg>
          <span
            className="text-xs"
            style={{ color: 'rgba(240,232,208,0.4)' }}
          >
            演化自
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="32" height="8">
            <line
              x1="0"
              y1="4"
              x2="32"
              y2="4"
              stroke="#7A6040"
              strokeWidth="1"
              strokeDasharray="6,4"
            />
          </svg>
          <span
            className="text-xs"
            style={{ color: 'rgba(240,232,208,0.4)' }}
          >
            同时期代表作
          </span>
        </div>
      </div>

      {/* Era label overlay */}
      {!selectedEra && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center"
          style={{ color: 'rgba(240,232,208,0.12)' }}
        >
          <div className="text-4xl mb-3 select-none">🍽</div>
          <div className="text-sm tracking-widest uppercase">
            点击左侧时期开始探索
          </div>
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
