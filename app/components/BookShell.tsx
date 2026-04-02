import { ReactNode } from 'react';
import ChapterSidebar from './ChapterSidebar';
import ReadingProgress from './ReadingProgress';

type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
};

export default function BookShell({
  chapters,
  currentChapter,
  children,
  showProgress = false,
}: {
  chapters: Chapter[];
  currentChapter?: number;
  children: ReactNode;
  showProgress?: boolean;
}) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#050A14' }}>
      {showProgress && <ReadingProgress />}
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col md:flex-row">
        <ChapterSidebar chapters={chapters} currentChapter={currentChapter} />
        <main className="min-w-0 flex-1 p-4 md:p-10">{children}</main>
      </div>
    </div>
  );
}
