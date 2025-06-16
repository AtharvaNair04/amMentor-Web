import React, {useState, useEffect} from 'react';

interface TaskDetailsProps {
  isMentor: boolean;
  taskId?: string;
  menteeId?: string | null;
  taskStatus: string;
  submissionText: string;
  setSubmissionText: (text: string) => void;
  canEdit: boolean;
  isAlreadySubmitted: boolean;
  trackId?: string | number;
  onSubmitTask: () => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
}

// Define proper interface for task API response
interface TaskApiResponse {
  id: number;
  title: string;
  description: string;
  track_id: number;
  task_no: number;
  points: number;
  deadline: string;
}

const TaskDetails = ({
  isMentor,
  taskId,
  menteeId,
  taskStatus,
  submissionText,
  setSubmissionText,
  canEdit,
  isAlreadySubmitted,
  trackId,
  onSubmitTask,
}: TaskDetailsProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

   useEffect(() => {
    const fetchTask = async () => {
      if (/*!trackId ||*/ !taskId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`https://amapi.amfoss.in/tracks/1/tasks`);
        const tasks: TaskApiResponse[] = await res.json();
        const foundTask = tasks.find((t: TaskApiResponse) => String(t.id) === String(taskId));
        if (foundTask) {
          setTask({
            id: foundTask.id.toString(),
            title: foundTask.title,
            description: foundTask.description,
          });
        } else {
          setTask(null);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [trackId, taskId]);

  const totalDays = 30;
  const daysLeft = 5;
  const progressPercentage = ((totalDays - daysLeft) / totalDays) * 100;

  if (loading) {
    return <div className="text-white">Loading task details...</div>;
  }

  return (
     <div className="w-full md:w-2/3 md:pr-8 mb-6 md:mb-0">
      <div className="mb-4 md:mb-6 px-4 md:px-0 py-2 md:py-4">
        <div className="flex-1 max-w-full md:max-w-[70%]">
          <h2 className="text-xl md:text-2xl font-bold text-white-text">
            {task?.title || 'TASK NAME'}
          </h2>
          <p className="text-gray-400">TASK - {taskId || 'XX'}</p>
          {isMentor && menteeId && (
            <p className="text-primary-yellow font-semibold mt-2">Mentee: {menteeId}</p>
          )}
          <p className="text-xs md:text-sm text-gray-300">
            {task?.description || 'TASK DETAILS ...'}
          </p>
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              taskStatus === 'Reviewed' ? 'bg-green-600 text-white' :
              taskStatus === 'Submitted' ? 'bg-primary-yellow text-black' :
              taskStatus === 'In Progress' ? 'bg-blue-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              Status: {taskStatus}
            </span>
            {!isMentor && !hasStarted &&  taskStatus === 'In Progress' &&(
              <button
                onClick={() => setHasStarted(true)}
                className="ml-4 px-4 py-1 bg-primary-yellow text-dark-bg rounded-full text-xs font-semibold hover:bg-yellow-400 transition-colors"
              >
                START TASK
              </button>
            )}
            
          </div>
          <div className="border-t border-white mb-2 md:mb-4 mt-4"></div>
        </div>
      </div>

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
        
        {!isMentor ? (
          <>
            {canEdit || hasStarted ? (
              <>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Submit your work link or description here... (e.g. https://github.com/yourname/task-solution)"
                  className="w-full bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6 resize-none border-none outline-none placeholder-gray-500"
                />
                
                <div className="flex justify-center">
                  <button 
                    type="submit"
                    disabled={!submissionText.trim()}
                    onClick={(e) => {
                      e.preventDefault();
                      if (submissionText.trim()) {
                        onSubmitTask();
                      }
                    }}
                    className={`px-6 md:px-10 py-2 rounded-full text-sm md:text-md font-bold shadow-md ${
                      !submissionText.trim()
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-primary-yellow text-dark-bg hover:shadow-xl transition-shadow"
                    }`}
                  >
                    SUBMIT TASK
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6 border border-gray-600">
                  {submissionText ? (
                    // Check if it looks like a URL and make it clickable
                    submissionText.match(/https?:\/\/[^\s]+/) ? (
                      <div>
                        {submissionText.split(/(https?:\/\/[^\s]+)/).map((part, index) => 
                          part.match(/https?:\/\/[^\s]+/) ? (
                            <a 
                              key={index}
                              href={part}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {part}
                            </a>
                          ) : part
                        )}
                      </div>
                    ) : submissionText
                  ) : 'No submission provided'}
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
          <div>
            <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text">
              {submissionText ? (
                // Check if it looks like a URL and make it clickable for mentors too
                submissionText.match(/https?:\/\/[^\s]+/) ? (
                  <div>
                    {submissionText.split(/(https?:\/\/[^\s]+)/).map((part, index) => 
                      part.match(/https?:\/\/[^\s]+/) ? (
                        <a 
                          key={index}
                          href={part}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline break-all"
                        >
                          {part}
                        </a>
                      ) : part
                    )}
                  </div>
                ) : submissionText
              ) : 'No submission provided'}
            </div>
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
  );
};

export default TaskDetails;