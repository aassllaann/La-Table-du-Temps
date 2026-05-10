'use client';

import { motion } from 'framer-motion';
import { getEraColor } from '@/lib/utils';
import type { Dish } from '@/lib/types';
import OrnamentalDivider from '@/components/OrnamentalDivider';

const ERA_LABELS: Record<string, string> = {
  medieval:     '中世纪宫廷菜',
  careme:       '古典法餐',
  escoffier:    '大饭店时代',
  nouvelle:     'Nouvelle Cuisine',
  contemporary: '当代法餐',
};

interface Props {
  dish: Dish;
}

export default function DishInfo({ dish }: Props) {
  const eraColor = getEraColor(dish.era);
  const eraLabel = ERA_LABELS[dish.era] ?? dish.era;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
      {/* Era badge */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: eraColor }}
        />
        <span
          className="text-xs tracking-wide"
          style={{ color: eraColor, letterSpacing: '0.08em' }}
        >
          {eraLabel} · {dish.origin}
        </span>
      </div>

      {/* Names */}
      <div>
        <h2
          className="font-display text-2xl leading-tight mb-1"
          style={{ color: 'rgba(28,20,16,0.92)', fontWeight: 500, letterSpacing: '0.01em' }}
        >
          {dish.name_fr}
        </h2>
        <p
          className="text-base"
          style={{ color: 'rgba(28,20,16,0.48)', fontWeight: 400 }}
        >
          {dish.name_zh}
        </p>
      </div>

      <OrnamentalDivider lineColor={`${eraColor}33`} dotColor={`${eraColor}66`} />

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'rgba(28,20,16,0.68)' }}
      >
        {dish.description}
      </p>

      {/* Key ingredients */}
      <div>
        <div
          className="text-xs uppercase mb-2"
          style={{ color: 'rgba(28,20,16,0.35)', letterSpacing: '0.14em' }}
        >
          关键食材
        </div>
        <div className="flex flex-wrap gap-1.5">
          {dish.keyIngredients.map((ing) => (
            <span
              key={ing}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: `${eraColor}10`,
                border: `1px solid ${eraColor}30`,
                color: 'rgba(28,20,16,0.65)',
              }}
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Chef */}
      {dish.chef && (
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: 'rgba(28,20,16,0.35)', letterSpacing: '0.04em' }}
          >
            相关厨师
          </span>
          <span
            className="text-xs italic font-display"
            style={{ color: 'rgba(28,20,16,0.62)' }}
          >
            {dish.chef}
          </span>
        </div>
      )}
    </motion.div>
  );
}
