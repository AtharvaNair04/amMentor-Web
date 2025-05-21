import React from 'react';

export interface LeaderboardEntry {
  position: number;
  name: string;
  points: string;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
}
  export async function fetchPlayerdata(trackid: number) {
    const data = await fetch("https://ammentor.up.railway.app/leaderboard/" + trackid);
    const response = await data.json();
    const players: LeaderboardEntry[] = response["leaderboard"].map((element: { name: string; total_points: number }, index: number) => ({
      position: index + 1,
      name: element.name,
      points: element.total_points,
    }));
    return players;
  }

  export async function fetchtrack() {
    const data = await fetch("https://ammentor.up.railway.app/tracks/");    
    const response: { id: number; title: string }[] = await data.json();
    const tracks: { id: number; name: string }[] = response.map((element) => ({
      id: element.id,
      name: element.title,
    }));
    return tracks;
  }


const LeaderboardItem = ({ position, name, points }: LeaderboardEntry) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-deep-grey">
      <div className="flex items-center">
        <span className="w-8 text-center text-muted-grey">{position}</span>
        <div className="ml-2">
          <div className="w-8 h-8 rounded-full bg-dark-grey flex items-center justify-center">
            <svg className="w-4 h-4 text-grey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </div>
        <span className="ml-2 text-white-text">{name}</span>
      </div>
      <div className="text-white-text">{points}</div>
    </div>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ title, entries }) => {
  return (
    <div className="bg-dark-bg rounded-lg p-6 text-white-text w-full">
      <div className="flex justify-between  mb-6">
        <h2 className="text-xl font-medium">{title}</h2>
        
        <button className="bg-primary-yellow text-dark-bg px-4 py-1 rounded-full text-sm font-medium">
          Filter
        </button>
      </div>
      
      <div className="flex justify-center items-end mb-12">
        <div className="flex flex-col items-center mx-4 w-24">
          <div className="bg-grey w-full h-24 flex items-center justify-center text-black text-2xl font-bold rounded-t-md">
            2
          </div>
        </div>
        <div className="flex flex-col items-center mx-4 w-24">
          <div className="bg-primary-yellow w-full h-36 flex items-center justify-center text-black text-2xl font-bold rounded-t-md">
            1
          </div>
        </div>
        <div className="flex flex-col items-center mx-4 w-24">
          <div className="bg-dark-red w-full h-16 flex items-center justify-center text-white-text text-2xl font-bold rounded-t-md">
            3
          </div>
        </div>
      </div>
      
      <div className=" border-deep-grey pt-4">
        <div className="flex justify-between items-center py-2 px-2 text-grey">
          <div className="flex items-center">
            <span className="w-8 text-center">Rank</span>
            <span className="ml-10">Name</span>
          </div>
          <span>Points</span>
        </div>
        
        {entries.map((entry) => (
          <LeaderboardItem 
            key={entry.position}
            position={entry.position}
            name={entry.name}
            points={entry.points}
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;