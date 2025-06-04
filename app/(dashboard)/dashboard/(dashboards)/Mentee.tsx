'use client';

import Link from "next/link";
import { ReviewedTask, UpcomingTask } from "../(tasks)/ListViews";
import CurrentTask from "../(tasks)/CurrentTask";
import Badges from "../(user)/Badges";
import PlayerStats from "../(user)/PlayerStats";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: string;
    id: number;
}

interface MenteeDetails {
    tasks_completed: number;
    mentee_name: string;
    total_points: number;
}

const MenteeDashboard = () => {
    const router = useRouter();
    const [menteeDetails, setMenteeDetails] = useState<MenteeDetails>({
        mentee_name: "temp",
        total_points: 0,
        tasks_completed: 0 
    });
    const [tasks, setTasks] = useState<Task[]>([]);

    const getDummyStatus = (taskId: number): string => {
        const statuses = ["Reviewed", "Submitted", "In Progress", "Not Started"];
        return statuses[taskId % statuses.length];
    };

    const getFormattedTasks = (): string[][] => {
        return tasks.map((task, index) => [
            task.id.toString(),
            task.title,
            getDummyStatus(index)
        ]);
    };

    const getUpcomingTasks = (): string[][] => 
        getFormattedTasks().filter(task => task[2] === "Not Started");
    
    const getReviewedTasks = (): string[][] => 
        getFormattedTasks().filter(task => task[2] === "Reviewed");

    useEffect(() => {
        const fetchMenteeDetails = async () => {
            try {
                const currentTrack = sessionStorage.getItem("currentTrack");
                const track: { id: number; name: string } = currentTrack ? JSON.parse(currentTrack) : { id: 0, name: "" };
                
                const data = await fetch(`https://amapi.amfoss.in/leaderboard/${track.id}`);
                if (!data.ok) {
                    throw new Error("Failed to fetch Points and Rank!");
                }
                const response = await data.json();
                const leaderboard: MenteeDetails[] = response['leaderboard'];
                
                leaderboard.forEach((element) => {
                    if (element.mentee_name === localStorage.getItem("name")) {
                        setMenteeDetails(element);
                    }
                });
            } catch (error) {
                console.error('Error fetching mentee details:', error);
            }
        };

        const fetchTasks = async () => {
            try {
                const sessionTrack = sessionStorage.getItem('currentTrack');
                
                if (!sessionTrack) {
                    router.push('/track');
                    return;
                }
                
                const trackData = JSON.parse(sessionTrack);
                const trackId = trackData.id;
                
                const response = await fetch(`https://amapi.amfoss.in/tracks/${trackId}/tasks`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                
                const tasksData: Task[] = await response.json();
                setTasks(tasksData);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                router.push('/track');
            }
        };

        fetchMenteeDetails();
        fetchTasks();
    }, [router]);

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
                        <PlayerStats rank={menteeDetails.tasks_completed} points={menteeDetails.total_points} />
                        <ReviewedTask reviewed_tasks={getReviewedTasks()} />
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                        <UpcomingTask upcoming_tasks={getUpcomingTasks()} />
                        <Badges />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;