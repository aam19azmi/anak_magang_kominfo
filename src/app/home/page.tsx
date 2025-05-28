'use client';

import { useEffect, useRef, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import Link from 'next/link';

const Home = () => {
  const institutions = [
    'udinus.png',
    'undip.png',
    'unissula.png',
    'univsemarang.jpg',
    'unnes.png',
  ];

  const [showAllPhotos, setShowAllPhotos] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: false });

    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const scrollContainer = scrollContainerRef.current;
    const scrollContent = scrollContentRef.current;

    if (scrollContainer && scrollContent) {
      const originalContent = scrollContent.innerHTML;
      scrollContent.innerHTML = originalContent + originalContent;

      let scrollPos = 0;
      const speed = 1;

      const scroll = () => {
        scrollPos += speed;
        if (scrollPos >= scrollContent.scrollWidth / 2) {
          scrollPos = 0;
        }
        scrollContainer.scrollLeft = scrollPos;
        requestAnimationFrame(scroll);
      };

      scroll();
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const photoCount = showAllPhotos ? 9 : 6;
  const [erroredImages, setErroredImages] = useState<number[]>([]);

  const handleError = (index: number) => {
      setErroredImages(prev => [...prev, index]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-poppins">
      <video
        autoPlay
        muted
        loop
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/bg.mp4" type="video/mp4" />
        <source src="/bg.webm" type="video/webm" />
        Your browser does not support HTML5 video.
      </video>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/assets/udinus.png"
                alt="Logo"
                className="w-8 h-8 rounded-full object-contain"
              />
              <span className="text-gray-900 font-bold text-xl">UDINUS</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {['Home', 'Kontribusi', 'Galeri', 'Daftar Magang'].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className={`text-sm font-medium transition-colors ${
                    item === 'Daftar Magang'
                      ? 'text-red-800 hover:text-red-700'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  {item}
                </a>
              ))}
              <Link
                href="/login"
              >
                <div className="bg-red-800 text-white px-4 py-1 rounded-full border border-red-800 hover:bg-red-700 transition-colors">
                    Login
                </div>
              </Link>
            </div>
            <Image src="/assets/diskominfo.jpg" alt="Logo" className="w-30 h-12 object-contain" />
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12" data-aos="fade-down" data-aos-duration="800">
            <Image
              src="/assets/Belajar_Kominfo.png"
              alt="Pemerintah Kota Semarang"
              className="w-full max-w-4xl mx-auto rounded-lg border-4 border-white shadow-lg mb-6"
            />
            <div className="space-y-2">
              <h1 className="text-3xl md:text-2xl font-bold text-gray-900">Tempat terbaik untuk tumbuh</h1>
              <p className="text-lg md:text-sm text-gray-600">Pengalaman Magang yang membentuk masa depan</p>
            </div>
            <hr className="w-24 h-0.5 bg-gray-300 mx-auto my-8" />
          </section>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="relative overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
                data-aos="fade-right"
                data-aos-delay={num * 100}
              >
                <Image
                  src={`/assets/magang${num}.jpeg`}
                  alt={`Magang ${num}`}
                  className="w-full h-48 md:h-64 object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://picsum.photos/600/400?random=${num}`;
                  }}
                />
              </div>
            ))}
          </div>

          {/* Institutions Carousel */}
          <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mt-12" data-aos="fade-up">
            <h1 className="text-2xl md:text-2xl font-bold text-center text-gray-900 mb-8">
              Institusi Pendidikan yang Telah Berkontribusi<br />Bersama Diskominfo
            </h1>
            <div ref={scrollContainerRef} className="relative overflow-hidden h-32 w-full">
              <div
                ref={scrollContentRef}
                className="absolute top-0 left-0 h-full flex items-center space-x-8 whitespace-nowrap"
              >
                {institutions.map((logo, index) => (
                  <div
                    key={index}
                    className="bg-white/90 rounded-lg p-4 shadow-md flex-shrink-0 w-44 h-24 flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Image
                      src={`/assets/${logo}`}
                      className="h-14 object-contain opacity-80 hover:opacity-100 transition-opacity"
                      alt={`Institution ${index}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* New Experience Section */}
          <section className="text-center my-16" data-aos="fade-up">
            <h2 className="text-2xl md:text-2xl font-bold text-gray-900 mb-4">
              Pengalaman magang menantimu
            </h2>
            <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Jelajahi perjalanan kami dalam dunia professional melalui kegiatan magang penuh makna
            </p>

            {/* Photo Grid khusus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: photoCount }).map((_, index) => {
                const hasError = erroredImages.includes(index);
                return (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-xl transition-transform hover:scale-105"
                  >
                    <Image
                      src={hasError ? `https://picsum.photos/600/600?random=${index + 1}` : `/assets/m${index + 1}.jpeg`}
                      alt={`Magang experience ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleError(index)}
                      width={600}
                      height={600}
                    />
                  </div>
                );
              })}
            </div>

            {/* Show More Button */}
            <button 
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {showAllPhotos ? 'Sembunyikan' : 'Tampilkan Lainnya'}
            </button>
          </section>
        </main>
        {/* Footer */}
        <footer className="bg-black text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              {/* Text Section */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Selengkapnya tentang magang kominfo
                  </h3>
                  
                  {/* Video untuk mobile */}
                  <div className="md:hidden aspect-video rounded-lg mb-4 overflow-hidden">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/assets/magangbos.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300">
                    Kunjungi website &quot;SIMAKI&quot; untuk keterangan lebih lanjut
                  </p>
                  <a 
                    href="https://diskominfosemarangkota.my.id/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Kunjungi SIMAKI
                  </a>
                </div>
              </div>

              {/* Video untuk desktop */}
              <div className="hidden md:block flex-1">
                <div className="relative w-full max-w-[500px] h-[500px] rounded-lg overflow-hidden">
                  <video
                    className="absolute w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/assets/magangbos.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Diskominfo Semarang. All rights reserved</p>
            </div>
          </div>
        </footer>

        {/* Second Footer */}
        <footer className="bg-black text-white pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              {/* Team Members Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                {/* Programmer Web */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-300">Programmer Web</h4>
                  <ul className="space-y-1">
                    <li className="text-gray-400">Azmi Jalaludin</li>
                    <li className="text-gray-400">Tira Karel</li>
                  </ul>
                </div>

                {/* UI Design */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-300">UI Design</h4>
                  <ul className="space-y-1">
                    <li className="text-gray-400">Husain Fadhil</li>
                    <li className="text-gray-400">M. Arief Rizky</li>
                  </ul>
                </div>

                {/* Chatbot */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-300">Chatbot</h4>
                  <ul className="space-y-1">
                    <li className="text-gray-400">Galih Putra</li>
                    <li className="text-gray-400">M. Sholahuddin</li>
                  </ul>
                </div>
              </div>

              {/* UDINUS Logo */}
              <div className="flex items-center gap-2">
                <Image 
                  src="/assets/udinus.png" 
                  alt="UDINUS Logo" 
                  className="w-10 h-10 rounded-full object-contain"
                />
                <span className="text-xl font-bold text-white">UDINUS</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
