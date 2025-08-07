'use client';

import { ReviewedTask, FeedbackProvided, UpcomingTask } from "../(tasks)/ListViews";
import CurrentTask from "../(tasks)/CurrentTask";
import Badges from "../(user)/Badges";
import PlayerProgress from "../(user)/PlayerProgress";
import PlayerStats from "../(user)/PlayerStats";
import { JSX, useEffect, useMemo, useState, useCallback } from 'react';
import { useMentee } from "@/app/context/menteeContext";

interface Task {
    track_id: number;
    task_no: number;
    title: string;
    description: string;
    points: number;
    deadline: string;
    id: number;
}

interface TrackData {
    id: number;
    title: string;
}

interface MenteeDetails {
    tasks_completed: number;
    mentee_name: string;
    total_points: number;
    position: number;
}

interface SubmissionData {
    id: number;
    task_id: number;
    task_no: number;
    task_name: string;
    status: string;
    mentor_feedback?: string;
    feedback?: string;
    submitted_at?: string;
    reviewed_at?: string;
    approved_at?: string;
    // Add other submission properties as needed
}

const normalizeStatus = (status: string): string => {
    if (!status) return 'Not Started';
    
    const statusMap: { [key: string]: string } = {
        'submitted': 'Submitted',
        'approved': 'Reviewed',
        'rejected': 'Reviewed',
        'paused': 'Paused',
        'in progress': 'In Progress',
        'not started': 'Not Started'
    };
    
    const normalizedKey = status.toLowerCase();
    return statusMap[normalizedKey] || status;
};

const MentorDashboard = () => {
    const { 
        selectedMentee, 
        mentees, 
        setSelectedMentee, 
        isLoading: menteesLoading 
    } = useMentee();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [menteeDetails, setMenteeDetails] = useState<MenteeDetails>({
        mentee_name: "temp",
        total_points: 0,
        tasks_completed: 0,
        position: 0
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totaltask, settotaltask] = useState(0);
    const [menteeSubmissions, setMenteeSubmissions] = useState<Record<number, string>>({});
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [currentTrack, setCurrentTrack] = useState<{id: number; name: string} | null>(null);
    const [tracks, setTracks] = useState<{id: number; name: string}[]>([]);
    const [menteeFullSubmissions, setMenteeFullSubmissions] = useState<SubmissionData[]>([]);

    // Filter mentees based on search term
    const filteredMentees = useMemo(() => {
        if (!mentees || mentees.length === 0) return [];
        
        if (!searchTerm.trim()) return mentees;
        
        return mentees.filter(mentee => 
            mentee.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [mentees, searchTerm]);

    // Handle mentee search input
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);
        
        // If search is cleared, also clear selected mentee
        if (!value.trim()) {
            setSelectedMentee('');
        }
    }, [setSelectedMentee]);

    // Handle mentee selection from dropdown
    const handleMenteeSelect = useCallback((menteeName: string) => {
        setSelectedMentee(menteeName);
        setSearchTerm(menteeName);
        setShowDropdown(false);
    }, [setSelectedMentee]);

    // Handle input focus
    const handleInputFocus = useCallback(() => {
        setShowDropdown(true);
    }, []);

    // Handle input blur with delay to allow for clicks
    const handleInputBlur = useCallback(() => {
        setTimeout(() => setShowDropdown(false), 150);
    }, []);

    // Fetch available tracks
    const fetchTracks = useCallback(async () => {
        try {
            const response = await fetch('https://praveshan.ganidande.com/tracks/');
            if (!response.ok) throw new Error('Failed to fetch tracks');
            const tracksData: TrackData[] = await response.json();
            setTracks(tracksData.map((track: TrackData) => ({ id: track.id, name: track.title })));
            
            // Set initial track from session storage or default to track 1
            const savedTrack = sessionStorage.getItem('mentorCurrentTrack');
            if (savedTrack) {
                setCurrentTrack(JSON.parse(savedTrack));
            } else {
                const defaultTrack = { id: 1, name: tracksData.find((t: TrackData) => t.id === 1)?.title || 'Track 1' };
                setCurrentTrack(defaultTrack);
                sessionStorage.setItem('mentorCurrentTrack', JSON.stringify(defaultTrack));
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
            // Fallback to default track 1
            const defaultTrack = { id: 1, name: 'Track 1' };
            setCurrentTrack(defaultTrack);
            sessionStorage.setItem('mentorCurrentTrack', JSON.stringify(defaultTrack));
        }
    }, []);

    // Handle track change
    const handleTrackChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const trackId = parseInt(event.target.value);
        const selectedTrack = tracks.find(track => track.id === trackId);
        if (selectedTrack) {
            setCurrentTrack(selectedTrack);
            sessionStorage.setItem('mentorCurrentTrack', JSON.stringify(selectedTrack));
            // Reset current task when track changes
            setCurrentTask(null);
        }
    }, [tracks]);

    // Calculate submitted tasks count for the selected mentee
    const getSubmittedTasksCount = useCallback((): number => {
        if (!menteeSubmissions) return 0;
        
        return Object.values(menteeSubmissions).filter(status => 
            status === 'Submitted' || status === 'Reviewed'
        ).length;
    }, [menteeSubmissions]);

    const getCurrentTaskForMentee = useCallback((): Task | null => {
        if (!tasks.length || !menteeSubmissions) return null;
        
        // Find submitted tasks for the selected mentee
        const submittedTasks = tasks.filter(task => {
            const status = menteeSubmissions[task.id];
            return status === 'Submitted';
        });
        
        // Return the earliest (lowest ID) submitted task
        return submittedTasks.length > 0 ? submittedTasks[0] : null;
    }, [tasks, menteeSubmissions]);

    const getFormattedTasksForMentee = (): string[][] => {
        if (!menteeSubmissions) return [];
        
        return tasks.map((task) => {
            const status = menteeSubmissions[task.id] || 'Not Started';
            return [(task.task_no + 1).toString(), task.title, status];
        });
    };

    const getUpcomingMentorTasks = (): string[][] => {
        if (!selectedMentee) return [];
        
        const formattedTasks = getFormattedTasksForMentee();
        return formattedTasks.filter(task => {
            const status = task[2];
            return status === 'Not Started' || status === 'In Progress' || status === 'Paused';
        });
    };
    
    const getReviewedMentorTasks = (): string[][] => {
        if (!selectedMentee) return [];
        
        const formattedTasks = getFormattedTasksForMentee();
        return formattedTasks.filter(task => task[2] === 'Reviewed');
    };

    // Fetch submissions for only the selected mentee
    const fetchSelectedMenteeSubmissions = useCallback(async (menteeName: string, tasksList: Task[]) => {
        if (!menteeName) {
            setMenteeSubmissions({});
            setMenteeFullSubmissions([]);
            return;
        }

        // Find the mentee's email
        const mentee = mentees.find(m => m.name === menteeName);
        if (!mentee) {
            console.error(`Mentee not found: ${menteeName}`);
            return;
        }

        const statusResults: Record<number, string> = {};
        const fullSubmissionsResults: SubmissionData[] = [];
        
        // Group tasks by track_id to minimize API calls
        const tasksByTrack: Record<number, Task[]> = {};
        tasksList.forEach(task => {
            if (!tasksByTrack[task.track_id]) {
                tasksByTrack[task.track_id] = [];
            }
            tasksByTrack[task.track_id].push(task);
        });

        // Fetch submissions per track
        for (const [trackId, tasksInTrack] of Object.entries(tasksByTrack)) {
            try {
                const res = await fetch(`https://praveshan.ganidande.com/submissions/?email=${encodeURIComponent(mentee.email)}&track_id=${trackId}`);
                
                if (res.ok) {
                    const submissions: SubmissionData[] = await res.json();
                    
                    // Store full submissions for feedback
                    fullSubmissionsResults.push(...submissions);
                    
                    // Process all tasks for this track for status
                    tasksInTrack.forEach(task => {
                        const taskSubmission = submissions.find((s: SubmissionData) => s.task_id === task.id);
                        const rawStatus = taskSubmission?.status || 'Not Started';
                        const normalizedStatus = normalizeStatus(rawStatus);
                        statusResults[task.id] = normalizedStatus;
                    });
                } else {
                    // If API call fails, set all tasks in this track as 'Not Started'
                    tasksInTrack.forEach(task => {
                        statusResults[task.id] = 'Not Started';
                    });
                }
            } catch (error) {
                console.error(`Error fetching submissions for ${menteeName}, track ${trackId}:`, error);
                // Set all tasks in this track as 'Not Started' on error
                tasksInTrack.forEach(task => {
                    statusResults[task.id] = 'Not Started';
                });
            }
        }
        
        setMenteeSubmissions(statusResults);
        setMenteeFullSubmissions(fullSubmissionsResults);
    }, [mentees]);

    const fetchMenteeDetails = async (menteeName: string) => {
        try {
            const mentorTrack = sessionStorage.getItem("mentorCurrentTrack");
            const track: { id: number; name: string } = mentorTrack ? JSON.parse(mentorTrack) : { id: 1, name: "" };
            
            const data = await fetch(`https://praveshan.ganidande.com/leaderboard/${track.id}`);
            if (!data.ok) {
                throw new Error("Failed to fetch Points and Rank!");
            }
            const response = await data.json();
            const leaderboard: MenteeDetails[] = response['leaderboard'];
            
            // Find the mentee's position in the leaderboard
            const menteeIndex = leaderboard.findIndex(element => element.mentee_name === menteeName);
            const menteeDetail = leaderboard[menteeIndex];
            
            if (menteeDetail && menteeIndex !== -1) {
                setMenteeDetails({
                    ...menteeDetail,
                    position: menteeIndex + 1 // Add 1 because array is 0-indexed but rank starts from 1
                });
            } else {
                // Set default values if mentee not found in leaderboard
                setMenteeDetails({
                    mentee_name: menteeName,
                    total_points: 0,
                    tasks_completed: 0,
                    position: 0 // Default position when not found
                });
            }
        } catch (error) {
            console.error('Error fetching mentee details:', error);
            // Set default values on error
            setMenteeDetails({
                mentee_name: menteeName,
                total_points: 0,
                tasks_completed: 0,
                position: 0 // Default position on error
            });
        }
    };

    const fetchTasks = useCallback(async () => {
        try {
            const trackId = currentTrack?.id || 1; // Use current track or fallback to 1
            
            const response = await fetch(`https://praveshan.ganidande.com/tracks/${trackId}/tasks`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const tasksData: Task[] = await response.json();
            setTasks(tasksData);
            settotaltask(tasksData.length);
            
            return tasksData;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }, [currentTrack]);

    // Initialize tracks when component mounts
    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    // Fetch tasks when track changes
    useEffect(() => {
        const initTasks = async () => {
            if (currentTrack) {
                setLoading(true);
                await fetchTasks();
                setLoading(false);
            }
        };
        initTasks();
    }, [currentTrack, fetchTasks]);

    // Fetch submissions when selected mentee or tasks change
    useEffect(() => {
        if (selectedMentee && tasks.length > 0) {
            setLoading(true);
            fetchSelectedMenteeSubmissions(selectedMentee, tasks).finally(() => {
                setLoading(false);
            });
        } else if (!selectedMentee) {
            // Clear submissions when no mentee is selected
            setMenteeSubmissions({});
            setMenteeFullSubmissions([]);
        }
    }, [selectedMentee, tasks, fetchSelectedMenteeSubmissions]);

    // Fetch mentee details when selected mentee changes
    useEffect(() => {
        if (selectedMentee) {
            fetchMenteeDetails(selectedMentee);
        }
    }, [selectedMentee]);

    // Update current task when selected mentee or submissions change
    useEffect(() => {
        if (tasks.length > 0 && Object.keys(menteeSubmissions).length > 0 && selectedMentee) {
            const current = getCurrentTaskForMentee();
            setCurrentTask(current);
        }
    }, [tasks, menteeSubmissions, selectedMentee, getCurrentTaskForMentee]);

    // Calculate submitted tasks count for the selected mentee
    const submittedTasksCount = selectedMentee ? getSubmittedTasksCount() : 0;

    if (menteesLoading) {
        return (
            <div className="text-white flex justify-center items-center h-screen">
                <div className="loader"></div>
                <div className="text-xl">Loading mentees...</div>
            </div>
        );
    }

    return (
        <div className="text-white p-4 md:p-2 lg:p-0">
            <div className="h-full w-full m-auto scrollbar-hide max-w-[80rem]">
                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center mb-4 sm:mb-0">
                        <div className="flex text-xl sm:text-2xl md:text-3xl gap-1">
                            <h1>Welcome, </h1>
                            <h1 className="text-primary-yellow">Mentor</h1>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <select 
                            className="bg-deeper-grey rounded-lg text-primary-yellow px-3 py-2 sm:px-4 md:px-6 md:py-3 w-full sm:w-auto mb-3 sm:mb-0"
                            value={currentTrack?.id || 1}
                            onChange={handleTrackChange}
                        >
                            {tracks.map(track => (
                                <option key={track.id} value={track.id}>{track.name}</option>
                            ))}
                        </select>
                        
                        {/* Search input for mentees */}
                        <div className="relative w-full sm:w-auto mb-6 sm:mb-0">
                            <input
                                type="text"
                                placeholder="Search for a mentee..."
                                className="bg-deeper-grey rounded-lg text-primary-yellow px-3 py-2 sm:px-4 md:px-6 md:py-3 w-full sm:w-64 placeholder-gray-400"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                            
                            {/* Search dropdown */}
                            {showDropdown && filteredMentees.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-deeper-grey border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
                                    {filteredMentees.map((mentee, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-2 sm:px-4 md:px-6 md:py-3 hover:bg-gray-700 cursor-pointer text-primary-yellow"
                                            onClick={() => handleMenteeSelect(mentee.name)}
                                        >
                                            {mentee.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* No results message */}
                            {showDropdown && searchTerm.trim() && filteredMentees.length === 0 && (
                                <div className="absolute top-full left-0 right-0 bg-deeper-grey border border-gray-600 rounded-lg mt-1 z-10">
                                    <div className="px-3 py-2 sm:px-4 md:px-6 md:py-3 text-gray-400">
                                        No mentees found
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-4 sm:mt-6 md:mt-10">
                    <CurrentTask
                        isLoading = {loading} 
                        mentor={true} 
                        task={currentTask}
                        status={currentTask ? menteeSubmissions[currentTask.id] : undefined}
                    />
                </div>
                <div className="flex flex-col lg:flex-row justify-between mt-4 sm:mt-6 md:mt-10 gap-6 lg:gap-0">
                    <div className="flex flex-col gap-2 w-full lg:w-[46%]">
                        <PlayerStats rank={menteeDetails.position} points={menteeDetails.total_points} />
                        <Badges />
                        <PlayerProgress tasks={submittedTasksCount} totaltasks={totaltask} />
                    </div>
                    <div className="flex flex-col gap-4 w-full lg:w-[50%]">
                        <div className="flex flex-col sm:flex-row gap-5 justify-between">
                            <div className="w-full sm:w-1/2">
                                <UpcomingTask isLoading={loading} upcoming_tasks={getUpcomingMentorTasks()} />
                            </div>
                            <div className="w-1/2">
                                <ReviewedTask isLoading={loading} reviewed_tasks={getReviewedMentorTasks()} />
                            </div>
                        </div>
                        <FeedbackProvided 
                            selectedMentee={selectedMentee}
                            menteeSubmissions={{[selectedMentee || '']: menteeFullSubmissions}}
                            tasks={tasks}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;