/**
 * Maison — Journal article page (stub — Phase 2)
 */

interface JournalArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 1.25rem' }}>
      <p className="eyebrow">Journal</p>
      <h1
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: '2rem',
        }}
      >
        {slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </h1>
      <p style={{ color: '#8a8178' }}>
        Full journal article (Sanity CMS content, rich text, author, date) — Phase 2.
      </p>
    </main>
  );
}
