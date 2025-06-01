'use client';

import { LeaderboardEntry ,fetchPlayerdata, fetchtrack} from './leaderboarditems';
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';



const LeaderBoardPage = () => {

  const [trackid,changetrack] = useState(1);
  const [leaderboardData,updateleaderboard] = useState<LeaderboardEntry[]>([]);


  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [tracks,set_tracks] = useState<{id:number, name:string}[]>([]);
  const options: JSX.Element[] = [];
  const selectedtrack = "Vidyaratna"

  tracks.map((element)=>{
    if(element.name === selectedtrack){
      options.push(<option key={element.id} value={element.id}  className="bg-deep-grey  text-white">{element.name}</option>);
      return;
    }
    options.push(<option key={element.id} value={element.id}  className="bg-deep-grey text-white">{element.name}</option>);
  });

  console.log(leaderboardData);
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
    console.log(trackid);
    async function fetchAndUpdateLeaderboard() {
      const data = await fetchPlayerdata(trackid);
      updateleaderboard(data);
    }
    fetchAndUpdateLeaderboard();
    
  }, [isLoggedIn, router,trackid]);


  useEffect(()=>{
    async function fetchAndUpdateLeaderboard() {
      const data = await fetchtrack();
      set_tracks(data)
    }
    fetchAndUpdateLeaderboard();
  },[])

  if (!isLoggedIn) {
    return null; 
  }
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
                <select defaultValue={1} onChange={(event)=>{changetrack(parseInt(event.target.value))}} className="bg-primary-yellow p-2 px-7  rounded-xl active:rounded-b-none">
                  {options}
                </select>
            </div>
          </div>
          <div className="flex justify-center items-end mb-12">
            <div className="flex flex-col items-center mx-4 w-36">
              <div className="bg-gray-400 w-full h-40 flex items-center justify-center text-black text-2xl font-bold rounded-t-md">
                2
              </div>
            </div>
            <div className="flex flex-col items-center mx-4 w-36">
              <div className="bg-yellow-400 w-full h-56 flex items-center justify-center text-black text-2xl font-bold rounded-t-md">
                1
              </div>
            </div>
            <div className="flex flex-col items-center mx-4 w-36">
              <div className="bg-amber-700 w-full h-32 flex items-center justify-center text-white text-2xl font-bold rounded-t-md">
                3
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="border-t border-white mb-4"></div>

            <div className="flex justify-between items-center py-2 text-white text-xl font-extrabold px-16">
              <div className="w-1/6 text-left">Rank</div>
              <div className="w-3/6 text-left">Name</div>
              <div className="w-2/6 text-right">Points</div>
            </div>

            {leaderboardData.map((entry) => (
              <div key={entry.position} className="flex justify-between items-center py-3 text-white font-semibold px-16 text-xl">
                <div className="w-1/6 text-left">{entry.position}</div>
                <div className="w-3/6 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600 bg-opacity-20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  {entry.name}
                </div>
                <div className="w-2/6 text-right">{entry.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoardPage;