import { NextResponse } from 'next/server';
import { requireSupabase } from '@/lib/supabaseClient';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = (body.question ?? '').trim();

    if (!question) {
      return NextResponse.json({ error: 'Keine Frage angegeben.' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Anthropic API-Schlüssel nicht konfiguriert.' }, { status: 500 });
    }

    // Search the chapters table using full-text search on the fts column
    const supabase = requireSupabase();
    let chapters: Array<{ title: string; chapter_number: number; content: string }> = [];

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('title, chapter_number, content')
        .textSearch('fts', question, { type: 'websearch' })
        .limit(3);

      if (!error && data && data.length > 0) {
        chapters = data;
      }
    } catch {
      // fts column might not exist — fall back to content search
    }

    // Fallback: search content column directly if fts returned nothing
    if (chapters.length === 0) {
      const { data } = await supabase
        .from('chapters')
        .select('title, chapter_number, content')
        .textSearch('content', question, { type: 'websearch', config: 'english' })
        .limit(3);
      chapters = data ?? [];
    }

    // Build context from retrieved chapters
    const context = chapters.length > 0
      ? chapters
          .map(
            (ch) =>
              `--- Kapitel ${ch.chapter_number}: ${ch.title} ---\n${ch.content.slice(0, 2500)}`
          )
          .join('\n\n')
      : 'Keine relevanten Kapitel gefunden.';

    const systemPrompt = `Du bist "Rolf's Assistent", ein präziser KI-Assistent für das UFO-Forschungsarchiv von Rolf Burgermeister.

Rolf Burgermeister hat über 40 Jahre lang UFO-Sichtungen, unerklärliche Phänomene und ausserirdische Begegnungen weltweit dokumentiert. Sein Werk umfasst 744 Kapitel und deckt Fälle aus allen Kontinenten ab.

WICHTIGE REGELN:
- Beantworte Fragen AUSSCHLIESSLICH auf Basis der unten stehenden Buchauszüge.
- Wenn die Antwort nicht in den Auszügen steht, sage klar: "Darüber schreibt Rolf in den mir vorliegenden Auszügen nichts."
- Erfinde KEINE Fakten und spekuliere nicht über Inhalte, die nicht in den Auszügen stehen.
- Antworte immer auf Deutsch, sachlich und präzise.
- Verweise bei Antworten auf die Kapitel, aus denen du die Information entnimmst.
- Halte Antworten prägnant (max. 3–4 Absätze).

RELEVANTE BUCHAUSZÜGE:
${context}`;

    // Call Anthropic API
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json(
        { error: 'Fehler bei der Verbindung zum KI-Dienst.' },
        { status: 502 }
      );
    }

    const anthropicData = await anthropicRes.json();
    const answer =
      anthropicData?.content?.[0]?.text ?? 'Keine Antwort erhalten.';

    const sources = chapters.map((ch) => ({
      chapter_number: ch.chapter_number,
      title: ch.title,
    }));

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
