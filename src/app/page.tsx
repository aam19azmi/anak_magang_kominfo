'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import SheetDisplay from '@/components/SheetDisplay';
import Image from 'next/image';
import Home from './home/page';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Record<string, string[][]>>({});

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sheet');
      const json = await res.json();
      setData(json.data || {});
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      localStorage.setItem('lastActivity', Date.now().toString());

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 60 * 60 * 1000); // 1 jam
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const last = parseInt(lastActivity, 10);
      const now = Date.now();
      const differenceInMinutes = (now - last) / (1000 * 60);

      if (differenceInMinutes > 5) {
        signOut({ callbackUrl: '/login' });
      }
    }
  }, []);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <Home />;
  if (!session) return <Home />;

  return (
    <main className="p-8 space-y-8 bg-gray-800">
      {/* Navbar */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-600 rounded-lg space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo/Logo_Universitas_Dian_Nuswantoro.png"
            alt="Logo UDINUS"
            width={400}
            height={400}
            className="h-10 w-auto"
          />
        </div>
        <div className="text-center text-white">
          <h1 className="text-xl font-medium">Selamat datang, {session?.user?.name ?? 'User'}</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2"
          >
            Logout
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Image
            src="/logo/Logo_Diskominfo_Kota_Semarang.png"
            alt="Logo DISKOMINFO"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-gray-400 shadow-md">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SheetDisplay data={data} />
      </div>
    </main>
  );
}
