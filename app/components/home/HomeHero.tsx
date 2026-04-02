'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Deterministic pseudo-random star positions (no Math.random → no hydration mismatch)
function lcg(seed: number) {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) >>> 0;
}

const STARS = Array.from({ length: 160 }, (_, i) => {
  const s1 = lcg(i * 3);
  const s2 = lcg(i * 3 + 1);
  const s3 = lcg(i * 3 + 2);
  return {
    id: i,
    x: (s1 % 10000) / 100,
    y: (s2 % 10000) / 100,
    size: 1 + (s3 % 3),
    delay: (s1 % 60) / 10,
    duration: 2.5 + (s2 % 40) / 10,
    opacity: 0.25 + (s3 % 6) * 0.12,
  };
});

const STATS = [
  { value: '744', label: 'Kapitel' },
  { value: '1.178', label: 'Dokumente & Bilder' },
  { value: '6', label: 'Kontinente' },
  { value: '40+', label: 'Jahre Forschung' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const container: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statItem: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HomeHero({ totalChapters }: { totalChapters: number }) {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24"
      style={{ background: 'linear-gradient(to bottom, #050A14 0%, #0a1628 60%, #0d1b2a 100%)' }}
    >
      {/* Stars */}
      {STARS.map((star) => (
        <motion.div
          key={star.id}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8 inline-flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-sm">
            <svg
              className="h-4 w-4 text-indigo-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            Jahrzehntelange Forschung
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="mb-6 text-6xl font-bold leading-none tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          <span className="block">Was wir nicht</span>
          <span
            className="block bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #818cf8, #06b6d4)' }}
          >
            sehen wollen
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl"
        >
          Ein Leben lang dokumentiert mein Grossvater UFO-Sichtungen, unerklärliche Phänomene
          und ausserirdische Begegnungen aus aller Welt.{' '}
          <span className="text-white/80">
            744&nbsp;Kapitel. Jahrzehnte der Forschung. Alles an einem Ort.
          </span>
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={fadeUp}
          className="mb-20 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/chapter/1"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            Jetzt Lesen
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="#search"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Sichtungen suchen
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={statItem}
              className="flex flex-col items-center gap-1 px-6 py-6"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm text-white/50">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, #050A14)' }}
      />
    </section>
  );
}
