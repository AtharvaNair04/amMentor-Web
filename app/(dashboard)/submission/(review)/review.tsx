'use client';

import { useState, useEffect } from 'react';
import TaskDetails from './taskdetails';
import MentorSection from './mentorsection';

interface SubmissionReviewProps {
  isMentor: boolean;
  taskId?: string | null;
  menteeId?: string | null;
  onClose: () => void;
  trackId?: string | number | null;
  allSubmissions?: Record<number, string>;
  tasks?: Task[]; // Add tasks prop
}

interface Task {
  id: number;
  title: string;
  description: string;
  deadline?: number | null;
  track_id: number;
  task_no: number;
  points: number;
}

interface SubmissionData {
  id: number;
  reference_link: string;
  status: string;
  mentor_feedback: string;
  submitted_at: string;
  approved_at?: string;
  submission_text?: string;
}

interface SubmissionResponse {
  id: number;
  task_id: number;
  task_no: number;
  reference_link: string;
  commit_hash:string;
  status: string;
  mentor_feedback: string;
  submitted_at: string;
  approved_at?: string;
  submission_text?: string;
}

interface TaskApiResponse {
  id: number;
  title: string;
  description: string;
  track_id: number;
  task_no: number;
  points: number;
  deadline: number | null;
}

const SubmissionReview = ({
  isMentor,
  taskId,
  menteeId,
  onClose,
  trackId,
  allSubmissions = {},
  tasks = [], // Default to empty array
}: SubmissionReviewProps) => {
  const [submissionText, setSubmissionText] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('In Progress');
  const [taskStatus, setTaskStatus] = useState('Not Started');
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks); // Local state for tasks

  // Helper function to normalize status strings
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

  // Fetch tasks if not provided
  useEffect(() => {
    const fetchTasks = async () => {
      if (localTasks.length > 0) return; // Already have tasks

      try {
        // Get the correct trackId
        let currentTrackId = trackId;
        
        if (!currentTrackId) {
          if (isMentor) {
            currentTrackId = 1;
          } else {
            const sessionTrack = sessionStorage.getItem('currentTrack');
            if (sessionTrack) {
              const trackData = JSON.parse(sessionTrack);
              currentTrackId = trackData.id;
            } else {
              return;
            }
          }
        }

        const res = await fetch(`https://praveshan.ganidande.com/tracks/${currentTrackId}/tasks`);
        if (res.ok) {
          const tasksData: TaskApiResponse[] = await res.json();
          const formattedTasks: Task[] = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            track_id: task.track_id,
            task_no: task.task_no,
            points: task.points,
          }));
          setLocalTasks(formattedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [trackId, isMentor, localTasks.length]);

  // Check if the current task is unlocked based on previous task completion
  const isTaskUnlocked = (currentTaskId: string): boolean => {
    if (isMentor) return true; // Mentors can access any task
    
    const currentTaskNo = parseInt(currentTaskId);
    if (currentTaskNo <= 1) return true; // First task is always unlocked
    
    // Find the previous task by task_no
    const previousTaskNo = currentTaskNo - 1;
    const previousTask = localTasks.find(task => task.task_no === previousTaskNo);
    
    // If previous task doesn't exist, don't unlock
    if (!previousTask) {
      return false;
    }
    
    // CRITICAL FIX: If previous task has null deadline, current task is automatically unlocked
    if (previousTask.deadline === null) {
      return true;
    }
    
    // Otherwise, check if previous task is completed
    const previousTaskStatus = allSubmissions[previousTaskNo];
    return previousTaskStatus === 'Submitted' || previousTaskStatus === 'Reviewed';
  };

  // Fetch submission data when component mounts
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!taskId) {
        return;
      }

      // Get the correct trackId
      let currentTrackId = trackId;
      
      // If trackId is not provided or is null, try to get it from different sources
      if (!currentTrackId) {
        if (isMentor) {
          // For mentors, get from session storage or default to track 1
          const mentorTrack = sessionStorage.getItem('mentorCurrentTrack');
          if (mentorTrack) {
            const trackData = JSON.parse(mentorTrack);
            currentTrackId = trackData.id;
          } else {
            currentTrackId = 1;
          }
        } else {
          // For mentees, get from sessionStorage
          const sessionTrack = sessionStorage.getItem('currentTrack');
          if (sessionTrack) {
            const trackData = JSON.parse(sessionTrack);
            currentTrackId = trackData.id;
          } else {
            return;
          }
        }
      }

      setLoading(true);
      try {
        let email;
        if (isMentor && menteeId) {
          // For mentor viewing mentee's submission
          email = menteeId; // Assuming menteeId is the email
        } else {
          // For mentee viewing their own submission
          email = localStorage.getItem('email');
        }

        if (!email) {
          setLoading(false);
          return;
        }
        
        const res = await fetch(`https://praveshan.ganidande.com/submissions/?email=${encodeURIComponent(email)}&track_id=${currentTrackId}`);
        if (res.ok) {
          const submissions: SubmissionResponse[] = await res.json();
          
          // FIXED: Use taskId directly since it's already task_no from the main page
          const taskSubmission = submissions.find((s: SubmissionResponse) => s.task_no === parseInt(taskId));
          
          if (taskSubmission) {
            setSubmissionData(taskSubmission);
            setMentorNotes(taskSubmission.mentor_feedback || '');
            
            // Normalize the status from API
            const normalizedStatus = normalizeStatus(taskSubmission.status);
            setTaskStatus(normalizedStatus);

            // Set submission text - use reference_link if submission_text is empty
            if (taskSubmission.submission_text) {
              setSubmissionText(taskSubmission.submission_text);
            } else if (taskSubmission.reference_link) {
              setSubmissionText(taskSubmission.reference_link);
            }
            else if (taskSubmission.commit_hash) {
              setSubmissionText(taskSubmission.commit_hash);
            } else {
              setSubmissionText('');
            }
          } else {
            // Reset to default values when no submission found
            setSubmissionText('');
            setMentorNotes('');
            setTaskStatus('Not Started');
          }
        } else {
          console.error('Failed to fetch submissions:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching submission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [taskId, trackId, menteeId, isMentor]);

  const currentTaskUnlocked = taskId ? isTaskUnlocked(taskId) : true;
  const isAlreadySubmitted = taskStatus === 'Submitted' || taskStatus === 'Reviewed';

  const submitTask = async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      alert('Email not found. Please log in again.');
      return;
    }

    // Get the correct trackId for submission
    let currentTrackId = trackId;
    if (!currentTrackId) {
      const sessionTrack = sessionStorage.getItem('currentTrack');
      if (sessionTrack) {
        const trackData = JSON.parse(sessionTrack);
        currentTrackId = trackData.id;
      } else {
        alert('Track information not found. Please select a track.');
        return;
      }
    }

    if (!currentTrackId || !taskId || !submissionText.trim()) {
      alert('Missing track, task ID, or work submission');
      return;
    }

    // Check if task is unlocked before submitting
    if (!currentTaskUnlocked) {
      alert('You must complete the previous task before submitting this one.');
      return;
    }

    const body = {
      track_id: Number(currentTrackId),
      task_no: Number(taskId)-1,
      reference_link: submissionText.trim(),
      start_date: new Date().toISOString().split('T')[0],
      mentee_email: email,
    };

    try {
      const res = await fetch('https://praveshan.ganidande.com/progress/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Submission failed: ${data.detail || 'Unknown error'}`);
        return;
      }

      alert('Task submitted successfully!');
      setTaskStatus('Submitted');
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred while submitting the task.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[90rem] mx-auto">
        <div className="bg-container-grey bg-opacity-50 rounded-3xl p-4 md:p-6 min-h-[800px] w-full relative flex items-center justify-center">
          <div className='loader'></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto">
      <div className="bg-container-grey bg-opacity-50 rounded-3xl p-4 md:p-6 min-h-[800px] w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-primary-yellow rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row px-4 md:px-10">
          <TaskDetails
            isMentor={isMentor}
            taskId={taskId ?? undefined}
            menteeId={menteeId}
            taskStatus={taskStatus}
            submissionText={submissionText}
            setSubmissionText={setSubmissionText}
            isAlreadySubmitted={isAlreadySubmitted}
            trackId={trackId ?? undefined}
            onSubmitTask={submitTask}
            allSubmissions={allSubmissions}
            tasks={localTasks}
          />

          <MentorSection
            isMentor={isMentor}
            mentorNotes={mentorNotes}
            setMentorNotes={setMentorNotes}
            taskStatus={taskStatus}
            reviewStatus={reviewStatus}
            setReviewStatus={setReviewStatus}
            setTaskStatus={setTaskStatus}
            submissionId={submissionData?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;