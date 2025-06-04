
function ReviewedTask({reviewed_tasks}:{reviewed_tasks:string[][]}){
    const tasks = reviewed_tasks.map((task) => (
        <div 
            key={task[0]}
            className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>{task[0]}</h1> {/* Task ID */}
                <h1>{task[1]}</h1> {/* Task Title */}
            </div>
        </div>
    ));

    return(
        <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">REVIEWED TASKS</h1>
            <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
                {tasks.length > 0 ? tasks : <div className="text-gray-400 text-center p-4">No reviewed tasks</div>}
            </div>
        </div>
    );
}

function UpcomingTask({upcoming_tasks}:{upcoming_tasks:string[][]}){
    const tasks = upcoming_tasks.map((task) => (
        <div 
            key={task[0]} 
            className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>{task[0]}</h1> {/* Task ID */}
                <h1>{task[1]}</h1> {/* Task Title */}
            </div>
        </div>
    ));
    return(
        <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">UPCOMING TASKS</h1>
            <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
                {tasks.length > 0 ? tasks : <div className="text-gray-400 text-center p-4">No upcoming tasks</div>}
            </div>
        </div>
    );
}



function FeedbackProvided(){
    const tasks = [];
    for(let i=0;i<20;i++){
        tasks.push(
        <div 
        key={i} 
        className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>TASK:0{i}</h1>
                <h1>Feedback</h1>
            </div>
        </div>
        )
    }
    return(
    <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 mt-2">
        <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">FEEDBACK PROVIDED</h1>
        <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
            {tasks}
        </div>
    </div>
    );
}


export {ReviewedTask,FeedbackProvided,UpcomingTask};