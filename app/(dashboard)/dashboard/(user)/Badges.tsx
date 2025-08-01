
export default function Badges(){
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
            <div className="hover:scale-105 transition-transform flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 p-2 sm:p-3 md:p-4 px-1 sm:px-2 md:px-4 lg:px-7 bg-deeper-grey rounded-xl md:rounded-3xl justify-center overflow-hidden">
                {badge}
            </div>
        </div>
    )
}