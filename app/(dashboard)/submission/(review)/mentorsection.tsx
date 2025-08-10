import React from 'react';

interface MentorSectionProps {
  isMentor: boolean;
  mentorNotes: string;
  setMentorNotes: (notes: string) => void;
  taskStatus: string;
  reviewStatus: string;
  setReviewStatus: (status: string) => void;
  setTaskStatus: (status: string) => void;
  submissionId?: number;
}

const MentorSection = ({
  isMentor,
  mentorNotes,
  setMentorNotes,
  taskStatus,
  setReviewStatus,
  setTaskStatus,
  submissionId,
}: MentorSectionProps) => {
  const isSubmittedForReview = (status: string): boolean => {
    const submittedStatuses = ['submitted', 'Submitted'];
    return submittedStatuses.includes(status);
  };

  const isReviewed = (status: string): boolean => {
    const reviewedStatuses = ['reviewed', 'Reviewed', 'approved', 'Approved', 'rejected', 'Rejected', 'paused', 'Paused'];
    return reviewedStatuses.includes(status);
  };

  const isWaitingForSubmission = (status: string): boolean => {
    const waitingStatuses = ['in progress', 'In Progress', 'not started', 'Not Started'];
    return waitingStatuses.includes(status);
  };

  const showNotForPraveshanDialog = () => {
    alert('This feature is not available for Praveshan.');
  };

  return (
    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8">
      <div className="mb-6">
        <h2 className="font-bold mb-3 md:mb-4 text-white-text">MENTOR NOTES:</h2>

        {isMentor ? (
          <>
            <textarea
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="Add your notes for the mentee here..."
              className="w-full bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-2 resize-none border-none outline-none"
            />
            <p className="text-xs text-gray-400 mb-4">
              ✏️ These notes will be saved when you approve or reject the task.
            </p>
          </>
        ) : (
          <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
            {mentorNotes || 'Not applicable for Praveshan.'}
          </div>
        )}
      </div>

      {/* ✅ Resources Section */}
      <div className="mt-6 md:mt-10">

        {/* Review Action Buttons */}
        {isMentor && isSubmittedForReview(taskStatus) && (
          <div className="flex justify-between gap-2">
            <button 
              onClick={showNotForPraveshanDialog}
              className="flex-1 bg-red hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
            <button 
              onClick={showNotForPraveshanDialog}
              className="flex-1 bg-dark-green hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button 
              onClick={showNotForPraveshanDialog}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium"
            >
              Pause
            </button>
          </div>
        )}

        {isMentor && isReviewed(taskStatus) && (
          taskStatus.toLowerCase() === 'paused' ? (
            <div className="flex justify-center mt-4">
              <button 
                onClick={showNotForPraveshanDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
              >
                Unpause
              </button>
            </div>
          ) : (
            <div className="text-center text-green-400 text-sm">
              This task has been reviewed
            </div>
          )
        )}

        {isMentor && isWaitingForSubmission(taskStatus) && (
          <div className="text-center text-gray-400 text-sm">
            Waiting for mentee submission
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSection;
