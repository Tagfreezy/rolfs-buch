import { requireSupabase } from './supabaseClient';

export type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
  content: string;
};

export type ChapterImage = {
  id: string;
  chapter_id: string;
  storage_path: string;
  caption: string | null;
  position_in_chapter: number;
};

export async function getAllChapters(): Promise<Chapter[]> {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('chapters')
      .select('id, title, chapter_number')
      .order('chapter_number', { ascending: true });

    if (error) {
      throw error;
    }
    return (data ?? []) as Chapter[];
  } catch {
    return [
      { id: '1', chapter_number: 1, title: 'Introduction', content: 'Welcome to Grandpa\'s book.' },
      { id: '2', chapter_number: 2, title: 'First Story', content: 'A nostalgic memory...' },
    ];
  }
}

export async function getChapterByNumber(chapterNumber: number): Promise<Chapter | null> {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('chapter_number', chapterNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch {
    const contents: Record<number, Chapter> = {
      1: { id: '1', title: 'Introduction', chapter_number: 1, content: 'Welcome to Grandpa\'s book.' },
      2: { id: '2', title: 'First Story', chapter_number: 2, content: 'A nostalgic memory...' },
    };
    return contents[chapterNumber] ?? null;
  }
}

export async function getChapterImages(chapterId: string): Promise<ChapterImage[]> {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('position_in_chapter', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as ChapterImage[];
  } catch {
    return [];
  }
}

export function makeSupabasePublicUrl(storagePath: string) {
  const supabase = requireSupabase();
  const { data } = supabase.storage
    .from('chapter-images')
    .getPublicUrl(storagePath);

  return data?.publicUrl ?? null;
}
