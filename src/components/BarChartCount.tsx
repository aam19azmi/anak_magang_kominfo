'use client';


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useMemo } from 'react';
import { findHeaderIndex } from '@/lib/utils';
import { normalizeUniversityName } from '@/utils/normalizeUniversity';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

export default function BarChartCount({ data }: { data: string[][] }) {
  const hasValidData = data && data.length > 0;

  const { chartData, idxTarget, headerIdx } = useMemo(() => {
    const countMap = new Map<string, number>();
    let chartData: { name: string; value: number; percentage: string }[] = [];
    let idxTarget = -1;
    let headerIdx = -1;

    if (!hasValidData) return { countMap, chartData, idxTarget, headerIdx };

    headerIdx = findHeaderIndex(data, ['Asal Sekolah / Universitas']);
    if (headerIdx === -1) return { countMap, chartData, idxTarget, headerIdx };

    const headers = data[headerIdx];
    idxTarget = headers.indexOf('Asal Sekolah / Universitas');
    if (idxTarget === -1) return { countMap, chartData, idxTarget, headerIdx };

    const dataRows = data.slice(headerIdx + 1);
    dataRows.forEach((row) => {
      let val = row[idxTarget]?.trim();
      if (!val || ['#REF!', '#VALUE!', 'N/A', '-'].includes(val.toUpperCase())) return;

      val = normalizeUniversityName(val); // 🔥 normalisasi menggunakan Fuse.js

      countMap.set(val, (countMap.get(val) || 0) + 1);
    });

    const total = Array.from(countMap.values()).reduce((sum, v) => sum + v, 0);
    chartData = Array.from(countMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(2) + '%',
    }));

    return { countMap, chartData, idxTarget, headerIdx };
  }, [data, hasValidData]);

  // Validasi setelah hook
  if (!hasValidData) return <p>Data tidak tersedia</p>;
  if (headerIdx === -1) return <p>Kolom &apos;Asal Sekolah / Universitas&apos; tidak ditemukan</p>;
  if (idxTarget === -1) return <p>Kolom &apos;Asal Sekolah / Universitas&apos; tidak valid</p>;
  if (chartData.length === 0) return <p>Tidak ada data untuk Pie Chart</p>;

  return (
    <div className="w-full h-auto">
      <div className="w-full h-96 p-4 bg-white/50 rounded-lg shadow gap-8">
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip formatter={(value: number) => [value, 'Jumlah']} />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 max-h-40 overflow-y-auto grid grid-cols-3 gap-2 text-sm p-4 bg-white/50 rounded-lg shadow">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
