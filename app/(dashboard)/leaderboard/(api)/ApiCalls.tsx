export interface LeaderboardEntry {
    position: number;
    name: string;
    points: string;
}

export async function fetchPlayerdata(trackid: number) {
    // Use the trackid parameter instead of hardcoded 1
    const data = await fetch("https://praveshan.ganidande.com/leaderboard/" + trackid);
    const response = await data.json();
    const players: LeaderboardEntry[] = response["leaderboard"].map((element: { mentee_name: string; total_points: number }, index: number) => ({
        position: index + 1,
        name: element.mentee_name,
        points: element.total_points,
    }));
    return players;
}

export async function fetchtrack() {
    const data = await fetch("https://praveshan.ganidande.com/tracks/");    
    const response: { id: number; title: string }[] = await data.json();
    const tracks: { id: number; name: string }[] = response.map((element) => ({
        id: element.id,
        name: element.title,
    }));
    return tracks;
}