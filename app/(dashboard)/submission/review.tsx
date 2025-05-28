'use client';

import { useState, useEffect } from 'react';

interface SubmissionReviewProps {
  isMentor: boolean;
  taskId?: string | null;
  menteeId?: string | null;
  onClose: () => void;
}

const SubmissionReview = ({ isMentor, taskId, menteeId, onClose }: SubmissionReviewProps) => {
  const [submissionText, setSubmissionText] = useState('');
  const [mentorNotes, setMentorNotes] = useState('Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,');
  const [reviewStatus, setReviewStatus] = useState('pending'); // 'pending', 'approved', 'rejected', 'paused'
  
  // Mock data for task statuses - in real app, this would come from props or API
  const mockTaskStatuses = {
    '00': 'Reviewed',
    '01': 'Submitted', 
    '02': 'Submitted',
    '03': 'In Progress',
    '04': 'Not Started'
  };
  
  // Get the actual task status from mock data
  const taskStatus = mockTaskStatuses[taskId as keyof typeof mockTaskStatuses] || 'Not Started';
  
  // Pre-populate submission text for already submitted tasks
  useEffect(() => {
    if (taskStatus === 'Submitted' || taskStatus === 'Reviewed') {
      setSubmissionText('Here is my completed work submission. I have uploaded the Figma design files and completed all the required components as specified in the task guidelines. The design includes responsive layouts and follows the design system requirements.');
    }
  }, [taskStatus]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submissionText.trim()) {
      // In real app, this would update the task status via API
      console.log('Submitting work for task:', taskId);
    }
  };

  // Check if the task can be edited (only In Progress or Not Started)
  const canEdit = !isMentor && (taskStatus === 'In Progress' || taskStatus === 'Not Started');
  const isAlreadySubmitted = taskStatus === 'Submitted' || taskStatus === 'Reviewed';

  // Calculate cursor position based on days left
  const totalDays = 30;
  const daysLeft = 5;
  const progressPercentage = ((totalDays - daysLeft) / totalDays) * 100;

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

        <div className="mb-4 md:mb-6 px-4 md:px-10 py-2 md:py-4">
          <div className="flex-1 max-w-full md:max-w-[70%]">
            <h2 className="text-xl md:text-2xl font-bold text-white-text">TASK NAME</h2>
            <p className="text-gray-400">TASK - {taskId || 'XX'}</p>
            {isMentor && menteeId && (
              <p className="text-primary-yellow font-semibold mt-2">Mentee: {menteeId}</p>
            )}
            <p className="text-xs md:text-sm text-gray-300">
              TASK DETAILS Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text ever since the
              1500s, when an unknown printer took a galley
            </p>
            
            {/* Task Status Indicator */}
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                taskStatus === 'Reviewed' ? 'bg-green-600 text-white' :
                taskStatus === 'Submitted' ? 'bg-primary-yellow text-black' :
                taskStatus === 'In Progress' ? 'bg-blue-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                Status: {taskStatus}
              </span>
            </div>
            
            <div className="border-t border-white mb-2 md:mb-4 mt-4"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row px-4 md:px-10">
          <div className="w-full md:w-2/3 md:pr-8 mb-6 md:mb-0">
            <div className="mb-8 md:mb-10">
              {!isMentor && (
                <>
                  <h2 className="font-bold mb-4 md:mb-6 text-white-text">PROGRESS</h2>
                  
                  <div className="relative mb-6">
                    <div className="text-xs absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-300">
                      5 DAYS LEFT
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-green via-yellow-400 to-red rounded-full">
                      <div className="relative">
                        <div 
                          className="absolute -top-2 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full border-2 border-black"
                          style={{ left: `calc(${progressPercentage}% - 10px)` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs absolute -bottom-6 right-0 text-gray-300">
                      DEADLINE
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs mt-8 text-gray-400">
                    <span>25 Days</span>
                    <span>30 Days</span>
                  </div>
                </>
              )}

              {/* Dates section for mentor view */}
              {isMentor && (
                <div className="mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex">
                      <span className="text-primary-yellow font-semibold">Starting Date: </span>
                      <span className="ml-2">10/05/2025</span>
                    </div>
                    {isAlreadySubmitted && (
                      <div className="flex">
                        <span className="text-primary-yellow font-semibold">Submitted Date: </span>
                        <span className="ml-2">04/05/2025</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-8 md:mb-10">
              <h2 className="font-bold mb-3 md:mb-4 text-white-text">WORK SUBMISSION</h2>
              
              {/* For Mentee: Different display based on task status */}
              {!isMentor ? (
                <>
                  {canEdit ? (
                    /* Editable textarea for In Progress or Not Started tasks */
                    <>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Submit your work link or description here..."
                        className="w-full bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6 resize-none border-none outline-none placeholder-gray-500"
                      />
                      
                      <div className="flex justify-center">
                        <button 
                          type="submit"
                          disabled={!submissionText.trim()}
                          onClick={(e) => {
                            e.preventDefault();
                            if (submissionText.trim()) {
                              // In real app, this would call an API to update the task status
                              console.log('Submitting work for task:', taskId);
                              alert('Work submitted successfully!');
                            }
                          }}
                          className={`px-6 md:px-10 py-2 rounded-full text-sm md:text-md font-bold shadow-md ${
                            !submissionText.trim()
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-primary-yellow text-dark-bg hover:shadow-xl transition-shadow"
                          }`}
                        >
                          SUBMIT
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Read-only display for Submitted or Reviewed tasks */
                    <>
                      <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6 border border-gray-600">
                        {submissionText || 'No submission provided'}
                      </div>
                      
                      <div className="flex justify-center">
                        <button 
                          disabled
                          className="px-6 md:px-10 py-2 rounded-full text-sm md:text-md font-bold bg-gray-600 text-gray-400 cursor-not-allowed"
                        >
                          {taskStatus === 'Reviewed' ? 'REVIEWED' : 'SUBMITTED'}
                        </button>
                      </div>
                      
                      {taskStatus === 'Submitted' && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                          Your work has been submitted and is awaiting review.
                        </p>
                      )}
                      
                      {taskStatus === 'Reviewed' && (
                        <p className="text-center text-xs text-green-400 mt-2">
                          Your work has been reviewed by your mentor.
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                /* For Mentor: Always read-only display */
                <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
                  {submissionText || 'No submission provided'}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="font-bold mb-3 md:mb-4 text-white-text">BADGES EARNED</h2>
              <div className="flex gap-3 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red rounded-full"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-yellow rounded-full"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8">
            <div className="mb-6">
              <h2 className="font-bold mb-3 md:mb-4 text-white-text">MENTOR NOTES:</h2>
              
              {/* For Mentor: Text input area */}
              {isMentor ? (
                <textarea
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Add your notes for the mentee here..."
                  className="w-full bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6 resize-none border-none outline-none"
                />
              ) : (
                /* For Mentee: Read-only display */
                <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
                  {mentorNotes}
                </div>
              )}
            </div>
            
            <div className="mt-6 md:mt-10">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="font-bold text-white-text">Resources:</h2>
                <button className="bg-dark-bg rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-dark-grey rounded-md p-2 md:p-3 flex items-center mb-8">
                <div className="mr-3 md:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base text-white-text">Task Guidelines.pdf</p>
                  <p className="text-xs text-gray-400">Download</p>
                </div>
              </div>

              {/* Mentor review buttons - only show for submitted tasks */}
              {isMentor && (taskStatus === 'Submitted') && (
                <div className="flex justify-between gap-2">
                  <button 
                    onClick={() => setReviewStatus('rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                  <button 
                    onClick={() => setReviewStatus('approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button 
                    onClick={() => setReviewStatus('paused')}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium"
                  >
                    Pause
                  </button>
                </div>
              )}

              {/* Status message for mentors */}
              {isMentor && taskStatus === 'Reviewed' && (
                <div className="text-center text-green-400 text-sm">
                  This task has been reviewed
                </div>
              )}
              
              {isMentor && (taskStatus === 'In Progress' || taskStatus === 'Not Started') && (
                <div className="text-center text-gray-400 text-sm">
                  Waiting for mentee submission
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;