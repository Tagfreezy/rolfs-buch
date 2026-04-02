'use client';

import Link from 'next/link';
import { useState } from 'react';

type SearchResult = {
  chapter_number: number;
  title: string;
  snippet: string;
};

function highlightTerm(text: string, query: string) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(re, '<mark class="bg-amber-200 text-stone-900 rounded px-0.5">$1</mark>');
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Search failed');
      }
      setResults(
        data.results.map((item: SearchResult) => ({
          ...item,
          snippet: highlightTerm(item.snippet, query),
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
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-stone-800">Search the book</h3>
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapter text, titles, and keywords..."
            aria-label="Search book"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:opacity-60"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      {searched && results.length === 0 && !error && (
        <p className="mt-4 text-sm text-stone-500">No results found for &ldquo;{query}&rdquo;.</p>
      )}

      {results.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <ul className="space-y-3">
            {results.map((result, idx) => (
              <li key={`${result.chapter_number}-${idx}`}>
                <Link
                  href={`/chapter/${result.chapter_number}`}
                  className="group block rounded-xl border border-stone-200 p-4 transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  <p className="mb-1 text-xs font-medium text-indigo-600">
                    Chapter {result.chapter_number}
                  </p>
                  <p className="mb-2 font-semibold text-stone-800 group-hover:text-indigo-700 transition-colors">
                    {result.title}
                  </p>
                  <p
                    className="text-sm leading-relaxed text-stone-600"
                    dangerouslySetInnerHTML={{ __html: `...${result.snippet}...` }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
