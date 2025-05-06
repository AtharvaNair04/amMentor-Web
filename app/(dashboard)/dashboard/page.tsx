'use client';

import Link from "next/link";
import { useAuth } from "@/app/context/authcontext";
import { CurrentTask, ReviewedTask, FeedbackProvided, UpcomingTask, 
    PlayerStats, PlayerProgress, Badges } from '@/app/(dashboard)/dashboard/dashborditems';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const DashboardPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const router = useRouter();
    const [selectedMentee, setSelectedMentee] = useState("Mentee 1");
    
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    const mentees = [];
    for(let i=0; i<5; i++){
        mentees.push(<option key={i}>Mentee {i+1}</option>);
    }
    
    const ismentor = userRole === 'Mentor';
    
    if (!isLoggedIn) {
        return null; 
    }

    if(ismentor){
        return (
            <div className="text-white p-4 md:p-2 lg:p-0">
                <div className="h-full w-full m-auto scrollbar-hide max-w-[80rem]">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex text-xl sm:text-2xl md:text-3xl gap-1 mb-4 sm:mb-0">
                            <h1>Welcome, </h1>
                            <h1 className="text-primary-yellow">Mentor</h1>
                        </div>
                        <select 
                            className="bg-deeper-grey rounded-lg text-primary-yellow px-3 py-2 sm:px-4 md:px-6 md:py-3 w-full sm:w-auto mb-6 sm:mb-0"
                            value={selectedMentee}
                            onChange={(e) => setSelectedMentee(e.target.value)}
                        >
                            {mentees}
                        </select>
                    </div>
                    <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                        <CurrentTask mentor={true} />
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                        <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                            <PlayerStats />
                            <Badges />
                            <PlayerProgress />
                        </div>
                        <div className="flex flex-col gap-4 w-full lg:w-[50%]">
                            <div className="flex flex-col sm:flex-row gap-5 justify-between">
                                <div className="w-full sm:w-1/2">
                                    <UpcomingTask />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <ReviewedTask />
                                </div>
                            </div>
                            <FeedbackProvided />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="text-white p-4 md:p-2 lg:p-0">
                <div className="h-full w-full m-auto py-4 md:py-7 scrollbar-hide max-w-[80rem]">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex text-xl sm:text-2xl md:text-3xl gap-1 mb-4 sm:mb-0">
                            <h1>Welcome, </h1>
                            <h1 className="text-primary-yellow">Mentee</h1>
                        </div>
                        <Link href="/track" className="text-primary-yellow underline mb-6 sm:mb-0">
                            Change Track
                        </Link>
                    </div>
                    <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                        <CurrentTask />
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                        <div className="flex flex-col gap-6 md:gap-12 w-full lg:w-[48%]">
                            <PlayerStats />
                            <ReviewedTask />
                        </div>
                        <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                            <UpcomingTask />
                            <Badges />
                        </div>
                    </div>
                </div>
            </div>
        );
    }    
};

export default DashboardPage;