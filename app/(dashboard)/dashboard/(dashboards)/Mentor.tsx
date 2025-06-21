'use client';

import { ReviewedTask, FeedbackProvided, UpcomingTask } from "../(tasks)/ListViews";
import CurrentTask from "../(tasks)/CurrentTask";
import Badges from "../(user)/Badges";
import PlayerProgress from "../(user)/PlayerProgress";
import PlayerStats from "../(user)/PlayerStats";
import { JSX, useEffect, useMemo, useState, useCallback } from 'react';

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

interface Submission {
    task_id: number;
    status: string;
}

interface Mentee {
    name: string;
    email: string;
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

const MentorDashboard = () => {
    const [selectedMentee, setSelectedMentee] = useState("Mentee 1");
    const [menteeDetails, setMenteeDetails] = useState<MenteeDetails>({
        mentee_name: "temp",
        total_points: 0,
        tasks_completed: 0 
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totaltask, settotaltask] = useState(0);
    const [menteeSubmissions, setMenteeSubmissions] = useState<Record<string, Record<number, string>>>({});
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const menteeOptions = useMemo<JSX.Element[]>(() => [], []);

    // Calculate submitted tasks count for a mentee
    const getSubmittedTasksCount = useCallback((menteeName: string): number => {
        if (!menteeSubmissions[menteeName]) return 0;
        
        const submissions = menteeSubmissions[menteeName];
        return Object.values(submissions).filter(status => 
            status === 'Submitted' || status === 'Reviewed'
        ).length;
    }, [menteeSubmissions]);

    const getCurrentTaskForMentee = useCallback((menteeName: string): Task | null => {
        if (!tasks.length || !menteeSubmissions[menteeName]) return null;
        
        // Find submitted tasks for this mentee
        const submittedTasks = tasks.filter(task => {
            const status = menteeSubmissions[menteeName][task.id];
            return status === 'Submitted';
        });
        
        // Return the earliest (lowest ID) submitted task
        return submittedTasks.length > 0 ? submittedTasks[0] : null;
    }, [tasks, menteeSubmissions]);

    const getFormattedTasksForMentee = (menteeName: string): string[][] => {
        if (!menteeSubmissions[menteeName]) return [];
        
        return tasks.map((task) => {
            const status = menteeSubmissions[menteeName][task.id] || 'Not Started';
            return [task.id.toString(), task.title, status];
        });
    };

    const getUpcomingMentorTasks = (): string[][] => {
        if (!selectedMentee || selectedMentee === "Mentee 1") return [];
        
        const formattedTasks = getFormattedTasksForMentee(selectedMentee);
        return formattedTasks.filter(task => {
            const status = task[2];
            return status === 'Not Started' || status === 'In Progress' || status === 'Paused';
        });
    };
    
    const getReviewedMentorTasks = (): string[][] => {
        if (!selectedMentee || selectedMentee === "Mentee 1") return [];
        
        const formattedTasks = getFormattedTasksForMentee(selectedMentee);
        return formattedTasks.filter(task => task[2] === 'Reviewed');
    };

    const fetchMenteeSubmissions = async (menteesList: Mentee[], tasksList: Task[]) => {
        const results: Record<string, Record<number, string>> = {};
        
        // Group tasks by track_id to minimize API calls
        const tasksByTrack: Record<number, Task[]> = {};
        tasksList.forEach(task => {
            if (!tasksByTrack[task.track_id]) {
                tasksByTrack[task.track_id] = [];
            }
            tasksByTrack[task.track_id].push(task);
        });

        for (const mentee of menteesList) {
            results[mentee.name] = {};
            
            // Fetch submissions per track instead of per task
            for (const [trackId, tasksInTrack] of Object.entries(tasksByTrack)) {
                try {
                    const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(mentee.email)}&track_id=${trackId}`);
                    
                    if (res.ok) {
                        const submissions: Submission[] = await res.json();
                        
                        // Process all tasks for this track
                        tasksInTrack.forEach(task => {
                            const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                            const rawStatus = taskSubmission?.status || 'Not Started';
                            const normalizedStatus = normalizeStatus(rawStatus);
                            results[mentee.name][task.id] = normalizedStatus;
                        });
                    } else {
                        // If API call fails, set all tasks in this track as 'Not Started'
                        tasksInTrack.forEach(task => {
                            results[mentee.name][task.id] = 'Not Started';
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching submissions for ${mentee.name}, track ${trackId}:`, error);
                    // Set all tasks in this track as 'Not Started' on error
                    tasksInTrack.forEach(task => {
                        results[mentee.name][task.id] = 'Not Started';
                    });
                }
            }
        }
        setMenteeSubmissions(results);
    };

    const fetchMenteeDetails = async (menteeName: string) => {
        try {
            const currentTrack = sessionStorage.getItem("currentTrack");
            const track: { id: number; name: string } = currentTrack ? JSON.parse(currentTrack) : { id: 1, name: "" };
            
            const data = await fetch(`https://amapi.amfoss.in/leaderboard/${track.id}`);
            if (!data.ok) {
                throw new Error("Failed to fetch Points and Rank!");
            }
            const response = await data.json();
            const leaderboard: MenteeDetails[] = response['leaderboard'];
            
            const menteeDetail = leaderboard.find(element => element.mentee_name === menteeName);
            if (menteeDetail) {
                setMenteeDetails(menteeDetail);
            } else {
                // Set default values if mentee not found in leaderboard
                setMenteeDetails({
                    mentee_name: menteeName,
                    total_points: 0,
                    tasks_completed: 0
                });
            }
        } catch (error) {
            console.error('Error fetching mentee details:', error);
            // Set default values on error
            setMenteeDetails({
                mentee_name: menteeName,
                total_points: 0,
                tasks_completed: 0
            });
        }
    };

    useEffect(() => {
        const fetchMentees = async () => {
            try {
                const mentorEmail = localStorage.getItem("email") || 'atharvanair04@gmail.com';
                const data = await fetch(`https://amapi.amfoss.in/mentors/${encodeURIComponent(mentorEmail)}/mentees`);
                if (!data.ok) {
                    throw new Error("Failed to fetch Mentees!");
                }
                const response: Mentees = await data.json();
                
                // Update mentee options
                menteeOptions.splice(0, menteeOptions.length);
                response.mentees.forEach((element, index) => {
                    menteeOptions.push(<option key={index} value={element.name}>{element.name}</option>);
                });
                
                // Set first mentee as selected if no selection
                if (response.mentees.length > 0 && selectedMentee === "Mentee 1") {
                    setSelectedMentee(response.mentees[0].name);
                }
                
                return response.mentees;
            } catch (error) {
                console.error('Error fetching mentees:', error);
                return [];
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
                
                return tasksData;
            } catch (error) {
                console.error('Error fetching tasks:', error);
                return [];
            }
        };

        const initData = async () => {
            const [fetchedMentees, fetchedTasks] = await Promise.all([
                fetchMentees(),
                fetchTasks()
            ]);
            
            if (fetchedMentees.length > 0 && fetchedTasks.length > 0) {
                await fetchMenteeSubmissions(fetchedMentees, fetchedTasks);
            }
        };

        initData();
    }, [menteeOptions, selectedMentee]);

    // Fetch mentee details when selected mentee changes
    useEffect(() => {
        if (selectedMentee && selectedMentee !== "Mentee 1") {
            fetchMenteeDetails(selectedMentee);
        }
    }, [selectedMentee]);

    // Update current task when selected mentee or submissions change
    useEffect(() => {
        if (tasks.length > 0 && Object.keys(menteeSubmissions).length > 0 && selectedMentee) {
            const current = getCurrentTaskForMentee(selectedMentee);
            setCurrentTask(current);
        }
    }, [tasks, menteeSubmissions, selectedMentee, getCurrentTaskForMentee]);

    // Calculate submitted tasks count for the selected mentee
    const submittedTasksCount = selectedMentee ? getSubmittedTasksCount(selectedMentee) : 0;

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
                        {menteeOptions}
                    </select>
                </div>
                <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                    <CurrentTask 
                        mentor={true} 
                        task={currentTask}
                        status={currentTask && selectedMentee ? menteeSubmissions[selectedMentee]?.[currentTask.id] : undefined}
                    />
                </div>
                <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                    <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                        <PlayerStats rank={menteeDetails.tasks_completed} points={menteeDetails.total_points} />
                        <Badges />
                        {/* Updated to use submitted tasks count instead of completed tasks */}
                        <PlayerProgress tasks={submittedTasksCount} totaltasks={totaltask} />
                    </div>
                    <div className="flex flex-col gap-4 w-full lg:w-[50%]">
                        <div className="flex flex-col sm:flex-row gap-5 justify-between">
                            <div className="w-full sm:w-1/2">
                                <UpcomingTask upcoming_tasks={getUpcomingMentorTasks()} />
                            </div>
                            <div className="w-1/2">
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