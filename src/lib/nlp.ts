// Daftar stopword sederhana (bisa ditambah sesuai kebutuhan)
const STOPWORDS = new Set([
  "yang", "dan", "untuk", "dengan", "pada", "dari", "oleh", "karena",
  "sebagai", "juga", "di", "ke", "ini", "itu", "adalah", "atau", "akan", "dalam"
]);

// Fungsi stemming ringan
function stem(word: string): string {
  // Hapus awalan umum
  word = word.replace(/^(di|ke|se|me|be|ter)/, "");
  // Hapus akhiran umum
  word = word.replace(/(kan|an|i)$/g, "");
  return word;
}

// Tokenizer + stopword filter + stemming
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, "") // hilangkan tanda baca
    .split(/\s+/)
    .map(w => stem(w)) // stemming ringan
    .filter(w => w && !STOPWORDS.has(w)); // buang stopword & kosong
}

// Hitung TF-IDF
export function createTfIdf(docs: string[]) {
  const termSet = new Set<string>();
  const tf: Record<number, Record<string, number>> = {};
  const df: Record<string, number> = {};

  docs.forEach((doc, i) => {
    const words = tokenize(doc);
    const counts: Record<string, number> = {};

    words.forEach(word => {
      termSet.add(word);
      counts[word] = (counts[word] || 0) + 1;
    });

    tf[i] = counts;

    for (const word in counts) {
      df[word] = (df[word] || 0) + 1;
    }
  });

  const terms = Array.from(termSet);
  const totalDocs = docs.length;

  function tfidfVector(input: number | string): Record<string, number> {
    let counts: Record<string, number> = {};

    if (typeof input === "number") {
      counts = tf[input];
    } else {
      const words = tokenize(input);
      words.forEach(word => {
        counts[word] = (counts[word] || 0) + 1;
      });
    }

    const vec: Record<string, number> = {};
    for (const term of terms) {
      const tfval = counts[term] || 0;
      const idfval = Math.log((1 + totalDocs) / (1 + (df[term] || 0))) + 1;
      vec[term] = tfval * idfval;
    }

    return vec;
  }

  return {
    tfidfVector,
  };
}

// Cosine similarity
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  let dot = 0,
    magA = 0,
    magB = 0;

  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  terms.forEach(term => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
