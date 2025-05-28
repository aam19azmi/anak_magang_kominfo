'use client';

import SheetTable from "./SheetTable";
import BarChartByTanggal from './BarChartByTanggal';
import PieChartCount from './PieChartCount';

export default function SheetDisplay({ data }: { data: Record<string, string[][]> }) {
  return (
    <>
        {Object.entries(data).map(([sheetName, rows]) => (
            <div key={sheetName} className="mb-8">
                <h2 className="text-xl font-bold mb-2">{sheetName}</h2>
                {rows.length > 0 ? (
                <>
                    <div className="mb-4 bg-gray-600 p-4 rounded-lg shadow-md shadow=gray-200 border-white">
                      <h3 className="text-lg font-semibold text-black [text-shadow:0_0_1px_white] [-webkit-text-stroke:1px_white]">Distribusi Magang</h3>
                      <BarChartByTanggal rows={rows} labelMasuk="Tanggal Masuk" labelBidang={["Keterangan", "Program Studi/Jurusan", "NO.TLPN"]} />
                      <div className="mt-4">
                      <h3 className="text-lg font-semibold text-black [text-shadow:0_0_1px_white] [-webkit-text-stroke:1px_white]">Distribusi Asal Magang</h3>
                      <PieChartCount data={rows} />
                      </div>
                      <div className="mt-4">
                      <SheetTable data={rows} />
                      </div>
                    </div>
                </>
                ) : (
                <p>Sheet ini kosong</p>
                )}
            </div>
        ))}
    </>
  );
}
