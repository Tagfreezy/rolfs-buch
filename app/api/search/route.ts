import { NextResponse } from 'next/server';
import { requireSupabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('chapters')
    .select('id, title, chapter_number, content')
    .textSearch('content', q, {
      config: 'english',
      type: 'websearch',
    })
    .order('chapter_number', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = (data ?? []).map((chapter: any) => {
    const contentLower = chapter.content.toLowerCase();
    const qLower = q.toLowerCase();
    const idx = contentLower.indexOf(qLower);
    const start = idx >= 0 ? Math.max(0, idx - 45) : 0;
    const end = idx >= 0 ? Math.min(chapter.content.length, idx + q.length + 45) : Math.min(220, chapter.content.length);
    const snippet = idx >= 0 ? chapter.content.slice(start, end).replace(/\n/g, ' ') : chapter.content.slice(0, 220).replace(/\n/g, ' ');

    return {
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      snippet,
    };
  });

  return NextResponse.json({ results });
}
