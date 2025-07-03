'use client'

interface TasksViewerProps {
    isMentor: boolean; 
    tasks: string[][]; 
    highted_task: number; 
    mentees: string[][][];
    onTaskClick: (taskId: string) => void;
    onMenteeClick: (taskId: string, menteeId: string) => void;
}

const TasksViewer = ({ isMentor, tasks, highted_task, onTaskClick }: TasksViewerProps) => {
    const toggleExpand = (index: number) => {
        if (isMentor) {
            // For mentors, since there's only one mentee (the selected one), go directly to review
            const taskId = tasks[index][0];
            onTaskClick(taskId);
        } else {
            // For mentees, directly open the review component
            const taskId = tasks[index][0];
            onTaskClick(taskId);
        }
    };
    
    return (
        <div className="p-2 sm:p-3 pb-4 sm:pb-5">
            <div className="overflow-x-visible flex flex-col scrollbar-hide gap-2 sm:gap-3">
                {tasks.map((task, i) => (
                    <div 
                        key={i}
                        className={`bg-deeper-grey rounded-xl transition-transform hover:scale-[103%] font-bold ${highted_task == i && !isMentor && "bg-primary-yellow"}`}
                    >
                        <div
                            className={`grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 items-center ${highted_task == i && !isMentor && "text-black"} text-sm sm:text-base cursor-pointer`}
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
                        {/* Mentee expansion is now removed since mentors go directly to review */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksViewer;