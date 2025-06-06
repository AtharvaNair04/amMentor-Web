export interface LeaderboardEntry {
    position: number;
    name: string;
    points: string;
}

export default function TopEntry({ Data }: { Data: LeaderboardEntry[] }) {
    return (
        <div className="flex justify-center text-center text-black items-end mb-12 space-x-6">
            <div className="flex flex-col items-center w-64">
                <div className="bg-grey w-full h-48 flex flex-col items-center justify-center  text-2xl font-bold rounded-t-md shadow-lg">
                    <span className="mb-2">{Data[1].name}</span>
                    <span className="text-lg font-medium">{Data[1].points} points</span>
                </div>
            </div>
            <div className="flex flex-col items-center w-64">
                <div className="bg-primary-yellow w-full h-72 flex flex-col items-center justify-center text-2xl font-bold rounded-t-md shadow-lg">
                    <span className="mb-2">{Data[0].name}</span>
                    <span className="text-lg font-medium">{Data[0].points} points</span>
                </div>
            </div>
            <div className="flex flex-col items-center w-64">
                <div className="bg-dark-red w-full h-32 flex flex-col items-center justify-center text-2xl font-bold rounded-t-md shadow-lg">
                    <span className="mb-2">{Data[2].name}</span>
                    <span className="text-lg font-medium">{Data[2].points} points</span>
                </div>
            </div>
        </div>
    );
};
