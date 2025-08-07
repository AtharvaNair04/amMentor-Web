'use client';

import { useRouter } from 'next/navigation';

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: string | number | null;
    id: number;
}

interface CurrentTaskProps {
    mentor?: boolean;
    task?: Task | null;
    isLoading:boolean;
    status?: string;
}

export default function CurrentTask({ mentor = false, task, status , isLoading }: CurrentTaskProps) {
    const router = useRouter();
    
    const formatDeadline = (deadline: string | number | null): string => {
        if (!deadline) return "";
        if (typeof deadline === 'number') return `${deadline} days`;
        return deadline;
    };

    const getButtonText = (): string => {
        if (mentor) {
            return status === 'Submitted' ? "Review Work" : "View Task";
        } else {
            if (status === 'Reviewed') return "View Feedback";
            if (status === 'Submitted') return "View Submission";
            return "Start Task"; 
        }
    };

    const getButtonColor = (): string => {
        if (status === 'Reviewed') return "bg-green-600";
        if (status === 'Submitted') return "bg-blue-600";
        return "bg-dark-grey";
    };

    const handleTaskClick = () => {
        if (task) {
            const taskNumber = task.task_no; 
            router.push(`/submission?page=${taskNumber}`);
        }
    };

    if (!task) {
        return (
            <div className="flex flex-col sm:flex-row h-auto sm:h-40 md:h-48 rounded-xl md:rounded-3xl text-white w-full bg-deeper-grey justify-center items-center p-4 md:px-8 md:py-3">
                <div className="text-center">
                    {isLoading?
                    <div className="loader m-auto"></div>:
                    <div>
                        <h2 className="font-bold text-lg sm:text-xl text-primary-yellow md:text-2xl">No Current Task</h2>
                        <p className="text-sm sm:text-base mt-2">
                            {mentor ? "No submitted tasks to review" : "All tasks completed! Great job!"}
                        </p>
                    </div>
                    }
                </div>
            </div>
        );
    }

    return (
        <div 
            className="flex flex-col sm:flex-row h-auto sm:h-40 md:h-48 rounded-xl md:rounded-3xl text-black w-full bg-primary-yellow justify-between p-4 md:px-8 md:py-3 cursor-pointer hover:bg-yellow-400 transition-colors duration-200"
            onClick={handleTaskClick}
        >
            <div className="h-full mb-4 sm:mb-0">
                <h3 className="font-bold text-xs sm:text-sm md:text-base">
                    {mentor ? "LATEST SUBMITTED TASK" : 
                     (status ? "CURRENT TASK" : "NEXT TASK")}
                </h3>
                <h2 className="font-bold text-lg sm:text-xl md:text-3xl mt-1 sm:mt-2 md:mt-5">
                    Task-{(task.task_no + 1).toString().padStart(2, '0')}
                </h2>
                <h1 className="font-extralight text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-tight">
                    {task.title.toUpperCase()}
                </h1>
            </div>
            <div className="h-full flex flex-col justify-evenly">
                <div>
                    <h2 className="text-xs text-center sm:text-sm md:text-base">
                        Deadline: {formatDeadline(task.deadline)}
                    </h2>
                    {status && (
                        <div className="mt-2 flex justify-center items-center">
                            <span className={`px-4 py-1 rounded text-xs font-bold ${
                                status === 'Reviewed' ? 'bg-green-200 text-green-800' :
                                status === 'Submitted' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                            }`}>
                                {status}
                            </span>
                        </div>
                    )}
                </div>
                <button 
                    className={`${getButtonColor()} text-white font-extrabold rounded-xl md:rounded-3xl pb-1 mt-2 sm:mt-1 md:mt-0 hover:opacity-80 transition-opacity duration-200`}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        handleTaskClick();
                    }}
                >
                    <div className="bg-deep-grey rounded-xl md:rounded-3xl px-3 sm:px-4 md:px-5 py-2 md:py-3">
                        <h1 className="text-sm sm:text-base">{getButtonText()}</h1>
                    </div>
                </button>
            </div>
        </div>
    );
}