'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/',
    });

    if (res?.error) {
      alert('Login gagal: ' + res.error);
    }
  };

  return (
    <div
      className="relative flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background/Login.jpg')" }}
    >
      {/* Div pertama: 100% transparan */}
      <div className="absolute inset-0 bg-transparent z-0" />

      {/* Div kedua: 50% transparan dengan border radius-xl */}
      <div className="relative bg-white/50 p-6 rounded-xl shadow-md space-y-4 z-10 w-80">

        {/* Logo di atas form, menembus ke luar div kedua */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <Image
            src="/logo/Logo_Magang.jpg"
            alt="Logo"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </div>

        {/* Form dengan jarak dari logo */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-20">
          <input
            type="email"
            placeholder="Email"
            className="bg-transparent border border-gray-400 placeholder-gray-600 text-black p-2 w-full focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent border border-gray-400 placeholder-gray-600 text-black p-2 w-full focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="group relative w-full text-center px-4 py-2 rounded text-black transition"
          >
            LOGIN
            <span className="absolute inset-0 bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
          </button>
        </form>
      </div>
    </div>
  );
}
