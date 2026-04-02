import { requireSupabase } from './supabaseClient';

export type RecentChapter = {
  id: string;
  title: string;
  chapter_number: number;
  content: string;
};

export async function getRecentChapters(limit = 6): Promise<RecentChapter[]> {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('chapters')
      .select('id, title, chapter_number, content')
      .order('chapter_number', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as RecentChapter[];
  } catch {
    return [];
  }
}
