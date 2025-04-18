import Link from "next/link";

const dashboardPage = () => {
    const ismentor = true;

    //to be replaced
    const mentees = [];
    for(let i=0;i<5;i++){
        mentees.push(<option key={i}>Mentee {i+1}</option>)
    }
    //==================


    if(ismentor){
        return (
            <div className="text-white">
                {/* Top Welcome */}
                <div className="h-full w-full m-auto  scrollbar-hide  max-w-[80rem]">
                    <div className="flex justify-between">
                        <div className="flex text-3xl gap-1"><h1>Welcome,  </h1><h1 className="text-primary-yellow">Mentor</h1></div>
                        <select className="bg-deeper-grey rounded-lg text-primary-yellow px-6 py-3">
                            {mentees}
                        </select>
                    </div>
                    <div className="flex justify-between mt-10">
                        <CurrentTask mentor={true} />
                    </div>
                    <div className="flex justify-between mt-10">
                        <div className="flex flex-col gap-2 w-[46%]">
                            <PlayerStats/>
                            <Badges/>
                            <PlayerProgress/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-5 justify-between ">
                                <UpcomingTask height={11}/>
                                <ReviewedTask height={11}/>
                            </div>
                            <FeedbackProvided/>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
    else{
        return (
            <div className="text-white">
                {/* Top Welcome */}
                <div className="h-full w-full m-auto py-7 scrollbar-hide  max-w-[80rem]">
                    <div className="flex justify-between">
                        <div className="flex text-3xl  gap-1"><h1>Welcome,  </h1><h1 className="text-primary-yellow">Mentee</h1></div>
                        <Link href="/track" className="text-primary-yellow underline">Change Track</Link>
                    </div>
                    <div className="flex justify-between mt-10">
                        <CurrentTask />
                        
                    </div>
                    <div className="flex justify-between mt-10">
                        <div className="flex flex-col gap-2 w-[46%]">
                            <UpcomingTask/>
                            <Badges/>
                        </div>
                        <div className="flex flex-col gap-12">
                            <PlayerStats/>
                            <ReviewedTask height={11}/>
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }    
};




function CurrentTask({mentor=false}:{mentor?:boolean}){
    return(
        <div className="flex h-48 rounded-3xl text-black w-full bg-primary-yellow justify-between px-8 py-3">
            <div className="h-full">
                <h3 className="font-bold">CURRENT TASK</h3>
                <h2 className="font-bold text-3xl mt-5">Task-09</h2>
                <h1 className="font-extralight text-6xl">MAKING A WEBSITE IN NEXT.JS</h1>
            </div>
            <div className="h-full flex flex-col justify-evenly">
                <h2>Deadline:XX-XX-XXXX</h2>
                <h2>Days left:X days</h2>
                <button className="bg-dark-grey text-white font-extrabold rounded-3xl pb-1">
                    <div className="bg-deep-grey rounded-3xl px-5 py-3">
                        <h1>{mentor?"Review Work":"Submit Work"}</h1>
                    </div>
                </button>
            </div>
        </div>
    );
}


function ReviewedTask({height=11}:{height?:number}){
    //to be replaced
    const tasks = [];
    for(let i=0;i<20;i++){
        tasks.push(
        <div 
        key={i} 
        className="bg-deep-grey rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-3 hover:text-black">
                <h1>01</h1>
                <h1>Tasks Name</h1>
            </div>
        </div>
        )
    }
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-3xl p-3 pb-5">
        <h1 className="text-white font-bold text-xl px-16 p-4">REVIEWED TASKS</h1>
        <div className={`h-[${height}rem] overflow-y-auto scrollbar-hide flex flex-col gap-3`}>
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
        className="bg-deep-grey rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-3 hover:text-black">
                <h1>TASK:0{i}</h1>
                <h1>Feedback</h1>
            </div>
        </div>
        )
    }
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-3xl p-3 pb-5 mt-2">
        <h1 className="text-white font-bold text-xl px-16 p-4">FEEDBACK PROVIDED</h1>
        <div className={`h-[11rem] overflow-y-auto scrollbar-hide flex flex-col gap-3`}>
            {tasks}
        </div>
    </div>
    );
}




function UpcomingTask({height=11}:{height?:number}){
    //to be replaced
    const tasks = [];
    for(let i=0;i<20;i++){
        tasks.push(
        <div 
        key={i} 
        className="bg-deep-grey rounded-2xl font-bold hover:bg-primary-yellow">
            <div className="flex justify-between p-3 hover:text-black">
                <h1>01</h1>
                <h1>Tasks Name</h1>
            </div>
        </div>
        )
    }
    //----------------------
    return(
    <div className="bg-deeper-grey rounded-3xl p-3 pb-5">
        <h1 className="text-white font-bold text-xl px-16 p-4">UPCOMING TASKS</h1>
        <div className={`h-[${height}rem]  overflow-y-auto scrollbar-hide flex flex-col gap-3`}>
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
    <div className="flex gap-9">
        <div className="bg-primary-yellow rounded-3xl p-8 text-black">
            <h2 className="font-bold text-xl text-center underline px-9 mb-4">YOUR RANK</h2>
            <h1 className="font-extralight text-7xl text-center">#{rank}</h1>
        </div>
        <div className="bg-primary-yellow rounded-3xl p-8 text-black">
            <h2 className="font-bold text-xl text-center underline px-9 mb-4">POINTS EARNED</h2>
            <h1 className="font-extralight text-7xl text-center">{points}</h1>
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
        <div className="flex mt-3">
            <div className="bg-deeper-grey rounded-3xl p-8 flex-grow">
                <h2 className="font-bold text-xl px-9 mb-4">MENTEE PROGRESS</h2>
                <div className="bg-deep-grey rounded-full h-8">
                    <div className={`bg-primary-yellow rounded-full h-8`} style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
                <h2 className="font-bold text-primary-yellow text-lg px-9 text-right pt-3">{points}/{totalpoints} points</h2>
            </div>
        </div>
    );
}


function Badges(){
    const badge=[];
    for(let i = 0; i < 4; i++){
        badge.push(
            <div className="bg-deep-grey rounded-full w-20 h-20" key={i}>
            </div>
        )
    }
    return(
        <div className="">
            <h1 className="text-white font-bold text-xl p-4">BADGES EARNED</h1>
            <div className="flex gap-12 p-4 px-7  bg-deeper-grey rounded-3xl justify-center overflow-hidden">
                {badge}
            </div>
        </div>
    )
}








export default dashboardPage;