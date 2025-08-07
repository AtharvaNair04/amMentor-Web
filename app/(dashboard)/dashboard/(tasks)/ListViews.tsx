function ReviewedTask({reviewed_tasks, isLoading}:{reviewed_tasks:string[][] ,isLoading:boolean }){
    const tasks = reviewed_tasks.map((task) => (
        <div 
            key={task[0]}
            className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>Task-{task[0].padStart(2, '0')}</h1> {/* Formatted Task ID */}
                <h1>{task[1]}</h1> {/* Task Title */}
            </div>
        </div>
    ));

    return(
        <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">REVIEWED TASKS</h1>
            <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
                {tasks.length > 0 ? tasks : isLoading? <div className="loader m-auto"></div>:<div className="text-gray-400 text-center p-4">Not applicable for praveshan</div>}
            </div>
        </div>
    );
}

function UpcomingTask({upcoming_tasks, isLoading}:{upcoming_tasks:string[][],isLoading:boolean}){
    const tasks = upcoming_tasks.map((task) => (
        <div 
            key={task[0]} 
            className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>Task-{task[0].padStart(2, '0')}</h1> {/* Formatted Task ID */}
                <h1>{task[1]}</h1> {/* Task Title */}
            </div>
        </div>
    ));
    return(
        <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">UPCOMING TASKS</h1>
            <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
                {isLoading?<div className="loader m-auto"></div>:
                tasks.length > 0 ? tasks : <div className="text-gray-400 text-center p-4">No upcoming tasks</div>}
            </div>
        </div>
    );
}

// Define interface for submission data
interface SubmissionData {
    id: number;
    task_id: number;
    task_no: number;
    task_name: string;
    status: string;
    mentor_feedback?: string;
    feedback?: string;
    submitted_at?: string;
    reviewed_at?: string;
    approved_at?: string;
    // Add other submission properties as needed
}

// Define interface for Task data
interface Task {
    id: number;
    title: string;
    // Add other task properties as needed
}

// Updated FeedbackProvided component to use proper typing
function FeedbackProvided({ selectedMentee, menteeSubmissions }: {
    selectedMentee: string | null;
    menteeSubmissions: Record<string, SubmissionData[]>;
    tasks: Task[];
}) {
    // Get submissions with feedback for the selected mentee
    const getFeedbackTasks = () => {
        if (!selectedMentee || !menteeSubmissions[selectedMentee]) return [];
        
        return menteeSubmissions[selectedMentee]
            .filter(submission => 
                submission.mentor_feedback && 
                submission.mentor_feedback.trim() !== '' &&
                submission.mentor_feedback !== null
            )
            .map(submission => (
                <div 
                    key={submission.id}
                    className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow group"
                >
                    <div className="flex justify-between p-2 sm:p-3 group-hover:text-black text-sm sm:text-base">
                        <div className="flex flex-col">
                            <h1 className="font-bold">TASK:{submission.task_no.toString().padStart(2, '0')}</h1>
                            <h2 className="text-xs opacity-80 font-normal">{submission.task_name}</h2>
                        </div>
                        <div className="flex flex-col text-right">
                            <h1 className="font-bold">{submission.status}</h1>
                            {submission.approved_at && (
                                <span className="text-xs opacity-80 font-normal">
                                    {new Date(submission.approved_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="px-2 sm:px-3 pb-2 sm:pb-3">
                        <div className="bg-black/20 rounded p-2 text-xs sm:text-sm">
                            <p className="text-gray-300 group-hover:text-gray-700">
                                {submission.mentor_feedback && submission.mentor_feedback.length > 100 
                                    ? `${submission.mentor_feedback.substring(0, 100)}...` 
                                    : submission.mentor_feedback
                                }
                            </p>
                        </div>
                    </div>
                </div>
            ));
    };

    const feedbackTasks = getFeedbackTasks();

    return (
        <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 mt-2">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">
                FEEDBACK PROVIDED
            </h1>
            <div className="h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3">
                {feedbackTasks.length > 0 ? feedbackTasks : (
                    <div className="text-gray-400 text-center p-4">
                        Not applicable for praveshan
                    </div>
                )}
            </div>
        </div>
    );
}

export {ReviewedTask,FeedbackProvided,UpcomingTask};