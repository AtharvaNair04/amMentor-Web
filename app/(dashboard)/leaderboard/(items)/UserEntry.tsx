
export interface LeaderboardEntry {
    position: number;
    name: string;
    points: string;
  }
  


export default function UserEntry ({ position, name, points }: LeaderboardEntry){
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
