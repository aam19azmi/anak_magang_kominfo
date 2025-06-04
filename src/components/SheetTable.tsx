'use client';

import { useState, useMemo } from 'react';

type Props = {
  data: string[][];
};

export default function SheetTable({ data }: Props) {
  const headers = useMemo(() => (data.length > 0 ? data[0] : []), [data]);
  const body = useMemo(() => (data.length > 1 ? data.slice(1) : []), [data]);

  const [columnFilters, setColumnFilters] = useState<string[]>(
    () => Array(data[0]?.length || 0).fill('')
  );

  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const noData = !data.length || headers.length === 0;

  // Filter per kolom
  const filtered = useMemo(() => {
    return body.filter((row) =>
      row.every((cell, i) =>
        columnFilters[i]
          ? cell.toLowerCase().includes(columnFilters[i].toLowerCase())
          : true
      )
    );
  }, [body, columnFilters]);

  // Sort
  const sorted = useMemo(() => {
    if (sortIndex === null) return filtered;
    return [...filtered].sort((a, b) => {
      const valA = a[sortIndex] || '';
      const valB = b[sortIndex] || '';
      return sortAsc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [filtered, sortIndex, sortAsc]);

  // Pagination
  const pageCount = Math.ceil(sorted.length / rowsPerPage);
  const paginated = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (index: number) => {
    if (sortIndex === index) {
      setSortAsc(!sortAsc);
    } else {
      setSortIndex(index);
      setSortAsc(true);
    }
  };

  const updateFilter = (index: number, value: string) => {
    const newFilters = [...columnFilters];
    newFilters[index] = value;
    setColumnFilters(newFilters);
    setPage(1); // Reset ke halaman 1
  };

  return (
    <div className="overflow-x-auto mt-6 max-w-6xl mx-auto px-4">
      {noData ? (
        <p className="text-gray-500 italic mt-4">Tidak ada data</p>
      ) : (
        <div className="shadow-md rounded-xl overflow-hidden border border-gray-200">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-800 font-semibold">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 border-b border-gray-300 cursor-pointer select-none hover:bg-gray-200"
                    onClick={() => handleSort(idx)}
                  >
                    {header}
                    {sortIndex === idx && (
                      <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
              <tr className="bg-white">
                {headers.map((_, idx) => (
                  <th key={idx} className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder={`Cari...`}
                      className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring"
                      value={columnFilters[idx]}
                      onChange={(e) => updateFilter(idx, e.target.value)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-100 transition-colors odd:bg-white even:bg-gray-50"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-6 py-3 border-b border-gray-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-white">
          <span>
            Halaman {page} dari {pageCount}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              disabled={page === pageCount}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
