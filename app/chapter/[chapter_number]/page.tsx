import Link from 'next/link';
import BookShell from '@/app/components/BookShell';
import ChapterReader from '@/app/components/ChapterReader';
import { getAllChapters, getChapterByNumber, getChapterImages } from '@/lib/book';

type Params = {
  params: {
    chapter_number: string;
  };
};

function readingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ChapterPage({ params }: Params) {
  const chapterNumber = Number(params.chapter_number);

  const [chapters, chapter] = await Promise.all([
    getAllChapters(),
    getChapterByNumber(chapterNumber),
  ]);

  if (!chapter) {
    return (
      <BookShell chapters={chapters}>
        <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <p className="text-white/40">Kapitel nicht gefunden</p>
        </div>
      </BookShell>
    );
  }

  const images = await getChapterImages(chapter.id);

  const totalChapters = chapters.length;
  const currentIndex = chapters.findIndex((ch) => ch.chapter_number === chapterNumber);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  const minutes = readingTime(chapter.content);

  return (
    <BookShell chapters={chapters} currentChapter={chapter.chapter_number} showProgress>
      <article className="mx-auto max-w-2xl">

        {/* Top bar: Home button + progress badge */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-white/40 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Startseite</span>
          </Link>

          <span
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8',
            }}
          >
            Kapitel {chapter.chapter_number} von {totalChapters}
          </span>
        </div>

        {/* Chapter header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="rounded-md px-2.5 py-1 font-mono text-xs font-semibold"
              style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.2)',
                color: '#06b6d4',
              }}
            >
              #{String(chapter.chapter_number).padStart(3, '0')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ca. {minutes} Min. Lesezeit
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
            {chapter.title}
          </h1>

          <div
            className="mt-6 h-px w-full"
            style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.3), transparent)' }}
          />
        </header>

        {/* Chapter body with TTS */}
        <ChapterReader content={chapter.content} images={images} />

        {/* Bottom divider */}
        <div
          className="my-14 h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }}
        />

        {/* Prev / Next navigation */}
        <nav className="grid grid-cols-2 gap-4 pb-16">
          {prevChapter ? (
            <Link
              href={`/chapter/${prevChapter.chapter_number}`}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.06]"
            >
              <span className="mb-2 flex items-center gap-1.5 text-xs text-white/30">
                <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Vorheriges Kapitel
              </span>
              <span className="mb-1 font-mono text-xs" style={{ color: '#06b6d4' }}>
                {String(prevChapter.chapter_number).padStart(3, '0')}
              </span>
              <span className="line-clamp-2 text-sm font-medium leading-snug text-white/60 transition-colors group-hover:text-white/90">
                {prevChapter.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link
              href={`/chapter/${nextChapter.chapter_number}`}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-right transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.06]"
            >
              <span className="mb-2 flex items-center justify-end gap-1.5 text-xs text-white/30">
                Nächstes Kapitel
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="mb-1 block font-mono text-xs" style={{ color: '#06b6d4' }}>
                {String(nextChapter.chapter_number).padStart(3, '0')}
              </span>
              <span className="line-clamp-2 text-sm font-medium leading-snug text-white/60 transition-colors group-hover:text-white/90">
                {nextChapter.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </BookShell>
  );
}
