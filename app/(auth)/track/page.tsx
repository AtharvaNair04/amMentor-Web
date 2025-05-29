'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Code, Smartphone, Monitor, Award, HelpCircle } from 'lucide-react';

export default function TrackSelectionPage() {
  const [selectedTrack, setSelectedTrack] = useState<number>(-1);
  const [tracks, updatetracks] = useState<{ id: number; name: string; icon: React.ElementType }[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchdata() {
      const icons_set = {1:Brain,2:Code,3:Smartphone,4:Monitor,5:Award};
      const data = await fetch("https://ammentor.ganidande.com/tracks/");    
      const response: { id: number; title: string }[] = await data.json();

      const updatedTracks = response.map((element) => ({
        id: element.id,
        name: element.title,
        icon: icons_set[element.id as keyof typeof icons_set] || HelpCircle, // fallback icon
      }));
      updatetracks(updatedTracks);
    }
    fetchdata();
  }, []);

  const handleTrackSelect = (trackId: number) => {
    setSelectedTrack(trackId);
    router.push(`/dashboard?track=${trackId}`);
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
              className={`flex justify-start items-center  w-full pl-5 px-24 py-2 rounded-3xl shadow-lg transition-colors duration-200 ${
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