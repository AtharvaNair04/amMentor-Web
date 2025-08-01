'use client';

import { useState, useEffect, useCallback } from "react";
import TasksViewer from "./(tasks)/submissionitems";
import { useAuth } from "@/app/context/authcontext";
import { useMentee } from "@/app/context/menteeContext";
import { useRouter } from 'next/navigation';

import SubmissionReview from "./(review)/review";

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: number | null;
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
        'approved': 'Reviewed',
        'rejected': 'Rejected',
        'paused': 'Paused',
        'in progress': 'In Progress',
        'not started': 'Not Started'
    };
    
    const normalizedKey = status.toLowerCase();
    return statusMap[normalizedKey] || status;
};

// Main component that uses search params - must be wrapped in Suspense
const TasksPageContent = () => {
    const { userRole, isLoggedIn } = useAuth();
    const { 
        selectedMentee, 
        selectedMenteeEmail, 
        isLoading: menteesLoading 
    } = useMentee();
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
    const [toggledTasks, setToggledTasks] = useState<string[][]>([]);

    const getUserEmail = (): string | null => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('email');
            console.log('Found email in localStorage:', email);
            return email;
        }
        return null;
    };

    const ismentor = userRole === 'Mentor';

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
            if (typeof window !== 'undefined') {
                const sessionTrack = sessionStorage.getItem('currentTrack');
                if (!sessionTrack) {
                    router.push('/track');
                    return [];
                }
                const trackData = JSON.parse(sessionTrack);
                trackId = trackData.id;
                setCurrentTrack(trackData);
            }
        }

        if (!trackId) return [];

        try {
            const response = await fetch(`https://amapi.amfoss.in/tracks/${trackId}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
            return data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }, [userRole, router]);

    const fetchSelectedMenteeSubmissions = useCallback(async (trackId: number, tasksList: Task[]) => {
        if (!selectedMentee || !selectedMenteeEmail) {
            console.log('No selected mentee, skipping submission fetch');
            return;
        }

        const results: Record<string, Record<number, string>> = {};
        results[selectedMentee] = {};
        
        try {
            const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(selectedMenteeEmail)}&track_id=${trackId}`);
            
            if (res.ok) {
                const submissions: Submission[] = await res.json();
                console.log(`Fetched ${submissions.length} submissions for ${selectedMentee} in track ${trackId}`);
                
                for (const task of tasksList) {
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    const rawStatus = taskSubmission?.status || 'Not Started';
                    const normalizedStatus = normalizeStatus(rawStatus);
                    results[selectedMentee][task.id] = normalizedStatus;
                }
            } else {
                console.error(`Failed to fetch submissions for ${selectedMentee}:`, res.status);
                for (const task of tasksList) {
                    results[selectedMentee][task.id] = 'Not Started';
                }
            }
        } catch (error) {
            console.error(`Error fetching submissions for ${selectedMentee}:`, error);
            for (const task of tasksList) {
                results[selectedMentee][task.id] = 'Not Started';
            }
        }
        
        setMenteeSubmissions(results);
    }, [selectedMentee, selectedMenteeEmail]);

    const fetchMySubmissions = useCallback(async (trackId: number, tasksList: Task[]) => {
        const userEmail = getUserEmail();
        if (!userEmail) {
            console.log('No user email found');
            return;
        }
        
        console.log('Fetching all submissions for email:', userEmail, 'trackId:', trackId);
        
        const results: Record<number, string> = {};
        
        try {
            const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(userEmail)}&track_id=${trackId}`);
            console.log(`Fetching submissions for track ${trackId}, response status:`, res.status);
            
            if (res.ok) {
                const submissions: Submission[] = await res.json();
                console.log(`Fetched ${submissions.length} total submissions for track ${trackId}:`, submissions);
                
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
                for (const task of tasksList) {
                    results[task.id] = 'Not Started';
                }
            }
        } catch (error) {
            console.error(`Error fetching submissions for track ${trackId}:`, error);
            for (const task of tasksList) {
                results[task.id] = 'Not Started';
            }
        }
        
        console.log('Final results:', results);
        setMySubmissions(results);
    }, []);

    const getFilteredTasks = useCallback((): Task[] => {
        const activeToggleIndex = toggles.findIndex(toggle => toggle);
        
        return tasks.filter((task) => {
            let status: string;
            
            if (ismentor && selectedMentee && menteeSubmissions[selectedMentee]) {
                status = menteeSubmissions[selectedMentee][task.id] || 'Not Started';
            } else if (!ismentor && Object.keys(mySubmissions).length > 0) {
                status = mySubmissions[task.id] || 'Not Started';
            } else {
                status = 'Not Started';
            }

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
                const status = menteeSubmissions[selectedMentee][task.id] || 'Not Started';
                return [task.id.toString(), task.title, status];
            } else if (!ismentor && Object.keys(mySubmissions).length > 0) {
                const status = mySubmissions[task.id] || 'Not Started';
                const unlocked = isTaskUnlocked(task.id);
                
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
    }, [getFilteredTasks, ismentor, selectedMentee, menteeSubmissions, mySubmissions, isTaskUnlocked]);

    const getFilteredMentees = useCallback((): string[][][] => {
        if (!ismentor || tasks.length === 0 || !selectedMentee) return [];

        return toggledTasks.map(([taskIdStr]) => {
            const taskId = parseInt(taskIdStr);
            const status = menteeSubmissions[selectedMentee]?.[taskId] || 'Not Started';
            return [[selectedMentee, selectedMenteeEmail || '', "-", status]];
        });
    }, [ismentor, selectedMentee, selectedMenteeEmail, toggledTasks, menteeSubmissions, tasks]);

    const CurrentTaskIndex: number = 0; 

    function toggleState(index: number): void {
        const newToggles: boolean[] = [false, false, false];
        newToggles[index] = true;
        setToggles(newToggles);
    }

    const handleTaskClick = (taskId: string) => {
        if (ismentor) {
            setSelectedTaskId(taskId);
            setSelectedMenteeId(selectedMenteeEmail);
            setShowReview(true);
        } else {
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
        setSelectedTaskId(taskId);
        setSelectedMenteeId(menteeEmail);
        setShowReview(true);
    };

    const handleCloseReview = () => {
        setShowReview(false);
    };

    const handleChangeTrack = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('currentTrack');
        }
        router.push('/track');
    };

    // Main initialization effect
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

                let trackId;
                if (userRole === 'Mentor') {
                    trackId = 1;
                } else {
                    if (typeof window !== 'undefined') {
                        const sessionTrack = sessionStorage.getItem('currentTrack');
                        if (sessionTrack) {
                            const trackData = JSON.parse(sessionTrack);
                            trackId = trackData.id;
                            setCurrentTrack(trackData);
                        }
                    }
                }

                if (ismentor) {
                    if (!menteesLoading && selectedMentee && selectedMenteeEmail && trackId) {
                        await fetchSelectedMenteeSubmissions(trackId, fetchedTasks);
                    }
                } else {
                    if (trackId) {
                        await fetchMySubmissions(trackId, fetchedTasks);
                    }
                }

                // Handle search params - client-side only
                if (typeof window !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const pageParam = urlParams.get('page');
                    if (pageParam) {
                        setSelectedTaskId(pageParam);
                        setSelectedMenteeId(selectedMenteeEmail);
                        setShowReview(true);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error initializing:', error);
                setLoading(false);
            }
        };

        init();
    }, [isLoggedIn, router, ismentor, fetchTasks, fetchSelectedMenteeSubmissions, fetchMySubmissions, menteesLoading, selectedMentee, selectedMenteeEmail, userRole]);

    // Handle mentee selection changes
    useEffect(() => {
        if (ismentor && !menteesLoading && selectedMentee && selectedMenteeEmail && tasks.length > 0) {
            const trackId = 1;
            fetchSelectedMenteeSubmissions(trackId, tasks);
        }
    }, [selectedMentee, selectedMenteeEmail, menteesLoading, ismentor, tasks, fetchSelectedMenteeSubmissions]);

    // Update formatted tasks
    useEffect(() => {
        if (tasks.length > 0) {
            const formattedTasks = getFormattedTasks();
            console.log('Formatted tasks for current toggle:', formattedTasks);
            console.log('My submissions:', mySubmissions);
            console.log('Active toggle:', toggles.findIndex(t => t));
            setToggledTasks(formattedTasks);
        }
    }, [tasks, getFormattedTasks, mySubmissions, toggles]);

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

export default TasksPageContent;