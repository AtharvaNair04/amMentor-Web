'use client';

import React, { useState } from 'react';
import { Brain, Code, Smartphone, Monitor, Award } from 'lucide-react';

export default function TrackSelectionPage() {
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  
  const tracks = [
    { id: 'ai', name: 'AI', icon: Brain },
    { id: 'web', name: 'Web Development', icon: Code },
    { id: 'mobile', name: 'Mobile Development', icon: Smartphone },
    { id: 'systems', name: 'Systems', icon: Monitor },
    { id: 'vidyaratna', name: 'Vidyaratna', icon: Award },
  ];

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-semibold text-white mb-5">Select a Track</h1>
      
      <div className="w-full space-y-4">
        {tracks.map((track) => {
          const IconComponent = track.icon;
          return (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(track.id)}
              className={`flex justify-start items-center w-full pl-5 px-24 py-2 rounded-3xl shadow-lg transition-colors duration-200 ${
                selectedTrack === track.id 
                  ? 'bg-[#464646] text-yellow-400' 
                  : 'bg-[#464646] text-yellow-400 hover:bg-yellow-400 hover:text-black'
              }`}
            >
              <span className="flex justify-center items-center min-w-8 mr-4">
                <IconComponent size={26} className="transition-colors duration-200"/>
              </span>
              <span className="font-medium">{track.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}