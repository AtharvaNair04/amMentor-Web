'use client';

import React from 'react';
import Image from 'next/image';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1E1E1E] text-white px-6 py-10 min-h-screen font-Inter flex flex-col items-center pt-20 relative">
      <Image 
        src="/Logos/amMentor.png" 
        alt="logo"
        fill
        className="object-contain opacity-10"
        style={{ 
          zIndex: 0,
          maxWidth: '90%', 
          minWidth: '300px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        priority
      />
      <div className="relative z-10 p-12 flex flex-col items-center">
        <div className="text-white text-4xl font-bold mb-8">
          amMENT<span className="text-yellow-400">&lt;&gt;</span>R
        </div>

        <div className="bg-[#2F2F2F] opacity-95 rounded-3xl p-6 w-fit">
          {children}
        </div>
      </div>
    </div>
  );
}