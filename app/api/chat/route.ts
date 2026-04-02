import { NextResponse } from 'next/server';
import { requireSupabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  // Read env var inside the handler — NOT at module level.
  // Module-level reads can be undefined during Vercel cold starts.
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    const body = await request.json();
    const question = (body.question ?? '').trim();

    if (!question) {
      return NextResponse.json({ error: 'Keine Frage angegeben.' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('[chat] ANTHROPIC_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Anthropic API-Schlüssel nicht konfiguriert.' },
        { status: 500 }
      );
    }

    // ── Supabase: full-text search for relevant chapters ──────────────────────
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
      } else if (error) {
        console.error('[chat] fts search error:', error.message);
      }
    } catch (e) {
      console.error('[chat] fts search threw:', e);
    }

    // Fallback: search on content column if fts returned nothing
    if (chapters.length === 0) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('title, chapter_number, content')
          .textSearch('content', question, { type: 'websearch', config: 'english' })
          .limit(3);

        if (error) console.error('[chat] content search error:', error.message);
        chapters = data ?? [];
      } catch (e) {
        console.error('[chat] content search threw:', e);
      }
    }

    console.log(`[chat] question="${question}" chapters_found=${chapters.length}`);

    // ── Build context ─────────────────────────────────────────────────────────
    const context =
      chapters.length > 0
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

    // ── Call Anthropic API ────────────────────────────────────────────────────
    let anthropicRes: Response;
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
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
          messages: [{ role: 'user', content: question }],
        }),
      });
    } catch (fetchErr) {
      console.error('[chat] Network error reaching Anthropic API:', fetchErr);
      return NextResponse.json(
        { error: 'Netzwerkfehler beim Erreichen des KI-Dienstes.' },
        { status: 502 }
      );
    }

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error(
        `[chat] Anthropic API responded ${anthropicRes.status}: ${errBody}`
      );
      return NextResponse.json(
        { error: `KI-Dienst Fehler (${anthropicRes.status}): ${errBody}` },
        { status: 502 }
      );
    }

    const anthropicData = await anthropicRes.json();
    const answer = anthropicData?.content?.[0]?.text ?? 'Keine Antwort erhalten.';

    console.log(`[chat] answer_length=${answer.length} sources=${chapters.length}`);

    return NextResponse.json({
      answer,
      sources: chapters.map((ch) => ({
        chapter_number: ch.chapter_number,
        title: ch.title,
      })),
    });
  } catch (err) {
    console.error('[chat] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
