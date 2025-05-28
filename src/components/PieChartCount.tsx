'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo, useEffect } from 'react';
import { findHeaderIndex } from '@/lib/utils';
import { normalizeUniversityName } from '@/utils/normalizeUniversity';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

export default function PieChartCount({ data }: { data: string[][] }) {
  const hasValidData = data && data.length > 0;

  const { countMap, chartData, idxTarget, headerIdx } = useMemo(() => {
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

  useEffect(() => {
    console.log('Final Data mentah:', data);
    console.log('Final ChartData:', chartData);
    console.log('Final CountMap:', countMap);
  }, [data, chartData, countMap]);

  // Validasi setelah hook
  if (!hasValidData) return <p>Data tidak tersedia</p>;
  if (headerIdx === -1) return <p>Kolom &apos;Asal Sekolah / Universitas&apos; tidak ditemukan</p>;
  if (idxTarget === -1) return <p>Kolom &apos;Asal Sekolah / Universitas&apos; tidak valid</p>;
  if (chartData.length === 0) return <p>Tidak ada data untuk Pie Chart</p>;

  return (
    <div className="w-full h-auto">
      <div className="w-full h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, 'Jumlah']} />
            {/* Legend bawaan dihapus */}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 max-h-40 overflow-y-auto grid grid-cols-3 gap-2 text-sm">
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
