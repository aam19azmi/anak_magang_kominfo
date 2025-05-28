'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { findHeaderIndex } from '@/lib/utils';
import internshipField from '@/lib/internshipField.json';
import { useMemo, useState } from 'react';
import { createTfIdf, cosineSimilarity } from '@/lib/nlp';

type Props = {
  rows: string[][];
  labelMasuk: string | string[];
  labelBidang?: string | string[];
};

export default function BarChartByTanggal({ rows, labelMasuk, labelBidang }: Props) {
  const isEmpty = !rows || rows.length === 0 || !rows[0];
  const currentYear = new Date().getFullYear();
  const [tahunAktif, setTahunAktif] = useState(currentYear);
  const headerIdx = useMemo(() => {
  const labels = Array.isArray(labelMasuk) ? labelMasuk : [labelMasuk];
    return findHeaderIndex(rows, labels);
  }, [rows, labelMasuk]);
  const { idxMasuk, idxBidang } = useMemo(() => {
    if (headerIdx === -1) return { idxMasuk: -1, idxBidang: -1 };

    const headers = rows[headerIdx];

    const labelMasukList = Array.isArray(labelMasuk) ? labelMasuk : [labelMasuk];
    const idxMasuk = labelMasukList.findIndex(label => headers.includes(label));
    const actualIdxMasuk = idxMasuk !== -1 ? headers.indexOf(labelMasukList[idxMasuk]) : -1;

    let actualIdxBidang = -1;
    if (labelBidang) {
      const labelBidangList = Array.isArray(labelBidang) ? labelBidang : [labelBidang];
      const idxBidang = labelBidangList.findIndex(label => headers.includes(label));
      actualIdxBidang = idxBidang !== -1 ? headers.indexOf(labelBidangList[idxBidang]) : -1;
    }

    return { idxMasuk: actualIdxMasuk, idxBidang: actualIdxBidang };
  }, [rows, headerIdx, labelMasuk, labelBidang]);

  const dataRows = useMemo(() => {
    return headerIdx !== -1 ? rows.slice(headerIdx + 1) : [];
  }, [rows, headerIdx]);

  const parsedDates = useMemo(() => {
    return dataRows
      .map(row => {
        const val = row[idxMasuk]?.trim();
        if (!val || ['#REF!', '#VALUE!', '-', 'N/A'].includes(val.toUpperCase())) return null;
        const tanggal = parseTanggal(val);
        return tanggal ? { tanggal } : null;
      })
      .filter(Boolean) as { tanggal: Date }[];
  }, [dataRows, idxMasuk]);

  const tahunUnik = useMemo(() => {
    const set = new Set<number>();
    parsedDates.forEach(({ tanggal }) => {
      set.add(tanggal.getFullYear());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [parsedDates]);

  

  const groupedByMonthAktif = useMemo(() => {
    return groupByMonthYear(parsedDates, tahunAktif);
  }, [parsedDates, tahunAktif]);

  const tahunAktifIdx = tahunUnik.indexOf(tahunAktif);
  const bisaNext = tahunAktifIdx < tahunUnik.length - 1;
  const bisaBack = tahunAktifIdx > 0;

  const groupedByYear = useMemo(
    () => groupByYear(parsedDates, currentYear),
    [parsedDates, currentYear]
  );
  // Membuat TF-IDF dari aliases bidang magang
  const bidangAliases = useMemo(() => {
    return internshipField.map(f => (f.aliases + ' ' + f.canonical).toLowerCase());
  }, []);

  const tfidf = useMemo(() => createTfIdf(bidangAliases), [bidangAliases]);

  const groupedByField = useMemo(() => {
    if (idxBidang === -1) return [];

    const bidangCounts: Record<string, number> = {};
    const canonicalLabels = internshipField.map(f => f.canonical);

    for (const row of dataRows) {
      const valRaw = row[idxBidang]?.trim().toLowerCase();
      if (!valRaw || ['#ref!', '#value!', '-', 'n/a'].includes(valRaw)) continue;

      // TF-IDF vektor untuk val
      const valTfidfVector = tfidf.tfidfVector(valRaw);

      // Cari cosine similarity ke semua bidang alias
      const scores = bidangAliases.map((_, i) => {
        const aliasVector = tfidf.tfidfVector(i);
        return cosineSimilarity(valTfidfVector, aliasVector);
      });

      const bestIdx = scores.indexOf(Math.max(...scores));
      const matched = canonicalLabels[bestIdx];
      bidangCounts[matched] = (bidangCounts[matched] || 0) + 1;
    }

    return Object.entries(bidangCounts)
      .map(([bidang, jumlah]) => ({ bidang, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [dataRows, idxBidang, bidangAliases, tfidf]);

  // --- Now safe to return based on condition ---
  if (isEmpty) return <p>Data tidak tersedia</p>;
  if (headerIdx === -1) return <p>Header &apos;{labelMasuk}&apos; tidak ditemukan</p>;

  return (
    <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg shadow gap-8">
      {/* Container atas: Chart 1 & 2 */}
      <div className="flex flex-col lg:flex-row justify-between w-full max-w-6xl gap-8">
        <div className="w-full lg:w-[48%] min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Jumlah Magang per Bulan - Tahun {tahunAktif}
          </h2>

          {/* Tombol navigasi tahun */}
          {tahunUnik.length > 1 && (
            <div className="flex justify-center gap-4 mb-2">
              <button
                disabled={!bisaBack}
                onClick={() => setTahunAktif(tahunUnik[tahunAktifIdx - 1])}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ⬅️ {tahunUnik[tahunAktifIdx - 1] || ''}
              </button>
              <button
                disabled={!bisaNext}
                onClick={() => setTahunAktif(tahunUnik[tahunAktifIdx + 1])}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                {tahunUnik[tahunAktifIdx + 1] || ''} ➡️
              </button>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupedByMonthAktif} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="bulanTahun" />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-[48%] min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Jumlah Magang per Tahun
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupedByYear} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="tahun" />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Container bawah: Chart 3 */}
      {groupedByField.length > 0 && (
        <div className="w-full max-w-6xl min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Jumlah Magang per Bidang
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupedByField} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="bidang" />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---

function parseTanggal(raw: string | undefined): Date | null {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = raw.replace(/[^0-9A-Za-z\/\- ]/g, ' ').replace(/\s+/g, ' ').trim();

  const candidates = [
    cleaned,
    cleaned.replace(/-/g, '/'),
    cleaned.replace(/\b([A-Za-z]+)/g, match => match.slice(0, 3)),
  ];

  for (const str of candidates) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function groupByMonthYear(data: { tanggal: Date }[], targetYear: number) {
  const counts: Record<string, number> = {};

  data.forEach(({ tanggal }) => {
    if (tanggal.getFullYear() !== targetYear) return;
    const key = tanggal.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([bulanTahun, jumlah]) => ({ bulanTahun, jumlah }))
    .sort((a, b) => {
      const [monthA, yearA] = a.bulanTahun.split(' ');
      const [monthB, yearB] = b.bulanTahun.split(' ');
      const dA = new Date(`${monthA} 1, ${yearA}`);
      const dB = new Date(`${monthB} 1, ${yearB}`);
      return dA.getTime() - dB.getTime();
    });
}

function groupByYear(data: { tanggal: Date }[], currentYear: number) {
  const counts: Record<number, number> = {};

  data.forEach(({ tanggal }) => {
    const year = tanggal.getFullYear();
    if (year <= currentYear) {
      counts[year] = (counts[year] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([tahun, jumlah]) => ({ tahun, jumlah }))
    .sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
}
