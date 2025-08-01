'use client';

import Link from "next/link";
import { ReviewedTask, UpcomingTask } from "../(tasks)/ListViews";
import CurrentTask from "../(tasks)/CurrentTask";
import PlayerStats from "../(user)/PlayerStats";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

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
    position: number;
    mentee_name: string;
    total_points: number;
}

interface Submission {
    task_id: number;
    status: string;
}

const normalizeStatus = (status: string): string => {
    if (!status) return 'Not Started';
    
    const statusMap: { [key: string]: string } = {
        'submitted': 'Submitted',
        'approved': 'Reviewed',
        'rejected': 'Reviewed',
        'paused': 'Paused',
        'in progress': 'In Progress',
        'not started': 'Not Started'
    };
    
    const normalizedKey = status.toLowerCase();
    return statusMap[normalizedKey] || status;
};

const MenteeDashboard = () => {
    const router = useRouter();
    const [menteeDetails, setMenteeDetails] = useState<MenteeDetails>({
        position: 0,
        mentee_name: "temp",
        total_points: 0,
    });

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [mySubmissions, setMySubmissions] = useState<Record<number, string>>({});
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    const getUserEmail = (): string | null => {
        return localStorage.getItem('email');
    };

    const isTaskUnlocked = useCallback((taskId: number): boolean => {
        if (taskId <= 1) return true;
        
        const previousTaskId = taskId - 1;
        const previousTask = tasks.find(task => task.id === previousTaskId);
        
        if (!previousTask) return false;
        
        if (previousTask.deadline === null) return true;
        
        const previousTaskStatus = mySubmissions[previousTaskId];
        return previousTaskStatus === 'Submitted' || previousTaskStatus === 'Reviewed';
    }, [tasks, mySubmissions]);

    const getCurrentTask = useCallback((): Task | null => {
        // Find the latest unlocked task that is not reviewed
        const unlockedTasks = tasks.filter(task => isTaskUnlocked(task.id));
        const currentTasks = unlockedTasks.filter(task => {
            const status = mySubmissions[task.id] || 'Not Started';
            return status !== 'Reviewed';
        });
        
        // Return the latest (highest ID) current task
        return currentTasks.length > 0 ? currentTasks[currentTasks.length - 1] : null;
    }, [tasks, mySubmissions, isTaskUnlocked]);

    const getFormattedTasks = (): string[][] => {
        return tasks.map((task) => {
            const status = mySubmissions[task.id] || 'Not Started';
            const unlocked = isTaskUnlocked(task.id);
            
            let displayStatus = status;
            if (!unlocked) {
                displayStatus = `🔒 ${status}`;
            }
            
            return [task.id.toString(), task.title, displayStatus];
        });
    };

    const getUpcomingTasks = (): string[][] => {
        const formattedTasks = getFormattedTasks();
        return formattedTasks.filter(task => {
            const status = task[2];
            // Show locked tasks and not started unlocked tasks
            return status.includes('🔒') || status === 'Not Started';
        });
    };
    
    const getReviewedTasks = (): string[][] => {
        const formattedTasks = getFormattedTasks();
        return formattedTasks.filter(task => task[2] === 'Reviewed');
    };

    const fetchMySubmissions = useCallback(async (tasksList: Task[], trackId: number) => {
        const userEmail = getUserEmail();
        if (!userEmail) return;
        
        const results: Record<number, string> = {};
        for (const task of tasksList) {
            try {
                const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(userEmail)}&track_id=${trackId}`);
                
                if (res.ok) {
                    const submissions: Submission[] = await res.json();
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    
                    if (taskSubmission) {
                        const rawStatus = taskSubmission.status;
                        const normalizedStatus = normalizeStatus(rawStatus);
                        results[task.id] = normalizedStatus;
                    } else {
                        results[task.id] = 'Not Started';
                    }
                } else {
                    results[task.id] = 'Not Started';
                }
            } catch (error) {
                console.error(`Error fetching submission for task ${task.id}:`, error);
                results[task.id] = 'Not Started';
            }
        }
        setMySubmissions(results);
    }, []);

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

                const currentUserName = localStorage.getItem("name");
                const currentUserIndex = leaderboard.findIndex(
                  (element) => element.mentee_name === currentUserName
                );
                if (currentUserIndex !== -1) {
                    setMenteeDetails({
                        ...leaderboard[currentUserIndex],
                        position: currentUserIndex + 1
                    });
                } else {
                    setMenteeDetails(prev => ({
                        ...prev,
                    position: 0 
                    }));
                }
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
                
                await fetchMySubmissions(tasksData, trackId);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                router.push('/track');
            }
        };
        setLoading(true);
        fetchMenteeDetails();
        fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    // Update current task when submissions change
    useEffect(() => {
        if (tasks.length > 0 && Object.keys(mySubmissions).length > 0) {
            const current = getCurrentTask();
            setCurrentTask(current);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, mySubmissions]);

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
                    <CurrentTask 
                        isLoading={true}
                        task={currentTask}
                        status={currentTask ? mySubmissions[currentTask.id] : undefined}
                    />
                </div>
                <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                    <div className="flex flex-col gap-6 md:gap-12 w-full lg:w-[48%]">
                        <PlayerStats rank={menteeDetails.position} points={menteeDetails.total_points} />
                        <ReviewedTask isLoading={loading} reviewed_tasks={getReviewedTasks()}  />
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                        <UpcomingTask isLoading={loading} upcoming_tasks={getUpcomingTasks()} />
                        {/* <Badges /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;