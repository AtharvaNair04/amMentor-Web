'use client';

import { ReviewedTask, FeedbackProvided, UpcomingTask } from "../(tasks)/ListViews";
import CurrentTask from "../(tasks)/CurrentTask";
import Badges from "../(user)/Badges";
import PlayerProgress from "../(user)/PlayerProgress";
import PlayerStats from "../(user)/PlayerStats";
import { JSX, useEffect, useMemo, useState } from 'react';

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: string;
    id: number;
}

interface Mentees {
    mentor_email: string;
    mentees: { name: string, email: string }[]
}

interface MenteeDetails {
    tasks_completed: number;
    mentee_name: string;
    total_points: number;
}

const MentorDashboard = () => {
    const [selectedMentee, setSelectedMentee] = useState("Mentee 1");
    const [menteeDetails, setMenteeDetails] = useState<MenteeDetails>({
        mentee_name: "temp",
        total_points: 0,
        tasks_completed: 0 
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totaltask, settotaltask] = useState(0);
    const mentees = useMemo<JSX.Element[]>(() => [], []);

    const getDummyStatus = (taskId: number): string => {
        const statuses = ["Reviewed(4)", "Submitted(2)", "In Progress(3)", "Not Started(4)"];
        return statuses[taskId % statuses.length];
    };

    const getFormattedTasks = (): string[][] => {
        return tasks.map((task, index) => [
            task.id.toString(),
            task.title,
            getDummyStatus(index)
        ]);
    };

    const getUpcomingMentorTasks = (): string[][] => 
        getFormattedTasks().filter(task => task[2].includes("Not Started"));
    
    const getReviewedMentorTasks = (): string[][] => 
        getFormattedTasks().filter(task => task[2].includes("Reviewed"));

    useEffect(() => {
        const fetchMentees = async () => {
            try {
                const data = await fetch(`https://amapi.amfoss.in/mentors/${localStorage.getItem("email")}/mentees`);
                if (!data.ok) {
                    throw new Error("Failed to fetch Mentees!");
                }
                const response: Mentees = await data.json();
                mentees.splice(0, mentees.length);
                response.mentees.map((element, index) => {
                    mentees.push(<option key={index}>{element.name}</option>);
                });
            } catch (error) {
                console.error('Error fetching mentees:', error);
            }
        };

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
                    if (element.mentee_name === selectedMentee) {
                        setMenteeDetails(element);
                    }
                });
            } catch (error) {
                console.error('Error fetching mentee details:', error);
            }
        };

        const fetchTasks = async () => {
            try {
                const trackId = 1; // Mentors use track 1
                
                const response = await fetch(`https://amapi.amfoss.in/tracks/${trackId}/tasks`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                
                const tasksData: Task[] = await response.json();
                setTasks(tasksData);
                settotaltask(tasksData.length);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchMentees();
        fetchMenteeDetails();
        fetchTasks();
    }, [mentees, selectedMentee]);

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
                        <PlayerStats rank={menteeDetails.tasks_completed} points={menteeDetails.total_points} />
                        <Badges />
                        <PlayerProgress tasks={menteeDetails.tasks_completed} totaltasks={totaltask} />
                    </div>
                    <div className="flex flex-col gap-4 w-full lg:w-[50%]">
                        <div className="flex flex-col sm:flex-row gap-5 justify-between">
                            <div className="w-full sm:w-1/2">
                                <UpcomingTask upcoming_tasks={getUpcomingMentorTasks()} />
                            </div>
                            <div className="w-full sm:w-1/2">
                                <ReviewedTask reviewed_tasks={getReviewedMentorTasks()} />
                            </div>
                        </div>
                        <FeedbackProvided />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;