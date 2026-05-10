'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const ERA_COLORS = ['#C8742A', '#B5943E', '#7A9B3E', '#3E8FA6', '#7A5AAA'];

const WELCOME =
  '我是 Remy。这里有五个时代的争论、二十八道菜肴的命运，还有一个漫长的问题：谁有资格定义「美味」？厨房里发生的事，从来不只是烹饪。进来看看。';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  return (
    <div
      className="flex items-center justify-center h-full"
      style={{ position: 'relative', zIndex: 10 }}
    >
      <motion.div
        className="flex flex-col items-center text-center"
        style={{ maxWidth: 540, padding: '0 32px', marginBottom: '8vh' }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Era color dots */}
        <motion.div variants={item} style={{ display: 'flex', gap: 10, marginBottom: 44 }}>
          {ERA_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: color,
                opacity: 0.55,
              }}
            />
          ))}
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={item}
          className="font-display"
          style={{
            fontSize: 'clamp(40px, 5.5vw, 68px)',
            fontWeight: 400,
            letterSpacing: '0.025em',
            color: 'rgba(28,20,16,0.90)',
            lineHeight: 1.08,
            marginBottom: 14,
          }}
        >
          La Table du Temps
        </motion.h1>

        {/* Chinese subtitle */}
        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontSize: 15,
            letterSpacing: '0.22em',
            color: 'rgba(155,122,46,0.80)',
            marginBottom: 44,
          }}
        >
          时间的餐桌
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={item}
          style={{
            width: 44,
            height: 1,
            background: 'rgba(28,20,16,0.14)',
            marginBottom: 44,
          }}
        />

        {/* Remy welcome */}
        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontSize: 17,
            lineHeight: 1.78,
            color: 'rgba(28,20,16,0.58)',
            fontStyle: 'italic',
            letterSpacing: '0.01em',
            maxWidth: 420,
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontStyle: 'normal',
              marginRight: 9,
              opacity: 0.45,
              fontSize: 15,
            }}
          >
            🐭
          </span>
          {WELCOME}
        </motion.p>

        {/* Meta caption */}
        <motion.p
          variants={item}
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'rgba(28,20,16,0.25)',
            marginBottom: 52,
            textTransform: 'uppercase',
          }}
        >
          五个时代 · 二十八道菜肴 · 两种演化关系
        </motion.p>

        {/* CTA */}
        <motion.div variants={item}>
          <CTALink />
        </motion.div>
      </motion.div>
    </div>
  );
}

function CTALink() {
  return (
    <Link
      href="/explore"
      className="font-display"
      style={{
        display: 'inline-block',
        fontSize: 14,
        letterSpacing: '0.14em',
        color: 'rgba(28,20,16,0.70)',
        border: '1px solid rgba(28,20,16,0.22)',
        padding: '13px 40px',
        borderRadius: 2,
        textDecoration: 'none',
        transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = 'rgba(28,20,16,0.88)';
        el.style.color = '#F7F3EA';
        el.style.borderColor = 'rgba(28,20,16,0.88)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = 'transparent';
        el.style.color = 'rgba(28,20,16,0.70)';
        el.style.borderColor = 'rgba(28,20,16,0.22)';
      }}
    >
      开始探索 →
    </Link>
  );
}
