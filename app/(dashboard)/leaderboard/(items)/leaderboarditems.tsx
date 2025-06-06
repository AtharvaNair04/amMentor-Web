import React from 'react';
import UserEntry from './UserEntry';
export interface LeaderboardEntry {
  position: number;
  name: string;
  points: string;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  }

export const Leaderboard: React.FC<LeaderboardProps> = ({ title, entries }) => {
  return (
    <div className="bg-dark-bg rounded-lg p-6 text-white-text w-full">
      <div className="flex justify-between  mb-6">
        <h2 className="text-xl font-medium">{title}</h2>
        <button className="bg-primary-yellow text-dark-bg px-4 py-1 rounded-full text-sm font-medium">
          Filter
        </button>
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
          <UserEntry
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