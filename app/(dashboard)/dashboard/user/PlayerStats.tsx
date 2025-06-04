
export default function PlayerStats({rank,points}:{rank:number,points:number}){
    return(
    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-9 w-full">
        <div className="bg-primary-yellow rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-black flex-1">
            <h2 className="font-bold text-base sm:text-lg md:text-xl text-center underline px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">TASKS COMPLETED</h2>
            <h1 className="font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center">#{rank}</h1>
        </div>
        <div className="bg-primary-yellow rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-black flex-1">
            <h2 className="font-bold text-base sm:text-lg md:text-xl text-center underline px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">POINTS EARNED</h2>
            <h1 className="font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center">{points}</h1>
        </div>
    </div>
    );
}