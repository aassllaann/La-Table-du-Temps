'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const ERA_COLORS = ['#8C4A1F', '#9B7A2E', '#4A7A54', '#2A5F82', '#8B1A2B'];
const EASE = [0.16, 1, 0.3, 1] as const;

const REMY_QUOTE =
  '我是 Remy。这里有五个时代的争论、二十八道菜肴的命运，还有一个漫长的问题：谁有资格定义「美味」？厨房里发生的事，从来不只是烹饪。';

const rightItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const titleWord = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export default function HomePage() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* ── Era dots ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 'clamp(44px, 6vw, 100px)',
          paddingTop: 'clamp(20px, 2.6vh, 30px)',
          paddingBottom: 'clamp(10px, 1.6vh, 18px)',
          flexShrink: 0,
        }}
      >
        {ERA_COLORS.map((color, i) => (
          <motion.div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.44, ease: EASE, delay: 0.06 + i * 0.07 }}
          />
        ))}
      </div>

      {/* ── Main: 62 / 38 ──────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '62% 38%',
          position: 'relative',
          /* visible so "Temps" can cross the column boundary */
          overflow: 'visible',
        }}
      >
        {/* Vertical divider — absolute inside grid */}
        <motion.div
          style={{
            position: 'absolute',
            left: '62%',
            top: '10%',
            bottom: '10%',
            width: 1,
            background: 'rgba(28,20,16,0.09)',
            transformOrigin: 'top',
            zIndex: 2,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.0, ease: EASE, delay: 0.4 }}
        />

        {/* ── Left: Title ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 'clamp(44px, 6vw, 100px)',
            paddingRight: 'clamp(24px, 3vw, 48px)',
            paddingBottom: '8vh',
            overflow: 'visible',
            zIndex: 1,
          }}
        >
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.16 } } }}
            style={{ overflow: 'visible' }}
          >
            {/* La */}
            <motion.div variants={titleWord} style={{ lineHeight: 1, marginBottom: '0.12em' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(20px, 2.4vw, 36px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'rgba(155,122,46,0.74)',
                  letterSpacing: '0.05em',
                }}
              >
                La
              </span>
            </motion.div>

            {/* Table */}
            <motion.div variants={titleWord} style={{ lineHeight: 0.96, marginBottom: '0.01em' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(74px, 10vw, 162px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  color: 'rgba(28,20,16,0.91)',
                  letterSpacing: '0.005em',
                  whiteSpace: 'nowrap',
                }}
              >
                Table
              </span>
            </motion.div>

            {/* du — floats to right edge of column */}
            <motion.div
              variants={titleWord}
              style={{
                lineHeight: 1,
                marginBottom: '0.01em',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(20px, 2.4vw, 36px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'rgba(28,20,16,0.24)',
                  letterSpacing: '0.16em',
                }}
              >
                du
              </span>
            </motion.div>

            {/* Temps — massive, breaks the column boundary */}
            <motion.div variants={titleWord} style={{ lineHeight: 0.92, overflow: 'visible' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(120px, 22vw, 320px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  color: 'rgba(28,20,16,0.91)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                Temps
              </span>
            </motion.div>
          </motion.div>

          {/* Historical date */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.76 }}
            style={{
              marginTop: 'clamp(14px, 1.8vh, 26px)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'rgba(28,20,16,0.18)',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif',
            }}
          >
            1300 — 2024
          </motion.p>
        </div>

        {/* ── Right: Narrative ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.11, delayChildren: 0.50 } } }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 'clamp(40px, 5vw, 80px)',
            paddingRight: 'clamp(40px, 5.5vw, 88px)',
            paddingBottom: '8vh',
            zIndex: 3,
            position: 'relative',
          }}
        >
          {/* Chinese subtitle */}
          <motion.p
            variants={rightItem}
            style={{
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(11px, 0.95vw, 14px)',
              letterSpacing: '0.30em',
              color: 'rgba(155,122,46,0.68)',
              marginBottom: 'clamp(6px, 0.8vh, 10px)',
            }}
          >
            时间的餐桌
          </motion.p>

          {/* Rule */}
          <motion.div
            variants={rightItem}
            style={{
              width: 36,
              height: 1,
              background: 'rgba(28,20,16,0.14)',
              marginBottom: 'clamp(24px, 3vh, 38px)',
            }}
          />

          {/* Remy quote */}
          <motion.p
            variants={rightItem}
            style={{
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(15px, 1.4vw, 21px)',
              lineHeight: 1.75,
              color: 'rgba(28,20,16,0.54)',
              fontStyle: 'italic',
              marginBottom: 'clamp(36px, 4.8vh, 60px)',
            }}
          >
            <span
              style={{
                fontStyle: 'normal',
                opacity: 0.35,
                marginRight: 8,
                fontSize: '0.82em',
              }}
            >
              🐭
            </span>
            {REMY_QUOTE}
          </motion.p>

          {/* Meta */}
          <motion.p
            variants={rightItem}
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'rgba(28,20,16,0.20)',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif',
              marginBottom: 'clamp(16px, 2vh, 26px)',
            }}
          >
            五个时代 · 二十八道菜肴 · 两种演化关系
          </motion.p>

          {/* CTA */}
          <motion.div variants={rightItem}>
            <CTALink />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function CTALink() {
  return (
    <Link
      href="/explore"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-cormorant), Cormorant Garamond, Georgia, serif',
        fontSize: 'clamp(14px, 1.15vw, 17px)',
        letterSpacing: '0.12em',
        color: 'rgba(28,20,16,0.58)',
        textDecoration: 'none',
        position: 'relative',
        paddingBottom: 4,
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'rgba(28,20,16,0.90)';
        const line = e.currentTarget.querySelector<HTMLElement>('[data-underline]');
        if (line) { line.style.width = '100%'; line.style.opacity = '0.48'; }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(28,20,16,0.58)';
        const line = e.currentTarget.querySelector<HTMLElement>('[data-underline]');
        if (line) { line.style.width = '22px'; line.style.opacity = '0.22'; }
      }}
    >
      <span>开始探索</span>
      <span style={{ letterSpacing: 0 }}>→</span>
      <span
        data-underline
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 1,
          width: 22,
          background: 'rgba(28,20,16,0.88)',
          opacity: 0.22,
          transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
        }}
      />
    </Link>
  );
}
