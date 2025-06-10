export interface LeaderboardEntry {
    position: number;
    name: string;
    points: string;
}

export async function fetchPlayerdata(trackid: number) {
    const data = await fetch("https://amapi.amfoss.in/leaderboard/" + 1);
    const response = await data.json();
    const players: LeaderboardEntry[] = response["leaderboard"].map((element: { mentee_name: string; total_points: number }, index: number) => ({
        position: index + 1,
        name: element.mentee_name,
        points: element.total_points,
    }));
    return players;
}
export async function fetchtrack() {
    const data = await fetch("https://amapi.amfoss.in/tracks/");    
    const response: { id: number; title: string }[] = await data.json();
    const tracks: { id: number; name: string }[] = response.map((element) => ({
        id: element.id,
        name: element.title,
    }));
    return tracks;
}