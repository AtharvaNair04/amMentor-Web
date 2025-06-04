
export default function PlayerProgress({tasks,totaltasks}:{tasks:number,totaltasks:number}) {
    const progressPercentage = (tasks / totaltasks) * 100;
    
    return (
        <div className="flex mt-2 sm:mt-3">
            <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 flex-grow">
                <h2 className="font-bold text-base sm:text-lg md:text-xl px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">MENTEE PROGRESS</h2>
                <div className="bg-deep-grey rounded-full h-4 sm:h-6 md:h-8">
                    <div className={`bg-primary-yellow rounded-full h-4 sm:h-6 md:h-8`} style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
                <h2 className="font-bold text-primary-yellow text-sm sm:text-base md:text-lg px-1 sm:px-2 md:px-6 lg:px-9 text-right pt-1 sm:pt-2 md:pt-3">{tasks}/{totaltasks} tasks complete</h2>
            </div>
        </div>
    );
}

