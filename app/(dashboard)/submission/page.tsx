'use client';

import { useState, useEffect, useCallback } from "react";
import TasksViewer from "./(tasks)/submissionitems";
import { useAuth } from "@/app/context/authcontext";
import { useMentee } from "@/app/context/menteeContext";

import { useRouter, useSearchParams } from 'next/navigation';

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

const normalizeStatus = (status: string): string => {
    if (!status) return 'Not Started';
    
    const statusMap: { [key: string]: string } = {
        'submitted': 'Submitted',
        'approved': 'Reviewed',  // This is the key fix!
        'rejected': 'Rejected',
        'paused': 'Paused',
        'in progress': 'In Progress',
        'not started': 'Not Started'
    };
    
    const normalizedKey = status.toLowerCase();
    return statusMap[normalizedKey] || status;
};

const TasksPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const { 
        selectedMentee, 
        selectedMenteeEmail, 
        isLoading: menteesLoading 
    } = useMentee();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [toggles, setToggles] = useState([true, false, false]);
    const [showReview, setShowReview] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
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

        //For Praveshan
        for(let i = 0; i<data.length;i++){
            data[i].deadline = null;
        }


        setTasks(data);
        return data;
    }, [userRole, router]);

    // Updated fetchMenteeSubmissions to use only the selected mentee
    const fetchSelectedMenteeSubmissions = useCallback(async (trackId: number, tasksList: Task[]) => {
        if (!selectedMentee || !selectedMenteeEmail) {
            console.log('No selected mentee, skipping submission fetch');
            return;
        }

        const results: Record<string, Record<number, string>> = {};
        results[selectedMentee] = {};
        
        try {
            // Single API call for the selected mentee
            const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(selectedMenteeEmail)}&track_id=${trackId}`);
            
            if (res.ok) {
                const submissions: Submission[] = await res.json();
                console.log(`Fetched ${submissions.length} submissions for ${selectedMentee} in track ${trackId}`);
                
                // Map all submissions for this mentee to their respective tasks
                for (const task of tasksList) {
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    const rawStatus = taskSubmission?.status || 'Not Started';
                    const normalizedStatus = normalizeStatus(rawStatus);
                    results[selectedMentee][task.id] = normalizedStatus;
                }
            } else {
                console.error(`Failed to fetch submissions for ${selectedMentee}:`, res.status);
                // Set all tasks to 'Not Started' if API call fails
                for (const task of tasksList) {
                    results[selectedMentee][task.id] = 'Not Started';
                }
            }
        } catch (error) {
            console.error(`Error fetching submissions for ${selectedMentee}:`, error);
            // Set all tasks to 'Not Started' if error occurs
            for (const task of tasksList) {
                results[selectedMentee][task.id] = 'Not Started';
            }
        }
        
        setMenteeSubmissions(results);
    }, [selectedMentee, selectedMenteeEmail]);

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

    // Helper function to filter tasks based on status and current toggle
    const getFilteredTasks = useCallback((): Task[] => {
        const activeToggleIndex = toggles.findIndex(toggle => toggle);
        
        return tasks.filter((task) => {
            let status: string;
            
            if (ismentor && selectedMentee && menteeSubmissions[selectedMentee]) {
                // Mentor view - use selected mentee's status
                status = menteeSubmissions[selectedMentee][task.id] || 'Not Started';
            } else if (!ismentor && Object.keys(mySubmissions).length > 0) {
                // Mentee view - use own status
                status = mySubmissions[task.id] || 'Not Started';
            } else {
                status = 'Not Started';
            }

            // Filter based on active toggle
            switch (activeToggleIndex) {
                case 0: // All Tasks
                    return true;
                case 1: // Submitted (for mentees) / Reviewed (for mentors)
                    if (ismentor) {
                        return status === 'Reviewed';
                    } else {
                        return status === 'Submitted';
                    }
                case 2: // Reviewed (for mentees) / Submitted (for mentors)  
                    if (ismentor) {
                        return status === 'Submitted';
                    } else {
                        return status === 'Reviewed';
                    }
                default:
                    return true;
            }
        });
    }, [tasks, toggles, ismentor, selectedMentee, menteeSubmissions, mySubmissions]);

    const getFormattedTasks = useCallback((): string[][] => {
        const filteredTasks = getFilteredTasks();
        
        return filteredTasks.map((task) => {
            if (ismentor && selectedMentee && menteeSubmissions[selectedMentee]) {
                // Mentor view - show selected mentee's status
                const status = menteeSubmissions[selectedMentee][task.id] || 'Not Started';
                return [task.id.toString(), task.title, status];
            } else if (!ismentor && Object.keys(mySubmissions).length > 0) {
                // Mentee view - show own progress with lock status
                const status = mySubmissions[task.id] || 'Not Started';
                const unlocked = isTaskUnlocked(task.id);
                
                // Add lock indicator for locked tasks and deadline info
                let displayStatus = status;
                if (!unlocked) {
                    displayStatus = `🔒 ${status}`;
                } else if (task.deadline === null) {
                    //displayStatus = `${status} ⚡ (No deadline)`;
                    displayStatus = `${status}`;
                } else {
                    displayStatus = `${status} (${task.deadline} days)`;
                }
                
                return [task.id.toString(), task.title, displayStatus];
            } else {
                return [task.id.toString(), task.title, ""];
            }
        });
    }, [getFilteredTasks, ismentor, selectedMentee, menteeSubmissions, mySubmissions, isTaskUnlocked]);

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
                    // Wait for mentees to load, then fetch submissions for selected mentee
                    if (!menteesLoading && selectedMentee && selectedMenteeEmail) {
                        await fetchSelectedMenteeSubmissions(trackId, fetchedTasks);
                    }
                } else {
                    // Pass trackId and tasks to optimized function
                    if (trackId) {
                        await fetchMySubmissions(trackId, fetchedTasks);
                    }
                }
                if(searchParams.has("page")){
                    setSelectedTaskId(searchParams.get("page"));
                    setSelectedMenteeId(selectedMenteeEmail);
                    setShowReview(true);
                }
                setLoading(false);

            } catch (error) {
                console.error('Error initializing:', error);
                setLoading(false);
            }
        };

        init();
    }, [isLoggedIn, router, ismentor, fetchTasks, fetchSelectedMenteeSubmissions, fetchMySubmissions, menteesLoading, selectedMentee, selectedMenteeEmail, userRole]);

    // Separate effect to handle mentee selection changes
    useEffect(() => {
        if (ismentor && !menteesLoading && selectedMentee && selectedMenteeEmail && tasks.length > 0) {
            const trackId = 1; // Mentors use track 1
            fetchSelectedMenteeSubmissions(trackId, tasks);
        }
    }, [selectedMentee, selectedMenteeEmail, menteesLoading, ismentor, tasks, fetchSelectedMenteeSubmissions]);

    // Update toggledTasks whenever tasks, submissions, or toggles change
    useEffect(() => {
        if (tasks.length > 0) {
            const formattedTasks = getFormattedTasks();
            console.log('Formatted tasks for current toggle:', formattedTasks);
            console.log('My submissions:', mySubmissions);
            console.log('Active toggle:', toggles.findIndex(t => t));
            setToggledTasks(formattedTasks);
            console.log(tasks);
        }
    }, [tasks, getFormattedTasks, mySubmissions, toggles]);

    // Simplified getFilteredMentees - now only returns data for the selected mentee
    const getFilteredMentees = useCallback((): string[][][] => {
        if (!ismentor || tasks.length === 0 || !selectedMentee) return [];

        return toggledTasks.map(([taskIdStr]) => {
            const taskId = parseInt(taskIdStr);
            const status = menteeSubmissions[selectedMentee]?.[taskId] || 'Not Started';
            // Return array with single mentee (the selected one)
            return [[selectedMentee, selectedMenteeEmail || '', "-", status]];
        });
    }, [ismentor, selectedMentee, selectedMenteeEmail, toggledTasks, menteeSubmissions, tasks]);

    const CurrentTaskIndex: number = 0; 

    function toggleState(index: number): void {
        const newToggles: boolean[] = [false, false, false];
        newToggles[index] = true;
        setToggles(newToggles);
        // The useEffect will handle updating toggledTasks when toggles change
    }

    const handleTaskClick = (taskId: string) => {
        if (ismentor) {
            // For mentors, go directly to review with the selected mentee
            setSelectedTaskId(taskId);
            setSelectedMenteeId(selectedMenteeEmail);
            setShowReview(true);
        } else {
            // For mentees, check if the task is unlocked before allowing access
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
            
            setSelectedTaskId(taskId);
            setShowReview(true);
        }
    };

    const handleMenteeClick = (taskId: string, menteeEmail: string) => {
        // This function is kept for compatibility but shouldn't be used for mentors anymore
        // since they go directly to review via handleTaskClick
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

    if (loading || (ismentor && menteesLoading)) {
        return (
            <div className="text-white flex flex-col gap-2 justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    // For mentors, show message if no mentee is selected
    if (ismentor && !selectedMentee) {
        return (
            <div className="text-white flex flex-col justify-center items-center h-screen">
                <div className="text-xl mb-4">Please select a mentee from the dashboard first</div>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
                >
                    Go to Dashboard
                </button>
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

                    {/* Show selected mentee info for mentors */}
                    {ismentor && selectedMentee && (
                        <div className="text-center mb-4">
                            <div className="text-yellow-400 text-lg">
                                Viewing submissions for: {selectedMentee}
                            </div>
                            <button 
                                onClick={() => router.push('/dashboard')}
                                className="text-sm text-gray-400 hover:text-yellow-400 underline"
                            >
                                Change Mentee
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
                    <div className="w-[95%] sm:w-[85%] md:w-[80%] mt-7 h-[72vh] overflow-scroll scrollbar-hide px-5 m-auto">
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