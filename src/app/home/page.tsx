'use client';

import { useEffect, useRef, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
// import Link from 'next/link'; // next/link tidak diperlukan lagi karena diganti dengan tag <a>

interface ChatPopupProps {
  onClose: () => void;
}

const ChatPopup = ({ onClose }: ChatPopupProps) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo! Ada yang bisa kami bantu?", sender: "bot" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fungsi untuk mendeteksi URL dan mengubahnya menjadi tautan
  const renderMessageWithLinks = (text: string) => {
    // Regex untuk mendeteksi URL (termasuk http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank" // Membuka tautan di tab baru
            rel="noopener noreferrer" // Praktik keamanan yang baik
            className="text-blue-600 hover:underline" // Gaya untuk tautan
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const userMessage = newMessage.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        sender: "user",
      },
    ]);
    setNewMessage("");

    try {
      const response = await fetch("https://iot.akuriizky.com:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.response,
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Maaf, terjadi kesalahan saat mengirim pesan.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-24 right-6 w-100 bg-white rounded-t-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Chat header */}
      <div className="bg-red-800 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Diskominfo Chat</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex items-end ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "bot" && (
              <span className="mr-2 text-xl">🤖</span>
            )}
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-red-100 text-gray-800 rounded-tr-none"
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              {/* Gunakan fungsi renderMessageWithLinks di sini */}
              {renderMessageWithLinks(message.text)}
            </div>
            {message.sender === "user" && (
              <span className="ml-2 text-xl">🙂</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-black"
          />
          <button
            onClick={handleSendMessage}
            className="bg-red-800 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-red-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors z-40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
};

const Home = () => {
  const institutions = [
    'udinus.png',
    'undip.png',
    'unissula.png',
    'univsemarang.jpg',
    'unnes.png',
  ];

  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const [erroredExperienceImages, setErroredExperienceImages] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
        // Reset scroll position if it exceeds half of the duplicated content
        if (scrollPos >= scrollContent.scrollWidth / 2) {
          scrollPos = 0;
        }
        scrollContainer.scrollLeft = scrollPos;
        requestAnimationFrame(scroll);
      };

      const animationFrameId = requestAnimationFrame(scroll); // Simpan ID untuk cleanup

      return () => {
        document.head.removeChild(link);
        cancelAnimationFrame(animationFrameId); // Hentikan animasi saat komponen unmount
      };
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const photoCount = showAllPhotos ? 9 : 6;

  const handleExperienceImageError = (index: number) => {
    setErroredExperienceImages(prev => [...prev, index]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-poppins">
      <video
        autoPlay
        muted
        loop
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/assets/bg.mp4" type="video/mp4" />
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
                alt="Logo Udinus"
                className="w-8 h-8 rounded-full object-contain"
                width={32}
                height={32}
              />
              <span className="text-gray-900 font-bold text-xl">UDINUS</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {['Home', 'Kontribusi', 'Galeri', 'Daftar Magang'].map((item, i) => (
                // Menggunakan tag <a> dan mengarahkan ke ID yang sesuai
                <a
                  key={i}
                  href={
                    item === 'Home'
                      ? '/'
                      : item === 'Kontribusi'
                      ? '#kontribusi-section'
                      : item === 'Galeri'
                      ? '#galeri-section'
                      : item === 'Daftar Magang'
                      ? 'https://diskominfosemarangkota.my.id/login/daftar.php'
                      : '#'
                  }
                  target={item === 'Daftar Magang' ? '_blank' : '_self'}
                  className={`text-sm font-medium transition-colors ${
                    item === 'Daftar Magang'
                      ? 'text-red-800 hover:text-red-700'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  {item}
                </a>
              ))}
              {/* Menggunakan tag <a> untuk link Login */}
              <a
                href="/login"
                className="bg-red-800 text-white px-4 py-1 rounded-full border border-red-800 hover:bg-red-700 transition-colors"
              >
                Login
              </a>
            </div>
            <Image
              src="/assets/diskominfo.jpg"
              alt="Logo Diskominfo"
              className="w-30 h-12 object-contain"
              width={120} // Approximate width based on w-30
              height={48} // Approximate height based on h-12
            />
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12" data-aos="fade-down" data-aos-duration="800">
            <Image
              src="/assets/Belajar_Kominfo.png"
              alt="Pemerintah Kota Semarang"
              className="w-full max-w-4xl mx-auto rounded-lg border-4 border-white shadow-lg mb-6"
              width={1000} // Example width, adjust as needed
              height={500} // Example height, adjust as needed
              priority // Prioritas tinggi untuk gambar utama
            />
            <div className="space-y-2">
              <h1 className="text-3xl md:text-2xl font-bold text-gray-900">Tempat terbaik untuk tumbuh</h1>
              <p className="text-lg md:text-sm text-gray-600">Pengalaman Magang yang membentuk masa depan</p>
            </div>
            <hr className="w-24 h-0.5 bg-gray-300 mx-auto my-8" />
          </section>

          {/* Photo Grid - Ini adalah bagian Galeri */}
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
                  width={600} // Example width
                  height={400} // Example height
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Mencegah loop error tak terbatas
                    e.currentTarget.src = `https://picsum.photos/600/400?random=${num}`;
                  }}
                />
              </div>
            ))}
          </div>

          {/* Institutions Carousel - Ini adalah bagian Kontribusi */}
          {/* Tambahkan ID untuk bagian Kontribusi */}
          <section id="kontribusi-section" className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mt-12" data-aos="fade-up">
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
                      width={120} // Example width for institution logos
                      height={56} // Example height for institution logos (based on h-14)
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
            {/* Tambahkan ID untuk bagian Galeri */}
            <div id="galeri-section" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: photoCount }).map((_, index) => {
                const hasError = erroredExperienceImages.includes(index);
                return (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-xl transition-transform hover:scale-105"
                  >
                    <Image
                      src={hasError ? `https://picsum.photos/600/600?random=${index + 1}` : `/assets/m${index + 1}.jpeg`}
                      alt={`Magang experience ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleExperienceImageError(index)}
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

        {/* Second Footer (Team Members) */}
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
                  width={40}
                  height={40}
                />
                <span className="text-xl font-bold text-white">UDINUS</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Tambahkan ChatButton di sini */}
      <ChatButton onClick={() => setIsChatOpen(true)} />

      {/* Render ChatPopup secara kondisional */}
      {isChatOpen && <ChatPopup onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;
