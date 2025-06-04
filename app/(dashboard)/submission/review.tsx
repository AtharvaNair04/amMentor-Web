'use client';

import { useState, useEffect } from 'react';
import TaskDetails from './taskdetails';
import MentorSection from './mentorsection';

interface SubmissionReviewProps {
  isMentor: boolean;
  taskId?: string | null;
  menteeId?: string | null;
  onClose: () => void;
}

const SubmissionReview = ({ isMentor, taskId, menteeId, onClose }: SubmissionReviewProps) => {
  const [submissionText, setSubmissionText] = useState('');
  const [mentorNotes, setMentorNotes] = useState('Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,');
  const [reviewStatus, setReviewStatus] = useState('pending');
  
  // Mock data for task statuses
  const mockTaskStatuses = {
    '00': 'Reviewed',
    '01': 'Submitted', 
    '02': 'Submitted',
    '03': 'In Progress',
    '04': 'Not Started'
  };
  
  console.log('Current review status:', reviewStatus);
  const taskStatus = mockTaskStatuses[taskId as keyof typeof mockTaskStatuses] || 'Not Started';
  
  useEffect(() => {
    if (taskStatus === 'Submitted' || taskStatus === 'Reviewed') {
      setSubmissionText('Here is my completed work submission. I have uploaded the Figma design files and completed all the required components as specified in the task guidelines. The design includes responsive layouts and follows the design system requirements.');
    }
  }, [taskStatus]);

  const canEdit = !isMentor && (taskStatus === 'In Progress' || taskStatus === 'Not Started');
  const isAlreadySubmitted = taskStatus === 'Submitted' || taskStatus === 'Reviewed';

  return (
    <div className="max-w-[90rem] mx-auto">
      <div className="bg-container-grey bg-opacity-50 rounded-3xl p-4 md:p-6 min-h-[800px] w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-primary-yellow rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row px-4 md:px-10">
          <TaskDetails 
            isMentor={isMentor}
            taskId={taskId}
            menteeId={menteeId}
            taskStatus={taskStatus}
            submissionText={submissionText}
            setSubmissionText={setSubmissionText}
            canEdit={canEdit}
            isAlreadySubmitted={isAlreadySubmitted}
          />
          
          <MentorSection 
            isMentor={isMentor}
            mentorNotes={mentorNotes}
            setMentorNotes={setMentorNotes}
            taskStatus={taskStatus}
            reviewStatus={reviewStatus}
            setReviewStatus={setReviewStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;