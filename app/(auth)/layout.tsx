'use client';

import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1E1E1E] text-white px-6 py-10 min-h-screen font-Inter flex flex-col items-center pt-20 relative">
      <img 
      src="/amMentor.png" 
      alt="logo"
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-full sm:w-3/2 md:w-3/5 lg:w-2/5" 
      style={{ zIndex: 0, maxWidth: '90%', minWidth: '300px' }}
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


