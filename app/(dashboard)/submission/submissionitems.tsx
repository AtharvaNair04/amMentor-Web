'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";




const TasksViewer = ({ isMentor,tasks, highted_task, mentees = [] }: { isMentor:boolean, tasks: string[][], highted_task: number, mentees: string[][][] }) => {
    const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);
    const router = useRouter();
    const toggleExpand = (index: number) => {
        if(isMentor){
            setExpandedTaskIndex(expandedTaskIndex === index ? null : index);
        }
        else{
            //Might wanna change
            router.push('/submit')
        }
    };
    
    return (
        <div className="p-2 sm:p-3 pb-4 sm:pb-5">
            <div className="overflow-x-visible flex flex-col gap-2 sm:gap-3">
                {tasks.map((task, i) => (
                    <div 
                        key={i}
                        className={`bg-deeper-grey rounded-xl transition-transform hover:scale-[103%] font-bold ${highted_task == i && "bg-primary-yellow"}`}
                    >
                        <div 
                            className={`flex flex-wrap justify-evenly p-3 sm:p-4 ${highted_task == i && "text-black"} text-sm sm:text-base`}
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
                            <div className="flex flex-wrap justify-evenly p-3 sm:p-4" onClick={() => {router.push('/submit')}}>
                                {mentees[i].map((mentee, j) => (
                                    <div key={j} className={` mt-2 flex gap-3 sm:gap-5 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-2 border-2 border-deeper-grey sm:py-4 rounded-lg ${mentee[1] == "Submitted" && "bg-primary-yellow text-black"} ${mentee[1].includes("Reviewed") && "bg-green text-black"} ${mentee[1].includes("Not Submitted") && "bg-deep-grey"}`}>
                                        <h1>{mentee[0]}</h1>
                                        <h2>{mentee[1]}</h2>
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