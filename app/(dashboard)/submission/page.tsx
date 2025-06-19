'use client';

import { useState, useEffect, useCallback } from "react";
import TasksViewer from "./(tasks)/submissionitems";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from 'next/navigation';

import SubmissionReview from "./(review)/review";

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: number | null; // Changed to match API response
    id: number;
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
        'approved': 'Reviewed',  // This is the key fix!
        'rejected': 'Reviewed',
        'paused': 'Paused',
        'in progress': 'In Progress',
        'not started': 'Not Started'
    };
    
    const normalizedKey = status.toLowerCase();
    return statusMap[normalizedKey] || status;
};

const TasksPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const router = useRouter();
    const [toggles, setToggles] = useState([true, false, false]);
    const [showReview, setShowReview] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [menteeSubmissions, setMenteeSubmissions] = useState<Record<string, Record<number, string>>>({});
    const [mySubmissions, setMySubmissions] = useState<Record<number, string>>({});
    const [currentTrack, setCurrentTrack] = useState<{id: number; name: string} | null>(null);
    
    // Get user email from localStorage/sessionStorage
    const getUserEmail = (): string | null => {
        const email = localStorage.getItem('email');
        console.log('Found email in localStorage:', email);
        return email;
    };

    const ismentor = userRole === 'Mentor';

    // Fixed helper function to check if a task is unlocked for mentees
    const isTaskUnlocked = useCallback((taskId: number): boolean => {
        if (ismentor) return true;
        
        if (taskId <= 1) return true;
        
        const previousTaskId = taskId - 1;
        const previousTask = tasks.find(task => task.id === previousTaskId);
        
        if (!previousTask) {
            console.log(`Task ${taskId} locked because previous task ${previousTaskId} not found`);
            return false;
        }
        
        if (previousTask.deadline === null) {
            console.log(`Task ${taskId} unlocked because previous task ${previousTaskId} has null deadline`);
            return true;
        }
        
        const previousTaskStatus = mySubmissions[previousTaskId];
        console.log(`DEBUG: Checking task ${taskId} unlock:`);
        console.log(`- Previous task ID: ${previousTaskId}`);
        console.log(`- Previous task status: "${previousTaskStatus}"`);
        console.log(`- All submissions:`, mySubmissions);
        console.log(`- Status check: Submitted=${previousTaskStatus === 'Submitted'}, Reviewed=${previousTaskStatus === 'Reviewed'}`);
        
        const isUnlocked = previousTaskStatus === 'Submitted' || previousTaskStatus === 'Reviewed';
        
        console.log(`- Final unlock result: ${isUnlocked}`);
        
        return isUnlocked;
    }, [ismentor, mySubmissions, tasks]);

    const fetchTasks = useCallback(async (): Promise<Task[]> => {
        let trackId;

        if (userRole === 'Mentor') {
            trackId = 1;
        } else {
            const sessionTrack = sessionStorage.getItem('currentTrack');
            if (!sessionTrack) {
                router.push('/track');
                return [];
            }
            const trackData = JSON.parse(sessionTrack);
            trackId = trackData.id;
            setCurrentTrack(trackData);
        }

        const response = await fetch(`https://amapi.amfoss.in/tracks/${trackId}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
        return data;
    }, [userRole, router]);

    const fetchMentees = useCallback(async (): Promise<Mentee[]> => {
        const mentorEmail = 'atharvanair04@gmail.com';
        const res = await fetch(`https://amapi.amfoss.in/mentors/${encodeURIComponent(mentorEmail)}/mentees`);
        const data = await res.json();
        setMentees(data.mentees);
        return data.mentees;
    }, []);

    // Optimized fetchMenteeSubmissions - fetch once per mentee per track
    const fetchMenteeSubmissions = useCallback(async (menteesList: Mentee[], trackId: number, tasksList: Task[]) => {
        const results: Record<string, Record<number, string>> = {};
        
        for (const mentee of menteesList) {
            results[mentee.name] = {};
            
            try {
                // Single API call per mentee for the entire track
                const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(mentee.email)}&track_id=${trackId}`);
                
                if (res.ok) {
                    const submissions: Submission[] = await res.json();
                    console.log(`Fetched ${submissions.length} submissions for ${mentee.name} in track ${trackId}`);
                    
                    // Map all submissions for this mentee to their respective tasks
                    for (const task of tasksList) {
                        const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                        const rawStatus = taskSubmission?.status || 'Not Started';
                        const normalizedStatus = normalizeStatus(rawStatus);
                        results[mentee.name][task.id] = normalizedStatus;
                    }
                } else {
                    console.error(`Failed to fetch submissions for ${mentee.name}:`, res.status);
                    // Set all tasks to 'Not Started' if API call fails
                    for (const task of tasksList) {
                        results[mentee.name][task.id] = 'Not Started';
                    }
                }
            } catch (error) {
                console.error(`Error fetching submissions for ${mentee.name}:`, error);
                // Set all tasks to 'Not Started' if error occurs
                for (const task of tasksList) {
                    results[mentee.name][task.id] = 'Not Started';
                }
            }
        }
        
        setMenteeSubmissions(results);
    }, []);

    // Optimized fetchMySubmissions - single API call per track
    const fetchMySubmissions = useCallback(async (trackId: number, tasksList: Task[]) => {
        const userEmail = getUserEmail();
        if (!userEmail) {
            console.log('No user email found');
            return;
        }
        
        console.log('Fetching all submissions for email:', userEmail, 'trackId:', trackId);
        
        const results: Record<number, string> = {};
        
        try {
            // Single API call for the entire track
            const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(userEmail)}&track_id=${trackId}`);
            console.log(`Fetching submissions for track ${trackId}, response status:`, res.status);
            
            if (res.ok) {
                const submissions: Submission[] = await res.json();
                console.log(`Fetched ${submissions.length} total submissions for track ${trackId}:`, submissions);
                
                // Map all submissions to their respective tasks
                for (const task of tasksList) {
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    
                    if (taskSubmission) {
                        const rawStatus = taskSubmission.status;
                        const normalizedStatus = normalizeStatus(rawStatus);
                        console.log(`Task ${task.id}: "${rawStatus}" -> "${normalizedStatus}"`);
                        results[task.id] = normalizedStatus;
                    } else {
                        results[task.id] = 'Not Started';
                    }
                }
            } else {
                console.error(`Failed to fetch submissions for track ${trackId}:`, res.status);
                // Set all tasks to 'Not Started' if API call fails
                for (const task of tasksList) {
                    results[task.id] = 'Not Started';
                }
            }
        } catch (error) {
            console.error(`Error fetching submissions for track ${trackId}:`, error);
            // Set all tasks to 'Not Started' if error occurs
            for (const task of tasksList) {
                results[task.id] = 'Not Started';
            }
        }
        
        console.log('Final results:', results);
        setMySubmissions(results);
    }, []);

    const getFormattedTasks = useCallback((): string[][] => {
        return tasks.map((task) => {
            if (ismentor && mentees.length > 0 && Object.keys(menteeSubmissions).length > 0) {
                // Mentor view - show mentee progress summary
                const counts: Record<string, number> = {};
                for (const mentee of mentees) {
                    const status = menteeSubmissions[mentee.name]?.[task.id] || 'Not Started';
                    counts[status] = (counts[status] || 0) + 1;
                }
                const statusSummary = Object.entries(counts)
                    .map(([status, count]) => `${status} (${count})`)
                    .join(', ');
                return [task.id.toString(), task.title, statusSummary];
            } else if (!ismentor && Object.keys(mySubmissions).length > 0) {
                // Mentee view - show own progress with lock status
                const status = mySubmissions[task.id] || 'Not Started';
                const unlocked = isTaskUnlocked(task.id);
                
                // Add lock indicator for locked tasks and deadline info
                let displayStatus = status;
                if (!unlocked) {
                    displayStatus = `🔒 ${status}`;
                } else if (task.deadline === null) {
                    displayStatus = `${status} ⚡ (No deadline)`;
                } else {
                    displayStatus = `${status} (${task.deadline} days)`;
                }
                
                return [task.id.toString(), task.title, displayStatus];
            } else {
                return [task.id.toString(), task.title, ""];
            }
        });
    }, [tasks, ismentor, mentees, menteeSubmissions, mySubmissions, isTaskUnlocked]);

    const [toggledTasks, setToggledTasks] = useState<string[][]>([]);

    // Updated useEffect with optimized API calls
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
            return;
        }

        const init = async () => {
            try {
                const fetchedTasks = await fetchTasks();
                if (fetchedTasks.length === 0) {
                    setLoading(false);
                    return;
                }

                // Get track ID once
                let trackId;
                if (userRole === 'Mentor') {
                    trackId = 1;
                } else {
                    const sessionTrack = sessionStorage.getItem('currentTrack');
                    if (sessionTrack) {
                        const trackData = JSON.parse(sessionTrack);
                        trackId = trackData.id;
                        setCurrentTrack(trackData);
                    }
                }

                if (ismentor) {
                    const fetchedMentees = await fetchMentees();
                    // Pass trackId and tasks to optimized function
                    await fetchMenteeSubmissions(fetchedMentees, trackId, fetchedTasks);
                } else {
                    // Pass trackId and tasks to optimized function
                    if (trackId) {
                        await fetchMySubmissions(trackId, fetchedTasks);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error initializing:', error);
                setLoading(false);
            }
        };

        init();
    }, [isLoggedIn, router, ismentor, fetchTasks, fetchMentees, fetchMenteeSubmissions, fetchMySubmissions]);

    useEffect(() => {
        if (tasks.length > 0) {
            const formattedTasks = getFormattedTasks();
            console.log('Formatted tasks for mentee:', formattedTasks);
            console.log('My submissions:', mySubmissions);
            console.log('Tasks with deadlines:', tasks.map(t => ({ id: t.id, title: t.title, deadline: t.deadline })));
            setToggledTasks(formattedTasks);
        }
    }, [tasks, getFormattedTasks, mySubmissions]);

    const getFilteredMentees = useCallback((): string[][][] => {
        if (!ismentor || tasks.length === 0 || mentees.length === 0) return [];

        return toggledTasks.map(([taskIdStr]) => {
            const taskId = parseInt(taskIdStr);
            return mentees.map(mentee => {
                const status = menteeSubmissions[mentee.name]?.[taskId] || 'Not Started';
                return [mentee.name, mentee.email, "-", status];
            });
        });
    }, [ismentor, mentees, toggledTasks, menteeSubmissions, tasks]);

    const CurrentTaskIndex: number = 0; 

    function toggleState(index: number): void {
        const newToggles: boolean[] = [false, false, false];
        newToggles[index] = true;
        setToggles(newToggles);
        setToggledTasks(getFormattedTasks());
    }

    const handleTaskClick = (taskId: string) => {
        // For mentees, check if the task is unlocked before allowing access
        if (!ismentor) {
            const taskIdNum = parseInt(taskId);
            if (!isTaskUnlocked(taskIdNum)) {
                const previousTaskId = taskIdNum - 1;
                const previousTask = tasks.find(task => task.id === previousTaskId);
                
                if (previousTask && previousTask.deadline === null) {
                    alert(`Task ${previousTaskId} ("${previousTask.title}") has no deadline and should automatically unlock this task. If you're seeing this error, please refresh the page or contact support.`);
                } else {
                    const previousTaskTitle = previousTask ? `"${previousTask.title}"` : previousTaskId.toString();
                    alert(`You must complete Task ${previousTaskId} (${previousTaskTitle}) before accessing this task.`);
                }
                return;
            }
        }
        
        setSelectedTaskId(taskId);
        setShowReview(true);
    };

    const handleMenteeClick = (taskId: string, menteeEmail: string) => {
        setSelectedTaskId(taskId);
        setSelectedMenteeId(menteeEmail);
        setShowReview(true);
    };

    const handleCloseReview = () => {
        setShowReview(false);
    };

    const handleChangeTrack = () => {
        sessionStorage.removeItem('currentTrack');
        router.push('/track');
    };

    if (!isLoggedIn) {
        return null; 
    }

    if (loading) {
        return (
            <div className="text-white flex justify-center items-center h-screen">
                <div className="text-xl">Loading tasks...</div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-white flex justify-center items-center h-screen">
                <div className="text-xl">
                    {userRole === 'Mentee' 
                        ? 'No tasks found for this track. Please select a different track.' 
                        : 'No tasks found.'}
                </div>
                {userRole === 'Mentee' && (
                    <button 
                        onClick={handleChangeTrack}
                        className="ml-4 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
                    >
                        Select Track
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="text-white">
            {showReview ? (
                <SubmissionReview 
                    isMentor={ismentor}
                    taskId={selectedTaskId}
                    menteeId={selectedMenteeId}
                    onClose={handleCloseReview}
                    trackId={currentTrack?.id}
                    allSubmissions={mySubmissions}
                    tasks={tasks}
                />
            ) : (
                <>
                    {userRole === 'Mentee' && currentTrack && (
                        <div className="text-center mb-4">
                            <div className="text-yellow-400 text-lg">
                                Current Track: {currentTrack.name}
                            </div>
                            <button 
                                onClick={handleChangeTrack}
                                className="text-sm text-gray-400 hover:text-yellow-400 underline"
                            >
                                Change Track
                            </button>
                        </div>
                    )}

                    <div className="bg-deeper-grey rounded-full w-[90%] sm:w-[70%] md:w-[50%] flex justify-between m-auto mt-5">
                        <button 
                            className={`rounded-full w-1/3 py-2 text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors ${toggles[0] ? "bg-primary-yellow text-black" : "bg-deeper-grey"}`} 
                            onClick={() => toggleState(0)}
                        >
                            All Tasks
                        </button>
                        <button 
                            className={`rounded-full w-1/3 py-2 text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors ${toggles[1] ? "bg-primary-yellow text-black" : "bg-deeper-grey"}`} 
                            onClick={() => toggleState(1)}
                        >
                            {ismentor ? "Reviewed" : "Submitted"}
                        </button>
                        <button 
                            className={`rounded-full w-1/3 py-2 text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors ${toggles[2] ? "bg-primary-yellow text-black" : "bg-deeper-grey"}`} 
                            onClick={() => toggleState(2)}
                        >
                            {ismentor ? "Submitted " : "Reviewed"}
                        </button>
                    </div>
                    <div className="w-[95%] sm:w-[85%] md:w-[80%] mt-7 h-[80vh] overflow-scroll scrollbar-hide px-5 m-auto">
                        <TasksViewer 
                            isMentor={ismentor}
                            highted_task={CurrentTaskIndex} 
                            tasks={toggledTasks} 
                            mentees={getFilteredMentees()}
                            onTaskClick={handleTaskClick}
                            onMenteeClick={handleMenteeClick}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default TasksPage;