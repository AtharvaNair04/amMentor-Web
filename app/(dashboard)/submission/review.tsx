'use client';

import { useState } from 'react';

interface SubmissionReviewProps {
  isMentor: boolean;
  taskId?: string | null;
  menteeId?: string | null;
  onClose: () => void;
}

const SubmissionReview = ({ isMentor, taskId, menteeId, onClose }: SubmissionReviewProps) => {
  const [submissionText, setSubmissionText] = useState('Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,');
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [reviewStatus, setReviewStatus] = useState('pending'); // 'pending', 'approved', 'rejected', 'paused'
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

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
            <div className="border-t border-white mb-2 md:mb-4 mt-2"></div>
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
                    <div className="flex">
                      <span className="text-primary-yellow font-semibold">Submitted Date: </span>
                      <span className="ml-2">04/05/2025</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-8 md:mb-10">
              <h2 className="font-bold mb-3 md:mb-4 text-white-text">WORK SUBMISSION</h2>
              <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
                {submissionText}
              </div>
              
              {!isMentor && (
                <div className="flex justify-center">
                  <button 
                    type="submit"
                    disabled={isSubmitted}
                    className={`px-6 md:px-10 py-2 rounded-full text-sm md:text-md font-bold shadow-md ${
                      isSubmitted 
                        ? "bg-grey text-gray-300" 
                        : "bg-primary-yellow text-dark-bg hover:shadow-xl transition-shadow"
                    }`}
                  >
                    {isSubmitted ? "SUBMITTED" : "SUBMIT"}
                  </button>
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
              <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
                Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,
              </div>
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

              {/* Mentor review buttons */}
              {isMentor && (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;