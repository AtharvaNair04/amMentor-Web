'use client';

import { LeaderboardEntry } from './(items)/leaderboarditems';
import { fetchPlayerdata, fetchtrack } from './(api)/ApiCalls';
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import TopEntry from './(items)/TopEntries';

interface Track {
  id: number;
  name: string;
}

const LeaderBoardPage = () => {
  const [trackId, setTrackId] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const generateTrackOptions = (): JSX.Element[] => {
    return tracks.map((track) => (
      <option 
        key={track.id} 
        value={track.id}  
        className="bg-deep-grey text-white"
      >
        {track.name}
      </option>
    ));
  };

  const fetchLeaderboardData = async (currentTrackId: number) => {
    const data = await fetchPlayerdata(currentTrackId);
    setLeaderboardData(data);
  };

  const fetchTracksData = async () => {
    const data = await fetchtrack();
    setTracks(data);
  };

  const handleTrackChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTrackId(parseInt(event.target.value));
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
      return;
    }
    
    fetchLeaderboardData(trackId);
  }, [isLoggedIn, router, trackId]);

  useEffect(() => {
    fetchTracksData();
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  const renderLeaderboardEntry = (entry: LeaderboardEntry) => (
    <div 
      key={entry.position} 
      className="flex justify-between items-center py-3 text-white font-semibold px-16 text-xl"
    >
      <div className="w-1/6 text-left">{entry.position}</div>
      <div className="w-3/6 flex items-center">
        <div className="w-8 h-8 rounded-full bg-purple-600 bg-opacity-20 flex items-center justify-center mr-3">
          <svg 
            className="w-5 h-5 text-purple-300" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        {entry.name}
      </div>
      <div className="w-2/6 text-right">{entry.points}</div>
    </div>
  );

  return (
    <div className="max-h-screen">
      <div className="rounded-lg max-w-[90rem] mx-auto">
        <div className="bg-container-grey bg-opacity-50 rounded-3xl p-6 min-h-[800px] w-full">
          <div className="mb-6 px-10 py-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-[70%]">
                <h2 className="text-2xl font-bold text-white-text">Task Leaderboard</h2>
                <div className="border-t border-white mb-4"></div>
              </div>
              
              <select 
                defaultValue={1} 
                onChange={handleTrackChange}
                className="bg-primary-yellow p-2 px-7 rounded-xl active:rounded-b-none"
              >
                {generateTrackOptions()}
              </select>
            </div>
          </div>
          {leaderboardData.length > 0 && (
            <TopEntry Data={leaderboardData} />
          )}
          
          <div className="mt-8">
            <div className="border-t border-white mb-4"></div>
            <div className="flex justify-between items-center py-2 text-white text-xl font-extrabold px-16">
              <div className="w-1/6 text-left">Rank</div>
              <div className="w-3/6 text-left">Name</div>
              <div className="w-2/6 text-right">Points</div>
            </div>
            
            {leaderboardData.map(renderLeaderboardEntry)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoardPage;