'use client'
import { useState } from "react";
import MenteeCard from "@/app/components/layout/MenteeCard";

interface TasksViewerProps {
    isMentor: boolean; 
    tasks: string[][]; 
    highted_task: number; 
    mentees: string[][][];
    onTaskClick: (taskId: string) => void;
    onMenteeClick: (taskId: string, menteeId: string) => void;
}

const TasksViewer = ({ isMentor, tasks, highted_task, mentees = [], onTaskClick, onMenteeClick }: TasksViewerProps) => {
    const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);
    
    const toggleExpand = (index: number) => {
        if (isMentor) {
            setExpandedTaskIndex(expandedTaskIndex === index ? null : index);
        } else {
            // For mentees, directly open the review component
            const taskId = tasks[index][0];
            onTaskClick(taskId);
        }
    };
    
    const handleMenteeClick = (taskIndex: number, menteeIndex: number) => {
        const taskId = tasks[taskIndex][0];
        const menteeEmail = mentees[taskIndex][menteeIndex][1];
        onMenteeClick(taskId, menteeEmail);
    };
    
    return (
        <div className="p-2 sm:p-3 pb-4 sm:pb-5">
            <div className="overflow-x-visible flex flex-col gap-2 sm:gap-3">
                {tasks.map((task, i) => (
                    <div 
                        key={i}
                        className={`bg-deeper-grey rounded-xl transition-transform hover:scale-[103%] font-bold ${highted_task == i && !isMentor && "bg-primary-yellow"}`}
                    >
                        <div
                            className={`grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 items-center ${highted_task == i && !isMentor && "text-black"} text-sm sm:text-base`}
                            onClick={() => toggleExpand(i)}
                        >
                            {task.map((item, j) => (
                                <h1 
                                    className={`text-xs sm:text-sm md:text-lg lg:text-2xl
                                        ${j === 0 ? "text-left pl-14" : j === 1 ? "text-center" : "text-right pr-14"}
                                        ${item.includes("Reviewed") && "text-green"} 
                                        ${item.includes("Submitted") && "text-primary-yellow"} 
                                        ${item.includes("Pending") && "text-primary-yellow"}`}
                                    key={j}
                                >
                                    {item}
                                </h1>
                            ))}
                        </div>
                        {mentees.length > 0 && mentees[i] && mentees[i].length > 0 && expandedTaskIndex === i && (
                            <div className="flex flex-wrap justify-evenly p-3 sm:p-4">
                                {mentees[i].map((mentee, j) => (
                                    <MenteeCard
                                        key={j}
                                        mentee={mentee}
                                        onClick={() => handleMenteeClick(i, j)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksViewer;