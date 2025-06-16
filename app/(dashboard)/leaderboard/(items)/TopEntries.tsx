export interface LeaderboardEntry {
    position: number;
    name: string;
    points: string;
}

export default function TopEntry({ Data }: { Data: LeaderboardEntry[] }) {
    // Don't render if there are no entries
    if (!Data || Data.length === 0) {
        return null;
    }

    const first = Data[0];
    const second = Data.length > 1 ? Data[1] : null;
    const third = Data.length > 2 ? Data[2] : null;

    return (
        <div className="flex justify-center text-center text-black items-end mb-12 space-x-6">
            {/* Second place - only show if exists */}
            {second && (
                <div className="flex flex-col items-center w-64">
                    <div className="bg-grey w-full h-48 flex flex-col items-center justify-center text-2xl font-bold rounded-t-md shadow-lg">
                        <span className="mb-2">{second.name}</span>
                        <span className="text-lg font-medium">{second.points} points</span>
                    </div>
                </div>
            )}
            
            {/* First place - always show if data exists */}
            <div className="flex flex-col items-center w-64">
                <div className="bg-primary-yellow w-full h-72 flex flex-col items-center justify-center text-2xl font-bold rounded-t-md shadow-lg">
                    <span className="mb-2">{first.name}</span>
                    <span className="text-lg font-medium">{first.points} points</span>
                </div>
            </div>
            
            {/* Third place - only show if exists */}
            {third && (
                <div className="flex flex-col items-center w-64">
                    <div className="bg-dark-red w-full h-32 flex flex-col items-center justify-center text-2xl font-bold rounded-t-md shadow-lg">
                        <span className="mb-2">{third.name}</span>
                        <span className="text-lg font-medium">{third.points} points</span>
                    </div>
                </div>
            )}
        </div>
    );
};