'use client';

import { useState, useEffect } from 'react';

type Props = {
  onSuccess: () => void;
  editRow?: {
    rowIndex: number;
    values: string[];
  } | null;
  onCancelEdit?: () => void;
};

export default function SheetForm({ onSuccess, editRow, onCancelEdit }: Props) {
  const [formData, setFormData] = useState({
    name: editRow?.values[0] || '',
    email: editRow?.values[1] || '',
    gender: editRow?.values[2] || '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editRow) {
      setFormData({
        name: editRow.values[0],
        email: editRow.values[1],
        gender: editRow.values[2],
      });
    }
  }, [editRow]);

  const validate = () => {
    const newErrors = [];
    if (!formData.name.trim()) newErrors.push('Nama tidak boleh kosong.');
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.push('Email tidak valid.');
    if (!['Laki-laki', 'Perempuan'].includes(formData.gender)) {
      newErrors.push('Jenis kelamin harus Laki-laki atau Perempuan.');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await fetch('/api/sheet', {
      method: editRow ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: [formData.name, formData.email, formData.gender],
        rowIndex: editRow?.rowIndex,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setFormData({ name: '', email: '', gender: '' });
      onSuccess();
      if (editRow && onCancelEdit) onCancelEdit();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        name="name"
        placeholder="Nama"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        type="text"
        name="gender"
        placeholder="Jenis Kelamin (Laki-laki / Perempuan)"
        value={formData.gender}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />

      {errors.length > 0 && (
        <ul className="text-red-600 list-disc ml-5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-green-600 text-white rounded"
      >
        {loading ? 'Mengirim...' : editRow ? 'Update Data' : 'Tambah Data'}
      </button>

      {editRow && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="ml-2 text-sm underline text-red-600"
        >
          Batal Edit
        </button>
      )}

      {success && <p className="text-green-600">{editRow ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!'}</p>}
    </form>
  );
}
