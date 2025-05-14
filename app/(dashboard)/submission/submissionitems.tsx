'use client'
import { useState } from "react";
import { User,Clock, File } from "lucide-react";
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
        const menteeId = mentees[taskIndex][menteeIndex][0];
        onMenteeClick(taskId, menteeId);
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
                            className={`flex flex-wrap justify-evenly p-3 sm:p-4 ${highted_task == i && !isMentor && "text-black"} text-sm sm:text-base`}
                            onClick={() => toggleExpand(i)}
                        >
                            {task.map((item, j) => (
                                <h1 
                                    className={`text-xs sm:text-sm md:text-lg lg:text-2xl 
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
                                    <div 
                                        key={j} 
                                        className={`text-xs sm:text-sm md:text-lg px-3 sm:px-5 border-2 bg-deep-grey border-deep-grey sm:py-4 rounded-lg cursor-pointer`}
                                        onClick={() => handleMenteeClick(i, j)}
                                    >
                                        <div className="flex gap-3  sm:gap-5">
                                            <User size={36} />
                                            <div>
                                                <div className="flex justify-between mb-2 gap-4">
                                                    <h1 className="font-semibold">{mentee[0]}</h1>
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={20} />
                                                        <h1 className="text-sm">{mentee[1]}</h1>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <File size={20} />
                                                        <h1 className="text-sm">{mentee[2]}</h1>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h2 
                                                className={`text-center rounded-full px-3 py-1 
                                                ${mentee[3] == "Submitted" && "bg-primary-yellow text-black"} 
                                                ${mentee[3].includes("Reviewed") && "bg-[#40991f] text-white"} 
                                                ${mentee[3].includes("Not Submitted") && "bg-deeper-grey"}`}
                                            >
                                                {mentee[3]}
                                            </h2>
                                    </div>
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