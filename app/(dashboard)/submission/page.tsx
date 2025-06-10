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

const TasksPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const router = useRouter();
    const [toggles, setToggles] = useState([true, false, false]);
    const [showReview, setShowReview] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTrack, setCurrentTrack] = useState<{id: number; name: string} | null>(null);
    
    const ismentor = userRole === 'Mentor';

        const getDummyStatus = useCallback((taskIndex: number, totalTasks: number, isMentor: boolean): string => {
        if (isMentor) {
            const statuses = ["Reviewed(4)", "Submitted(2)", "In Progress(3)", "Not Started(4)"];
            const randomIndex = Math.floor(Math.random() * statuses.length);
            return statuses[randomIndex];
        } else {
            const progressPoint = Math.floor(totalTasks * 0.3); 
            
            if (taskIndex < progressPoint) {
                return taskIndex % 2 === 0 ? "Reviewed" : "Submitted";
            } else if (taskIndex === progressPoint) {
                return "In Progress";
            } else {
                return "Not Started";
            }
        }
    }, []);

    const getFormattedTasks = useCallback((): string[][] => {
        return tasks.map((task, index) => [
            task.id.toString(),
            task.title,
            getDummyStatus(index, tasks.length, ismentor)
        ]);
    }, [tasks, getDummyStatus, ismentor]);

    const getAllMentees = useCallback((): string[][][] => {
        return tasks.map(() => [
            ["Person1", "5 days", "3 files", "Reviewed"],
            ["Person2", "7 days", "2 files", "Submitted"],
            ["Person3", "4 days", "1 file", "In Progress"],
            ["Person4", "6 days", "5 files", "Not Started"]
        ]);
    }, [tasks]);

    const getSubmittedTasks = useCallback((): string[][] => 
        getFormattedTasks().filter(task => task[2] === "Submitted"), 
        [getFormattedTasks]
    );
    
    const getReviewedTasks = useCallback((): string[][] => 
        getFormattedTasks().filter(task => task[2] === "Reviewed"), 
        [getFormattedTasks]
    );
    
    const getReviewedMentorTasks = useCallback((): string[][] => 
        getFormattedTasks().filter(task => task[2].includes("Reviewed")), 
        [getFormattedTasks]
    );
    
    const getSubmittedMentorTasks = useCallback((): string[][] => 
        getFormattedTasks().filter(task => task[2].includes("Submitted")), 
        [getFormattedTasks]
    );

    const getTasksByToggle = useCallback((toggleIndex: number): string[][] => {
        const formattedTasks = getFormattedTasks();
        
        if (ismentor) {
            if (toggleIndex === 0) return formattedTasks;
            if (toggleIndex === 1) return getReviewedMentorTasks();
            return getSubmittedMentorTasks();
        } else {
            if (toggleIndex === 0) return formattedTasks;
            if (toggleIndex === 1) return getSubmittedTasks();
            return getReviewedTasks();
        }
    }, [ismentor, getFormattedTasks, getReviewedMentorTasks, getSubmittedMentorTasks, getSubmittedTasks, getReviewedTasks]);

    const [toggledTasks, setToggledTasks] = useState<string[][]>([]);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
            return;
        }
        const sessionTrack = sessionStorage.getItem('currentTrack');
        if (sessionTrack) {
            if (!sessionTrack) {
                router.push('/track');
                return;
            }
            setCurrentTrack(JSON.parse(sessionTrack));
        }

        const fetchTasks = async () => {
            try {
                let trackId;
                
                if (userRole === 'Mentor') {
                    trackId = 1; 
                } else {
                    const sessionTrack = sessionStorage.getItem('currentTrack');
                    
                    if (!sessionTrack) {
                        router.push('/track');
                        return;
                    }
                    const trackData = JSON.parse(sessionTrack);
                    trackId = trackData.id;
                }

                const response = await fetch(`https://amapi.amfoss.in/tracks/${trackId}/tasks`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const tasksData: Task[] = await response.json();
                setTasks(tasksData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                
                if (userRole === 'Mentee') {
                    router.push('/track');
                } else {
                    setLoading(false);
                }
            }
        };

        fetchTasks();
    }, [isLoggedIn, router, userRole]);

    useEffect(() => {
        if (tasks.length > 0) {
            setToggledTasks(getTasksByToggle(toggles.findIndex(toggle => toggle === true) || 0));
        }
    }, [tasks, userRole, toggles, getTasksByToggle]);

    const getFilteredMentees = useCallback((): string[][][] => {
        if (!ismentor) return [];
        const allMentees = getAllMentees();
        return toggledTasks.map(task => {
            const taskId = task[0];
            const originalTaskIndex = tasks.findIndex(t => t.id.toString() === taskId);
            return originalTaskIndex >= 0 ? allMentees[originalTaskIndex] : [];
        });
    }, [ismentor, getAllMentees, toggledTasks, tasks]);

    const CurrentTaskIndex: number = 0; 

    function toggleState(index: number): void {
        const newToggles: boolean[] = [false, false, false];
        newToggles[index] = true;
        setToggles(newToggles);
        setToggledTasks(getTasksByToggle(index));
    }
    
    const handleTaskClick = (taskId: string) => {
        setSelectedTaskId(taskId);
        setShowReview(true);
    };
    
    const handleMenteeClick = (taskId: string, menteeId: string) => {
        setSelectedTaskId(taskId);
        setSelectedMenteeId(menteeId);
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
                />
            ) : (
                <>
                    {currentTrack && (
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