import Fuse from 'fuse.js';
import universities from '@/lib/universities.json';

const fuse = new Fuse(universities, {
  keys: ['canonical', 'aliases'],
  threshold: 0.3,
  includeScore: true,
});

export function normalizeUniversityName(
  name: string,
  onMatch?: (original: string, matchedAlias: string, canonical: string, score: number) => void
): string {
  if (!name) return '';

  const cleaned = name.trim().replace(/[^\w\s]/gi, '').toLowerCase();
  const result = fuse.search(cleaned);

  if (
    result.length > 0 &&
    result[0].score !== undefined &&
    result[0].score <= 0.3
  ) {
    const matchedAlias = result[0].item.aliases ?? '';
    const canonical = result[0].item.canonical ?? '';
    const score = result[0].score;

    if (onMatch) {
      onMatch(name, matchedAlias, canonical, score);
    }

    return canonical;
  }

  return name;
}
