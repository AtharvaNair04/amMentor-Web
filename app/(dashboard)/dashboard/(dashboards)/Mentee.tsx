'use client';
import { ReviewedTask, UpcomingTask, FeedbackProvided } from "../(tasks)/ListViews";
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

interface SubmissionData {
    id: number;
    task_id: number;
    task_no: number;
    task_name: string;
    status: string;
    mentor_feedback?: string;
    feedback?: string;
    submitted_at?: string;
    reviewed_at?: string;
    approved_at?: string;
}

const normalizeStatus = (status: string): string => {
    if (!status) return 'Not Started';
    
    const statusMap: { [key: string]: string } = {
        'submitted': 'Submitted',
        'approved': 'Submitted', // Changed from 'Reviewed' to 'Submitted'
        'rejected': 'Submitted', // Changed from 'Reviewed' to 'Submitted'
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
    const [myFullSubmissions, setMyFullSubmissions] = useState<SubmissionData[]>([]);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    const getUserEmail = (): string | null => {
        return localStorage.getItem('email');
    };

    const isTaskUnlocked = useCallback((taskId: number): boolean => {
        // First task (task_no 0) is always unlocked
        if (taskId <= 0) return true;
        
        const previousTaskId = taskId - 1;
        const previousTask = tasks.find(task => task.task_no === previousTaskId);
        
        if (!previousTask) return false;
        
        if (previousTask.deadline === null) return true;
        
        const previousTaskStatus = mySubmissions[previousTaskId];
        return previousTaskStatus === 'Submitted'; // Remove 'Reviewed' since that's now 'Submitted'
    }, [tasks, mySubmissions]);

    const getCurrentTask = useCallback((): Task | null => {
        // Sort tasks by task_no to ensure proper order (lowest first)
        const sortedTasks = tasks.sort((a, b) => a.task_no - b.task_no);
        
        // Find the FIRST (lowest task_no) "Not Started" task that is unlocked
        for (const task of sortedTasks) {
            const status = mySubmissions[task.task_no] || 'Not Started';
            const unlocked = isTaskUnlocked(task.task_no);
            
            // If task is "Not Started" and unlocked, this is the current task
            if (status === 'Not Started' && unlocked) {
                return task;
            }
        }
        
        // If no "Not Started" unlocked tasks found, check for any non-submitted tasks
        for (const task of sortedTasks) {
            const status = mySubmissions[task.task_no] || 'Not Started';
            const unlocked = isTaskUnlocked(task.task_no);
            
            // If task is not submitted and unlocked, this could be current
            if (status !== 'Submitted' && unlocked) {
                return task;
            }
        }
        
        // If all tasks are submitted, return null (all tasks completed)
        return null;
    }, [tasks, mySubmissions, isTaskUnlocked]);

    const getFormattedTasks = (): string[][] => {
        return tasks.map((task) => {
            const status = mySubmissions[task.task_no] || 'Not Started';
            const unlocked = isTaskUnlocked(task.task_no);
            
            let displayStatus = status;
            if (!unlocked) {
                displayStatus = `🔒 ${status}`;
            }
            
            return [task.task_no.toString(), task.title, displayStatus];
        });
    };

    const getUpcomingTasks = (): string[][] => {
        const formattedTasks = getFormattedTasks();
        return formattedTasks.filter(task => {
            const status = task[2];
            // Show tasks that are:
            // 1. Locked (🔒)
            // 2. Not Started (unlocked but not current)
            // 3. In Progress
            // Exclude Submitted tasks
            return status.includes('🔒') || 
                   status === 'Not Started' || 
                   status === 'In Progress' ||
                   status === 'Paused';
        });
    };
    
    const getSubmittedTasks = (): string[][] => {
        const formattedTasks = getFormattedTasks();
        // Filter for tasks with "Submitted" status (includes approved/rejected)
        return formattedTasks.filter(task => task[2] === 'Submitted');
    };

    const fetchMySubmissions = useCallback(async (tasksList: Task[], trackId: number) => {
        const userEmail = getUserEmail();
        if (!userEmail) return;
        
        const results: Record<number, string> = {};
        let allSubmissions: SubmissionData[] = [];
        
        try {
            const res = await fetch(`https://praveshan.ganidande.com/submissions/?email=${encodeURIComponent(userEmail)}&track_id=${trackId}`);
            
            if (res.ok) {
                const submissions: SubmissionData[] = await res.json();
                allSubmissions = submissions;
                
                for (const task of tasksList) {
                    const taskSubmission = submissions.find((s: SubmissionData) => s.task_no === task.task_no);
                    
                    if (taskSubmission) {
                        const rawStatus = taskSubmission.status;
                        const normalizedStatus = normalizeStatus(rawStatus);
                        results[task.task_no] = normalizedStatus;
                    } else {
                        results[task.task_no] = 'Not Started';
                    }
                }
            } else {
                for (const task of tasksList) {
                    results[task.task_no] = 'Not Started';
                }
            }
        } catch (error) {
            console.error(`Error fetching submissions:`, error);
            for (const task of tasksList) {
                results[task.task_no] = 'Not Started';
            }
        }
        
        setMySubmissions(results);
        setMyFullSubmissions(allSubmissions);
    }, []);

    useEffect(() => {
        const fetchMenteeDetails = async () => {
             try {
                const currentTrack = sessionStorage.getItem("currentTrack");
                const track: { id: number; name: string } = currentTrack ? JSON.parse(currentTrack) : { id: 0, name: "" };
        
                const data = await fetch(`https://praveshan.ganidande.com/leaderboard/${track.id}`);
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
                
                const response = await fetch(`https://praveshan.ganidande.com/tracks/${trackId}/tasks`);
                
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
                        <h1 className="text-primary-yellow">Padawan</h1>
                    </div>
                </div>
                <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                    <CurrentTask 
                        isLoading={loading}
                        task={currentTask}
                        status={currentTask ? mySubmissions[currentTask.task_no] : undefined}
                    />
                </div>
                <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                    <div className="flex flex-col gap-6 md:gap-[77px] w-full lg:w-[48%]">
                        <PlayerStats rank={menteeDetails.position} points={menteeDetails.total_points} />
                        <ReviewedTask isLoading={loading} reviewed_tasks={getSubmittedTasks()}  />
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                        <UpcomingTask isLoading={loading} upcoming_tasks={getUpcomingTasks()} />
                        <FeedbackProvided 
                            selectedMentee={localStorage.getItem('name') || ''}
                            menteeSubmissions={{ [localStorage.getItem('name') || '']: myFullSubmissions }}
                            tasks={tasks}
                        />
                        {/* <Badges /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;