import { getAllChapters } from '@/lib/book';
import { getRecentChapters } from '@/lib/homeData';
import HomeHero from './components/home/HomeHero';
import HomeSearch from './components/home/HomeSearch';
import HomeFeatures from './components/home/HomeFeatures';
import HomeRecent from './components/home/HomeRecent';
import HomeFooter from './components/home/HomeFooter';

export default async function HomePage() {
  const [chapters, recentChapters] = await Promise.all([
    getAllChapters(),
    getRecentChapters(6),
  ]);

  return (
    <main style={{ background: '#050A14' }} className="min-h-screen">
      <HomeHero totalChapters={chapters.length} />
      <HomeSearch />
      <HomeFeatures />
      <HomeRecent chapters={recentChapters} />
      <HomeFooter />
    </main>
  );
}
