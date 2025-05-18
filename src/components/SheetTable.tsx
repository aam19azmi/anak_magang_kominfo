'use client';

type Props = {
  data: string[][],
  onEdit: (rowIndex: number, rowData: string[]) => void,
  onDelete: (rowIndex: number) => void,
};

export default function SheetTable({ data, onEdit, onDelete }: Props) {
  if (!data.length) return <p>Tidak ada data</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {data[0].map((header, idx) => (
              <th key={idx} className="px-4 py-2 border">{header}</th>
            ))}
            <th className="px-4 py-2 border" colSpan={2}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border">{cell}</td>
              ))}
              <td className="px-4 py-2 border">
                <button onClick={() => onEdit(i + 2, row)} className="text-blue-600 underline">Edit</button>
              </td>
              <td className="px-4 py-2 border">
                <button onClick={() => onDelete(i + 2)} className="text-red-600 underline">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
