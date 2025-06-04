export default function CurrentTask({mentor=false}:{mentor?:boolean}){
    return(
        <div className="flex flex-col sm:flex-row h-auto sm:h-40 md:h-48 rounded-xl md:rounded-3xl text-black w-full bg-primary-yellow justify-between p-4 md:px-8 md:py-3">
            <div className="h-full mb-4 sm:mb-0">
                <h3 className="font-bold text-xs sm:text-sm md:text-base">CURRENT TASK</h3>
                <h2 className="font-bold text-lg sm:text-xl md:text-3xl mt-1 sm:mt-2 md:mt-5">Task-09</h2>
                <h1 className="font-extralight text-2xl sm:text-3xl md:text-5xl lg:text-6xl">MAKING A WEBSITE IN NEXT.JS</h1>
            </div>
            <div className="h-full flex flex-col justify-evenly">
                <h2 className="text-xs sm:text-sm md:text-base">Deadline:XX-XX-XXXX</h2>
                <h2 className="text-xs sm:text-sm md:text-base my-2 sm:my-1 md:my-0">Days left:X days</h2>
                <button className="bg-dark-grey text-white font-extrabold rounded-xl md:rounded-3xl pb-1 mt-2 sm:mt-1 md:mt-0">
                    <div className="bg-deep-grey rounded-xl md:rounded-3xl px-3 sm:px-4 md:px-5 py-2 md:py-3">
                        <h1 className="text-sm sm:text-base">{mentor?"Review Work":"Submit Work"}</h1>
                    </div>
                </button>
            </div>
        </div>
    );
}

