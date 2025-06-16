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

const SubmissionReview = ({
  isMentor,
  taskId,
  menteeId,
  onClose,
  trackId,
}: SubmissionReviewProps) => {
  const [submissionText, setSubmissionText] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('In Progress');
  const [taskStatus, setTaskStatus] = useState('Not Started');
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch submission data when component mounts
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!taskId) {
        console.log('Missing taskId:', { taskId });
        return;
      }

      // Get the correct trackId
      let currentTrackId = trackId;
      
      // If trackId is not provided or is null, try to get it from different sources
      if (!currentTrackId) {
        if (isMentor) {
          // For mentors, default to track 1
          currentTrackId = 1;
        } else {
          // For mentees, get from sessionStorage
          const sessionTrack = sessionStorage.getItem('currentTrack');
          if (sessionTrack) {
            const trackData = JSON.parse(sessionTrack);
            currentTrackId = trackData.id;
          } else {
            console.log('No track found in sessionStorage');
            return;
          }
        }
      }

      console.log('Using trackId:', currentTrackId);

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
          console.log('No email found');
          setLoading(false);
          return;
        }
        console.log("email) si ",menteeId);
        console.log('Fetching submission data for:', { email, trackId: currentTrackId, taskId });

        const res = await fetch(`https://amapi.amfoss.in/submissions/?email=${encodeURIComponent(email)}&track_id=${currentTrackId}`);
        if (res.ok) {
          const submissions = await res.json();
          console.log('All submissions:', submissions);
          
          const taskSubmission = submissions.find((s: any) => s.task_id === parseInt(taskId));
          console.log('Found task submission:', taskSubmission);
          
          if (taskSubmission) {
            setSubmissionData(taskSubmission);
            setMentorNotes(taskSubmission.mentor_feedback || '');
            
            // Normalize the status from API
            const normalizedStatus = normalizeStatus(taskSubmission.status);
            setTaskStatus(normalizedStatus);
            console.log('Set task status to:', normalizedStatus);

            // Set submission text - use reference_link if submission_text is empty
            if (taskSubmission.submission_text) {
              setSubmissionText(taskSubmission.submission_text);
            } else if (taskSubmission.reference_link) {
              setSubmissionText(taskSubmission.reference_link);
            } else {
              setSubmissionText('');
            }
          } else {
            console.log('No submission found for task:', taskId);
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

  const canEdit = !isMentor && (taskStatus === 'In Progress' || taskStatus === 'Not Started');
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

    const body = {
      track_id: Number(currentTrackId),
      task_no: Number(taskId),
      reference_link: submissionText.trim(),
      start_date: new Date().toISOString().split('T')[0],
      mentee_email: email,
    };

    try {
      const res = await fetch('https://amapi.amfoss.in/progress/submit-task', {
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
          <div className="text-white text-xl">Loading submission data...</div>
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
            canEdit={canEdit}
            isAlreadySubmitted={isAlreadySubmitted}
            trackId={trackId ?? undefined}
            onSubmitTask={submitTask}
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