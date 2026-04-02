'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { RecentChapter } from '@/lib/homeData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const container: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const card: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

function excerpt(content: string, maxLen = 120) {
  const text = content.replace(/\n+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
}

export default function HomeRecent({ chapters }: { chapters: RecentChapter[] }) {
  if (chapters.length === 0) return null;

  return (
    <section
      style={{ background: '#050A14' }}
      className="px-4 py-24"
    >
      {/* Divider */}
      <div className="mx-auto mb-20 max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Archiv
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Zuletzt hinzugefügt
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {chapters.map((ch) => (
            <motion.div key={ch.id} variants={card}>
              <Link
                href={`/chapter/${ch.chapter_number}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-400">
                    #{ch.chapter_number}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <h3 className="mb-3 font-bold leading-snug text-white transition-colors group-hover:text-indigo-300">
                  {ch.title}
                </h3>
                <p className="mt-auto text-sm leading-relaxed text-white/40">
                  {excerpt(ch.content)}
                </p>
                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Kapitel lesen
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/chapter/1"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white"
          >
            Alle Kapitel ansehen
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
