'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomeFooter({ firstChapterNumber }: { firstChapterNumber: number }) {
  return (
    <footer style={{ background: '#050A14' }} className="px-4 pb-12 pt-8">
      {/* Divider */}
      <div className="mx-auto mb-12 max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl"
      >
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
              />
              <span className="text-sm font-bold uppercase tracking-widest text-white/80">
                UFO-Forschungsarchiv
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/35">
              Ein Leben lang zusammengetragen — UFO-Sichtungen, unerklärliche Phänomene
              und ausserirdische Begegnungen aus aller Welt. Dokumentiert von meinem Grossvater
              über mehr als vier Jahrzehnte.
            </p>
          </div>

          <div className="text-right">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/25">
              Privates Forschungsarchiv
            </p>
            <p className="text-xs text-white/20">
              Nicht zur Veröffentlichung bestimmt.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 text-xs text-white/20 sm:flex-row">
          <p>744 Kapitel · 1.178 Bilder · 6 Kontinente · 40+ Jahre</p>
          <Link
            href={`/chapter/${firstChapterNumber}`}
            className="transition-colors hover:text-white/50"
          >
            Zum Archiv →
          </Link>
        </div>
      </motion.div>
    </footer>
  );
}
