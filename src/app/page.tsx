'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import SheetTable from '@/components/SheetTable';
import SheetForm from '@/components/SheetForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<string[][]>([]);
  const [editRow, setEditRow] = useState<null | { rowIndex: number; values: string[] }>(null);
  const [loading, setLoading] = useState(true);
  const [deleteRowIndex, setDeleteRowIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/sheet');
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tambah fungsi hapus di HomePage
  const confirmDelete = async () => {
    if (!deleteRowIndex) return;
    const res = await fetch('/api/sheet', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: deleteRowIndex }),
    });

    if (res.ok) {
      await fetchData();
      setDeleteRowIndex(null); // tutup modal
    }
  };

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="p-4">
        <h1>Silakan login dulu</h1>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ke Halaman Login
        </button>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="p-4">
        <h1>Selamat datang, {session.user?.name}</h1>
        <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <SheetForm
        onSuccess={fetchData}
        editRow={editRow}
        onCancelEdit={() => setEditRow(null)}
      />

      <SheetTable
        data={data}
        onEdit={(rowIndex, rowData) => setEditRow({ rowIndex, values: rowData })}
        onDelete={(i) => setDeleteRowIndex(i)}
      />

      <ConfirmDialog
        isOpen={deleteRowIndex !== null}
        message={`Yakin ingin menghapus baris ke-${deleteRowIndex}?`}
        onCancel={() => setDeleteRowIndex(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
