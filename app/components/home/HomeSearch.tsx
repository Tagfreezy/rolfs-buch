'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

type SearchResult = {
  chapter_number: number;
  title: string;
  snippet: string;
};

function highlight(text: string, query: string) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(
    re,
    '<mark style="background:rgba(99,102,241,0.35);color:#c7d2fe;border-radius:2px;padding:0 2px">$1</mark>'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Suche fehlgeschlagen');
      setResults(
        data.results.map((r: SearchResult) => ({
          ...r,
          snippet: highlight(r.snippet, query),
        }))
      );
      setSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      id="search"
      style={{ background: '#050A14' }}
      className="px-4 py-24"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Datenbank
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">Im Buch suchen</h2>
          <p className="mt-3 text-white/50">
            Volltextsuche durch alle 744 Kapitel
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          onSubmit={onSearch}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Stichwort, Ort, Datum, Phänomen …"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-base text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-indigo-500/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Suchen'
            )}
          </button>
        </motion.form>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {searched && results.length === 0 && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-white/40"
          >
            Keine Ergebnisse für &bdquo;{query}&ldquo;
          </motion.p>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 space-y-3"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden
            </p>
            {results.map((r, idx) => (
              <motion.div
                key={`${r.chapter_number}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/chapter/${r.chapter_number}`}
                  className="group block rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-white/8"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-400">
                      Kap. {r.chapter_number}
                    </span>
                    <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {r.title}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed text-white/50"
                    dangerouslySetInnerHTML={{ __html: `…${r.snippet}…` }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
