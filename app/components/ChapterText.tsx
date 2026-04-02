import { ChapterImage, makeSupabasePublicUrl } from '@/lib/book';

type ChapterTextProps = {
  content: string;
  images: ChapterImage[];
};

export default function ChapterText({ content, images }: ChapterTextProps) {
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const grouped: Array<{ paragraph: string; images: ChapterImage[] }> = paragraphs.map(
    (paragraph, index) => ({
      paragraph,
      images: images.filter((img) => img.position_in_chapter === index + 1),
    })
  );

  return (
    <div className="font-serif text-[1.2rem] leading-[2] text-white/75">
      {grouped.map((block, idx) => (
        <div key={`${idx}-${block.paragraph.slice(0, 12)}`}>
          <p className="mb-7">{block.paragraph}</p>
          {block.images.map((image) => {
            const src = makeSupabasePublicUrl(image.storage_path);
            if (!src) return null;
            return (
              <figure
                key={image.id}
                className="my-10 overflow-hidden rounded-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                <img
                  src={src}
                  alt={image.caption ?? `Abbildung ${image.id}`}
                  className="w-full object-cover"
                />
                {image.caption && (
                  <figcaption className="px-5 py-3 text-center text-sm italic text-white/35">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
}
