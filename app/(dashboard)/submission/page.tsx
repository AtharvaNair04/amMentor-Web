'use client';

import { useState, useEffect } from "react";
import TasksViewer from "./submissionitems";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from 'next/navigation';

// Import the review component directly
import SubmissionReview from "./review";

const TasksPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const router = useRouter();
    const [toggles, setToggles] = useState([true, false, false]);
    const [showReview, setShowReview] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
    
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    const ismentor = userRole === 'Mentor';

    const AllTasksMentee: string[][] = [
        ["00", "Figma Design Task", "Reviewed"],
        ["01", "Figma Design Task", "Submitted"],
        ["02", "Figma Design Task", "Submitted"],
        ["03", "Figma Design Task", "In Progress"],
        ["04", "Figma Design Task", "Not Started"]
    ];

    const AllTasksMentor: string[][] = [
        ["00", "Figma Design Task", "Reviewed(4)"],
        ["01", "Figma Design Task", "Pending(2)"],
        ["02", "Figma Design Task", "Pending(3)"],
        ["03", "Figma Design Task", "In Progress(3)"],
        ["04", "Figma Design Task", "Not Started(4)"]
    ];

    const AllMentees: string[][][] = [
        [["Person1", "Reviewed"], ["Person2", "Reviewed"], ["Person3", "Reviewed"], ["Person4", "Reviewed"]],
        [["Person1", "Submitted"], ["Person2", "Submitted"],["Person3", "Reviewed"], ["Person4", "Reviewed"]],
        [["Person1", "Submitted"], ["Person2", "Submitted"],["Person3", "Submitted"], ["Person4", "Reviewed"]],
        [["Person1", "Reviewed"], ["Person2", "Submitted"], ["Person3", "Not Submitted"] ,["Person4", "Not Submitted"]],
        [["Person1", "Not Submitted"], ["Person2", "Not Submitted"], ["Person3", "Not Submitted"], ["Person4", "Not Submitted"]]
    ];

    const CurrentTaskIndex: number = 3;

    const getSubmittedTasks = (): string[][] => AllTasksMentee.filter(task => task[2] === "Submitted");
    const getReviewedTasks = (): string[][] => AllTasksMentee.filter(task => task[2] === "Reviewed");
    const getReviewedMentorTasks = (): string[][] => AllTasksMentor.filter(task => task[2].includes("Reviewed"));
    const getPendingMentorTasks = (): string[][] => AllTasksMentor.filter(task => task[2].includes("Pending"));

    const getTasksByToggle = (toggleIndex: number): string[][] => {
        if (ismentor) {
            if (toggleIndex === 0) return AllTasksMentor;
            if (toggleIndex === 1) return getReviewedMentorTasks();
            return getPendingMentorTasks();
        } else {
            if (toggleIndex === 0) {return AllTasksMentee;}
            if (toggleIndex === 1) return getSubmittedTasks();
            return getReviewedTasks();
        }
    };

    const [toggledTasks, setToggledTasks] = useState<string[][]>(getTasksByToggle(0));

    useEffect(() => {
        setToggledTasks(getTasksByToggle(toggles.findIndex(toggle => toggle === true) || 0));
    }, [userRole]);

    const getFilteredMentees = (): string[][][] => {
        if (!ismentor) return [];
        return toggledTasks.map(task => {
            const taskId = task[0];
            const originalTaskIndex = AllTasksMentor.findIndex(t => t[0] === taskId);
            return originalTaskIndex >= 0 ? AllMentees[originalTaskIndex] : [];
        });
    };

    function toggleState(index: number): void {
        const newToggles: boolean[] = [false, false, false];
        newToggles[index] = true;
        setToggles(newToggles);
        setToggledTasks(getTasksByToggle(index));
    }
    
    // Function to handle task click (for mentee)
    const handleTaskClick = (taskId: string) => {
        setSelectedTaskId(taskId);
        setShowReview(true);
    };
    
    // Function to handle mentee click (for mentor)
    const handleMenteeClick = (taskId: string, menteeId: string) => {
        setSelectedTaskId(taskId);
        setSelectedMenteeId(menteeId);
        setShowReview(true);
    };
    
    // Function to close the review component
    const handleCloseReview = () => {
        setShowReview(false);
    };

    if (!isLoggedIn) {
        return null; 
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
                            {ismentor ? "Pending Tasks" : "Reviewed"}
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