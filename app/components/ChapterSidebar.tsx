'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
};

const CATEGORIES = [
  'Alle',
  'Europa',
  'Amerika',
  'Asien',
  'Afrika',
  'Australien',
  'Naher Osten',
  'Antike',
  'Moderne Sichtungen',
  'Militär',
  'Wissenschaft',
];

export default function ChapterSidebar({
  chapters,
  currentChapter,
}: {
  chapters: Chapter[];
  currentChapter?: number;
}) {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('Alle');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar when navigating (catches browser back/forward too)
  useEffect(() => {
    setMobileOpen(false);
  }, [currentChapter]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const filtered = filter.trim()
    ? chapters.filter(
        (ch) =>
          ch.title.toLowerCase().includes(filter.toLowerCase()) ||
          String(ch.chapter_number).includes(filter.trim())
      )
    : chapters;

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
            Inhalt
          </span>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
              }}
            >
              {chapters.length}
            </span>
            {/* Close button — mobile only */}
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white/70 md:hidden"
              aria-label="Menü schliessen"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-2">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Kapitel suchen …"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg py-2 pl-9 pr-8 text-sm text-white placeholder-white/25 transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
              aria-label="Suche löschen"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: category === 'Alle' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)',
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 shrink-0 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
              </svg>
              {category === 'Alle' ? 'Nach Kategorie filtern' : category}
            </span>
            <svg
              className="h-3.5 w-3.5 shrink-0 text-white/25 transition-transform"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg py-1 shadow-2xl"
              style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors active:bg-white/10"
                  style={{
                    color: category === cat ? '#818cf8' : 'rgba(255,255,255,0.55)',
                    background: category === cat ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                >
                  {category === cat ? (
                    <svg className="h-3 w-3 shrink-0 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="h-3 w-3 shrink-0" />
                  )}
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filter && (
          <p className="mt-2 text-xs text-white/25">
            {filtered.length} von {chapters.length} Kapiteln
          </p>
        )}
      </div>

      {/* Chapter list */}
      <nav
        className="flex-1 overflow-y-auto p-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        <ul className="space-y-0.5">
          {filtered.map((chapter) => {
            const active = currentChapter === chapter.chapter_number;
            return (
              <li key={chapter.id}>
                <Link
                  href={`/chapter/${chapter.chapter_number}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 active:bg-white/10"
                  style={
                    active
                      ? {
                          background: 'rgba(99,102,241,0.12)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          boxShadow: '0 0 12px rgba(99,102,241,0.08)',
                        }
                      : { border: '1px solid transparent' }
                  }
                >
                  <span
                    className="mt-0.5 shrink-0 font-mono text-xs"
                    style={{ color: active ? '#06b6d4' : 'rgba(255,255,255,0.2)' }}
                  >
                    {String(chapter.chapter_number).padStart(3, '0')}
                  </span>
                  <span
                    className="leading-snug"
                    style={{ color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)' }}
                  >
                    {chapter.title}
                  </span>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-white/25">
              Keine Kapitel für &bdquo;{filter}&ldquo; gefunden
            </li>
          )}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger button (hidden on md+) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg md:hidden"
        style={{
          background: 'rgba(5,10,20,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label="Kapitel-Menü öffnen"
      >
        <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ──
            Mobile:  fixed overlay, slides in from left
            Desktop: sticky column                        */}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0"
        style={{
          background: '#050A14',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        // On mobile, override the CSS-class translate with inline style so the
        // transition fires correctly when toggling.
        data-mobile-open={mobileOpen ? 'true' : 'false'}
      >
        {sidebarContent}
      </aside>

      {/* Inline style to drive the mobile slide animation without Tailwind JIT issues */}
      <style jsx global>{`
        @media (max-width: 767px) {
          aside[data-mobile-open='false'] {
            transform: translateX(-100%);
          }
          aside[data-mobile-open='true'] {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
