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
    deadline: string;
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
    const [mySubmissions, setMySubmissions] = useState<Record<number, string>>({}); // Added for mentee's own submissions
    const [currentTrack, setCurrentTrack] = useState<{id: number; name: string} | null>(null);
    
    // Get user email from localStorage/sessionStorage
    const getUserEmail = (): string | null => {
        // Based on your profile page, email is stored directly in localStorage
        const email = localStorage.getItem('email');
        console.log('Found email in localStorage:', email);
        return email;
    };

    const ismentor = userRole === 'Mentor';

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

    const fetchMenteeSubmissions = useCallback(async (menteesList: Mentee[], tasksList: Task[]) => {
        const results: Record<string, Record<number, string>> = {};
        for (const mentee of menteesList) {
            results[mentee.name] = {};
            for (const task of tasksList) {
                const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(mentee.email)}&track_id=${task.track_id}`);
                if (res.ok) {
                    const submissions: Submission[] = await res.json();
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    results[mentee.name][task.id] = taskSubmission?.status || 'Not Started';
                }
            }
        }
        setMenteeSubmissions(results);
    }, []);

    // New function to fetch mentee's own submissions
    const fetchMySubmissions = useCallback(async (tasksList: Task[], trackId: number) => {
        const userEmail = getUserEmail();
        if (!userEmail) {
            console.log('No user email found');
            return;
        }
        
        console.log('Fetching submissions for email:', userEmail, 'trackId:', trackId);
        
        const results: Record<number, string> = {};
        for (const task of tasksList) {
            try {
                const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(userEmail)}&track_id=${trackId}`);
                console.log(`Fetching submissions for task ${task.id}, response status:`, res.status);
                
                if (res.ok) {
                    const submissions: Submission[] = await res.json();
                    console.log(`Submissions for task ${task.id}:`, submissions);
                    const taskSubmission = submissions.find((s: Submission) => s.task_id === task.id);
                    results[task.id] = taskSubmission?.status || 'Not Started';
                } else {
                    results[task.id] = 'Not Started';
                }
            } catch (error) {
                console.error(`Error fetching submission for task ${task.id}:`, error);
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
                // Mentee view - show own progress
                const status = mySubmissions[task.id] || 'Not Started';
                return [task.id.toString(), task.title, status];
            } else {
                return [task.id.toString(), task.title, ""];
            }
        });
    }, [tasks, ismentor, mentees, menteeSubmissions, mySubmissions]);

    const [toggledTasks, setToggledTasks] = useState<string[][]>([]);

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

                if (ismentor) {
                    const fetchedMentees = await fetchMentees();
                    await fetchMenteeSubmissions(fetchedMentees, fetchedTasks);
                } else {
                    // For mentees, get the track ID and fetch submissions
                    const sessionTrack = sessionStorage.getItem('currentTrack');
                    if (sessionTrack) {
                        const trackData = JSON.parse(sessionTrack);
                        await fetchMySubmissions(fetchedTasks, trackData.id);
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
            console.log('Formatted tasks for mentee:', formattedTasks); // Debug log
            console.log('My submissions:', mySubmissions); // Debug log
            setToggledTasks(formattedTasks);
        }
    }, [tasks, getFormattedTasks, mySubmissions]);

    const getFilteredMentees = useCallback((): string[][][] => {
        if (!ismentor || tasks.length === 0 || mentees.length === 0) return [];

        return toggledTasks.map(([taskIdStr]) => {
            const taskId = parseInt(taskIdStr);
            return mentees.map(mentee => {
                const status = menteeSubmissions[mentee.name]?.[taskId] || 'Not Started';
                return [mentee.name,mentee.email, "-", status];
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
                            {ismentor ? "Reviewed Tasks" : "Submitted"}
                        </button>
                        <button 
                            className={`rounded-full w-1/3 py-2 text-sm sm:text-lg md:text-xl lg:text-2xl transition-colors ${toggles[2] ? "bg-primary-yellow text-black" : "bg-deeper-grey"}`} 
                            onClick={() => toggleState(2)}
                        >
                            {ismentor ? "Submitted Tasks" : "Reviewed"}
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