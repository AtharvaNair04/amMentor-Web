import Link from "next/link";

const DashboardPage = () => {

    //Toggle mentor mentee----------
    const ismentor = false;
    //--------------------------

    // Generate mentee options
    const mentees = [];
    for(let i=0; i<5; i++){
        mentees.push(<option key={i}>Mentee {i+1}</option>);
    }
    //--------------------
    if(ismentor){
        return (
            <div className="text-white p-4 md:p-2 lg:p-0">
                {/* Top Welcome */}
                <div className="h-full w-full m-auto scrollbar-hide max-w-[80rem]">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex text-xl sm:text-2xl md:text-3xl gap-1 mb-4 sm:mb-0">
                            <h1>Welcome, </h1>
                            <h1 className="text-primary-yellow">Mentor</h1>
                        </div>
                        <select className="bg-deeper-grey rounded-lg text-primary-yellow px-3 py-2 sm:px-4 md:px-6 md:py-3 w-full sm:w-auto mb-6 sm:mb-0">
                            {mentees}
                        </select>
                    </div>
                    <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                        <CurrentTask mentor={true} />
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                        <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                            <PlayerStats />
                            <Badges />
                            <PlayerProgress />
                        </div>
                        <div className="flex flex-col gap-4 w-full lg:w-[50%]">
                            <div className="flex flex-col sm:flex-row gap-5 justify-between">
                                <div className="w-full sm:w-1/2">
                                    <UpcomingTask />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <ReviewedTask />
                                </div>
                            </div>
                            <FeedbackProvided />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="text-white p-4 md:p-2 lg:p-0">
                {/* Top Welcome */}
                <div className="h-full w-full m-auto py-4 md:py-7 scrollbar-hide max-w-[80rem]">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex text-xl sm:text-2xl md:text-3xl gap-1 mb-4 sm:mb-0">
                            <h1>Welcome, </h1>
                            <h1 className="text-primary-yellow">Mentee</h1>
                        </div>
                        <Link href="/track" className="text-primary-yellow underline mb-6 sm:mb-0">
                            Change Track
                        </Link>
                    </div>
                    <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                        <CurrentTask />
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                        <div className="flex flex-col gap-6 md:gap-12 w-full lg:w-[48%]">
                            <PlayerStats />
                            <ReviewedTask />
                        </div>
                        <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                            <UpcomingTask />
                            <Badges />
                        </div>
                    </div>
                </div>
            </div>
        );
    }    
};

function CurrentTask({mentor=false}:{mentor?:boolean}){
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

function ReviewedTask(){
    //to be replaced
    const tasks = [];
    for(let i=0;i<20;i++){
        tasks.push(
        <div 
        key={i} 
        className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>01</h1>
                <h1>Tasks Name</h1>
            </div>
        </div>
        )
    }
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
        <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">REVIEWED TASKS</h1>
        <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
            {tasks}
        </div>
    </div>
    );
}

function FeedbackProvided(){
    //to be replaced
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
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 mt-2">
        <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">FEEDBACK PROVIDED</h1>
        <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
            {tasks}
        </div>
    </div>
    );
}

function UpcomingTask(){
    //to be replaced
    const tasks = [];
    for(let i=0;i<20;i++){
        tasks.push(
        <div 
        key={i} 
        className="bg-deep-grey rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-2 sm:p-3 hover:text-black text-sm sm:text-base">
                <h1>01</h1>
                <h1>Tasks Name</h1>
            </div>
        </div>
        )
    }
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-2 sm:p-3 pb-4 sm:pb-5 w-full">
        <h1 className="text-white font-bold text-base sm:text-lg md:text-xl px-2 sm:px-4 md:px-16 p-1 sm:p-2 md:p-4">UPCOMING TASKS</h1>
        <div className={`h-48 sm:h-56 md:h-44 overflow-y-auto scrollbar-hide flex flex-col gap-2 sm:gap-3`}>
            {tasks}
        </div>
    </div>
    );
}

function PlayerStats(){
    // To be replaced
    const rank = 13;
    const points = 3000;
    return(
    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-9 w-full">
        <div className="bg-primary-yellow rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-black flex-1">
            <h2 className="font-bold text-base sm:text-lg md:text-xl text-center underline px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">YOUR RANK</h2>
            <h1 className="font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center">#{rank}</h1>
        </div>
        <div className="bg-primary-yellow rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-black flex-1">
            <h2 className="font-bold text-base sm:text-lg md:text-xl text-center underline px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">POINTS EARNED</h2>
            <h1 className="font-extralight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center">{points}</h1>
        </div>
    </div>
    );
}

function PlayerProgress() {
    // To be replaced
    const points = 3000;
    const totalpoints = 5000;
    const progressPercentage = (points / totalpoints) * 100;
    
    return (
        <div className="flex mt-2 sm:mt-3">
            <div className="bg-deeper-grey rounded-xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 flex-grow">
                <h2 className="font-bold text-base sm:text-lg md:text-xl px-1 sm:px-2 md:px-6 lg:px-9 mb-1 sm:mb-2 md:mb-4">MENTEE PROGRESS</h2>
                <div className="bg-deep-grey rounded-full h-4 sm:h-6 md:h-8">
                    <div className={`bg-primary-yellow rounded-full h-4 sm:h-6 md:h-8`} style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
                <h2 className="font-bold text-primary-yellow text-sm sm:text-base md:text-lg px-1 sm:px-2 md:px-6 lg:px-9 text-right pt-1 sm:pt-2 md:pt-3">{points}/{totalpoints} points</h2>
            </div>
        </div>
    );
}

function Badges(){
    const badge=[];
    for(let i = 0; i < 4; i++){
        badge.push(
            <div className="bg-deep-grey rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" key={i}>
            </div>
        )
    }
    return(
        <div className="">
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl p-1 sm:p-2 md:p-4">BADGES EARNED</h1>
            <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 p-2 sm:p-3 md:p-4 px-1 sm:px-2 md:px-4 lg:px-7 bg-deeper-grey rounded-xl md:rounded-3xl justify-center overflow-hidden">
                {badge}
            </div>
        </div>
    )
}

export default DashboardPage;