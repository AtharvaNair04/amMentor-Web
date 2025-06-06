'use client'
import { User, Clock, File } from "lucide-react";



const MenteeCard = ({ mentee, onClick }: { mentee: string[]; onClick: () => void;}) => {
    return (
        <div 
            className={`text-xs sm:text-sm md:text-lg px-3 sm:px-5 border-2 bg-deep-grey border-deep-grey sm:py-4 rounded-lg cursor-pointer`}
            onClick={onClick}
        >
            <div className="flex gap-3 sm:gap-5">
                <User size={36} />
                <div>
                    <div className="flex justify-between mb-2 gap-4">
                        <h1 className="font-semibold">{mentee[0]}</h1>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1">
                            <Clock size={20} />
                            <h1 className="text-sm">{mentee[1]}</h1>
                        </div>
                        <div className="flex items-center gap-1">
                            <File size={20} />
                            <h1 className="text-sm">{mentee[2]}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <h2 
                className={`text-center rounded-full px-3 py-1 
                ${mentee[3] == "Submitted" && "bg-primary-yellow text-black"} 
                ${mentee[3].includes("Reviewed") && "bg-[#40991f] text-white"} 
                ${mentee[3].includes("Not Submitted") && "bg-deeper-grey"}`}
            >
                {mentee[3]}
            </h2>
        </div>
    );
};

export default MenteeCard;