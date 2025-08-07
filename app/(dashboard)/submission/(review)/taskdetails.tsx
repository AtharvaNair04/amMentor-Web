import React, {useState, useEffect} from 'react';

interface TaskDetailsProps {
  isMentor: boolean;
  taskId?: string;
  menteeId?: string | null;
  taskStatus: string;
  submissionText: string;
  setSubmissionText: (text: string) => void;
  isAlreadySubmitted: boolean;
  trackId?: string | number;
  onSubmitTask: () => void;
  // New props for sequential task logic
  allSubmissions?: Record<number, string>;
  tasks?: Task[];
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

interface TaskApiResponse {
  id: number;
  title: string;
  description: string;
  track_id: number;
  task_no: number;
  points: number;
  deadline: number | null;
}

interface TaskStartData {
  taskId: string;
  startDate: string;
  trackId: string | number;
  menteeEmail: string;
}

const TaskDetails = ({
  isMentor,
  taskId,
  menteeId,
  taskStatus,
  submissionText,
  setSubmissionText,
  isAlreadySubmitted,
  trackId,
  onSubmitTask,
  allSubmissions = {},
  tasks = [],
}: TaskDetailsProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Generate storage key for this specific task and user
  const getStorageKey = (taskId: string, email: string): string => {
    return `task_start_${taskId}_${email}`;
  };

  // Load start date from localStorage on component mount
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!taskId || !email) return;

    const storageKey = getStorageKey(taskId, email);
    const storedStartData = localStorage.getItem(storageKey);
    
    if (storedStartData) {
      try {
        const startData: TaskStartData = JSON.parse(storedStartData);
        setStartDate(startData.startDate);
        setHasStarted(true);
      } catch (error) {
        console.error('Error parsing stored start data:', error);
      }
    }
  }, [taskId]);

  // Calculate progress based on start date and deadline
  useEffect(() => {
    if (!startDate || !task?.deadline) return;

    const calculateProgress = () => {
      const start = new Date(startDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      setDaysElapsed(daysDiff);
      
      if (task.deadline && task.deadline > 0) {
        const progress = Math.min((daysDiff / task.deadline) * 100, 100);
        setProgressPercentage(progress);
      }
    };

    calculateProgress();
    
    // Update progress every hour
    const interval = setInterval(calculateProgress, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [startDate, task?.deadline]);

  // Use the same logic as the main page for task unlocking
  const isCurrentTaskUnlocked = (currentTaskId: string): boolean => {
    if (isMentor) return true; // Mentors can access any task
    
    const currentTaskNo = parseInt(currentTaskId);
    if (currentTaskNo <= 1) return true; // First task is always unlocked
    
    // Find the previous task by task_no
    const previousTaskNo = currentTaskNo - 1;
    const previousTask = tasks.find(task => task.task_no === previousTaskNo);
    
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
    const isUnlocked = previousTaskStatus === 'Submitted' || previousTaskStatus === 'Reviewed';
    
    return isUnlocked;
  };

  const getBlockedTaskMessage = (currentTaskId: string): string => {
    const currentTaskNo = parseInt(currentTaskId);
    const previousTaskNo = currentTaskNo - 1;
    const previousTask = tasks.find(task => task.task_no === previousTaskNo);
    
    if (previousTask && previousTask.deadline === null) {
      return `Task ${previousTaskNo} ("${previousTask.title}") has no deadline and should automatically unlock this task. If you're seeing this error, please refresh the page or contact support.`;
    }
    
    const previousTaskTitle = previousTask ? `"${previousTask.title}"` : previousTaskNo.toString();
    return `You must submit Task ${previousTaskNo} (${previousTaskTitle}) before you can start this task.`;
  };

  // Handle start task button click
  const handleStartTask = async () => {
    const email = localStorage.getItem('email');
    if (!email || !taskId || !trackId) {
      alert('Missing required information. Please log in again.');
      return;
    }

    const currentStartDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Store start data in localStorage
    const startData: TaskStartData = {
      taskId,
      startDate: currentStartDate,
      trackId,
      menteeEmail: email
    };
    
    const storageKey = getStorageKey(taskId, email);
    localStorage.setItem(storageKey, JSON.stringify(startData));
    
    // Update component state
    setStartDate(currentStartDate);
    setHasStarted(true);
    
    // Optionally, you can also send this to your backend API here
    try {
      // You can create an API endpoint to track task starts if needed
      // await fetch('https://praveshan.ganidande.com/tasks/start', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(startData)
      // });
    } catch (error) {
      console.error('Error sending start data to server:', error);
      // Don't show error to user as localStorage storage is more important
    }
  };

  // Enhanced submit function to use stored start date
  const handleSubmitTask = async () => {
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

    // Use stored start date or current date if not started yet
    let submissionStartDate = startDate;
    if (!submissionStartDate) {
      // If somehow the task wasn't officially started, start it now
      submissionStartDate = new Date().toISOString().split('T')[0];
      handleStartTask();
    }

    const body = {
      track_id: Number(currentTrackId),
      task_no: Number(taskId),
      reference_link: submissionText.trim(),
      start_date: submissionStartDate, // Use the stored start date
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
      // Call the original onSubmitTask to update parent component
      onSubmitTask();
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred while submitting the task.');
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchTrackId = trackId || 1;
        const res = await fetch(`https://praveshan.ganidande.com/tracks/${fetchTrackId}/tasks`);
        const tasks: TaskApiResponse[] = await res.json();
        
        // Compare with task_no directly since taskId is now task_no
        const foundTask = tasks.find((t: TaskApiResponse) => t.task_no === parseInt(taskId));
        
        if (foundTask) {
          setTask({
            id: foundTask.id,
            title: foundTask.title,
            description: foundTask.description,
            deadline: foundTask.deadline,
            track_id: foundTask.track_id,
            task_no: foundTask.task_no,
            points: foundTask.points,
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

  // Use the corrected unlock logic
  const taskUnlocked = taskId ? isCurrentTaskUnlocked(taskId) : true;
  const canStartTask = !isMentor && taskUnlocked && !hasStarted && (taskStatus === 'Not Started');
  const showLockedMessage = !isMentor && !taskUnlocked && taskStatus === 'Not Started';
  
  // Update canEdit logic to use the corrected unlock status
  const canEditTask = !isMentor && taskUnlocked && (taskStatus === 'In Progress' || taskStatus === 'Not Started') && hasStarted;

  // Calculate days remaining for display
  const getDaysRemaining = (): number => {
    if (!task?.deadline || !startDate) return 0;
    return Math.max(0, task.deadline - daysElapsed);
  };

  const getProgressColor = (): string => {
    if (!task?.deadline) return 'green';
    const remaining = getDaysRemaining();
    const total = task.deadline;
    const percentRemaining = (remaining / total) * 100;
    
    if (percentRemaining > 50) return 'green';
    if (percentRemaining > 25) return 'yellow';
    return 'red';
  };

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
          {task?.deadline === null && (
            <p className="text-green-400 text-sm">📅 No deadline - Next task automatically unlocked</p>
          )}
          {task?.deadline !== null && task?.deadline && (
            <p className="text-yellow-400 text-sm">📅 Deadline: {task.deadline} days</p>
          )}
          {startDate && (
            <p className="text-blue-400 text-sm">🚀 Started: {new Date(startDate).toLocaleDateString()}</p>
          )}
          {isMentor && menteeId && (
            <p className="text-primary-yellow font-semibold mt-2">Mentee: {menteeId}</p>
          )}
          <p className="text-xs md:text-sm text-gray-300">
            {task?.description || 'TASK DETAILS ...'}
          </p>
          
          {/* Task Status and Lock Message */}
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              taskStatus === 'Reviewed' ? 'bg-green-600 text-white' :
              taskStatus === 'Submitted' ? 'bg-primary-yellow text-black' :
              taskStatus === 'In Progress' ? 'bg-blue-600 text-white' :
              showLockedMessage ? 'bg-red-600 text-white' :
              hasStarted ? 'bg-blue-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              Status: {showLockedMessage ? 'Locked' : hasStarted && taskStatus === 'Not Started' ? 'In Progress' : taskStatus}
            </span>
            
            {canStartTask && (
              <button
                onClick={handleStartTask}
                className="ml-4 px-4 py-1 bg-primary-yellow text-dark-bg rounded-full text-xs font-semibold hover:bg-yellow-400 transition-colors"
              >
                START TASK
              </button>
            )}
          </div>
          
          {/* Locked Task Message */}
          {showLockedMessage && (
            <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-600 rounded-md">
              <p className="text-red-300 text-sm">
                🔒 {getBlockedTaskMessage(taskId || '1')}
              </p>
            </div>
          )}
          
          <div className="border-t border-white mb-2 md:mb-4 mt-4"></div>
        </div>
      </div>

      <div className="mb-8 md:mb-10">
        {!isMentor && (
          <>
            <h2 className="font-bold mb-4 md:mb-6 text-white-text">PROGRESS</h2>
            
            <div className="relative mb-6">
              <div className="text-xs absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-300">
                {task?.deadline === null ? 'NO DEADLINE' : 
                 hasStarted && startDate ? `${getDaysRemaining()} DAYS LEFT` : 
                 task?.deadline ? `${task.deadline} DAYS TOTAL` : ''}
              </div>
              <div className={`h-2 w-full bg-gradient-to-r from-green via-yellow-400 to-red rounded-full`}>
                <div className="relative">
                  <div 
                    className="absolute -top-2 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full border-2 border-black transition-all duration-1000 ease-out"
                    style={{ 
                      left: `calc(${task?.deadline === null ? 100 : hasStarted ? progressPercentage : 0}% - 10px)`,
                      backgroundColor: hasStarted ? 'white' : '#9ca3af'
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-xs absolute -bottom-6 right-0 text-gray-300">
                {task?.deadline === null ? 'NO DEADLINE' : 'DEADLINE'}
              </div>
              <div className="text-xs absolute -bottom-6 left-0 text-gray-300">
                START
              </div>
            </div>
            
            {/* Progress Stats */}
            {hasStarted && startDate && task?.deadline && (
              <div className="flex justify-between text-xs mt-8 text-gray-400">
                <span>Day {daysElapsed}</span>
                <span className={`text-${getProgressColor()}-400 font-semibold`}>
                  {getDaysRemaining()} days remaining
                </span>
                <span>Day {task.deadline}</span>
              </div>
            )}
            
            {task?.deadline === null && (
              <div className="text-center text-xs mt-8 text-green-400">
                ✅ This task has no deadline - take your time!
              </div>
            )}

            {/* Time tracking info */}
            {hasStarted && startDate && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-md">
                <div className="text-sm text-blue-300">
                  ⏱️ Started: {new Date(startDate).toLocaleDateString()}
                  {daysElapsed > 0 && (
                    <span className="ml-2">({daysElapsed} day{daysElapsed !== 1 ? 's' : ''} ago)</span>
                  )}
                </div>
                {task?.deadline && (
                  <div className="text-xs text-blue-200 mt-1">
                    Progress: {Math.min(progressPercentage, 100).toFixed(1)}% of time elapsed
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {isMentor && (
          <div className="mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex">
                <span className="text-primary-yellow font-semibold">Starting Date: </span>
                <span className="ml-2">{startDate ? new Date(startDate).toLocaleDateString() : 'Not started'}</span>
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
            {/* Show message if task hasn't been started yet */}
            {!hasStarted && taskUnlocked && !showLockedMessage && (
              <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-md">
                <p className="text-yellow-300 text-sm">
                  💡 Click &quot;START TASK&quot; above to begin working on this task and track your progress!
                </p>
              </div>
            )}

            {/* Use corrected canEdit logic and task unlock status */}
            {canEditTask ? (
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
                        handleSubmitTask();
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
            ) : showLockedMessage ? (
              // Show locked submission area
              <div className="bg-gray-800 rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-gray-500 mb-4 md:mb-6 border border-gray-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="text-gray-400">Complete previous task to unlock</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-gray-300 mb-4 md:mb-6 border border-gray-600">
                  {submissionText || "No submission yet"}
                </div>
                
                {taskStatus === 'Submitted' && (
                  <div className="text-center">
                    <p className="text-primary-yellow font-semibold">
                      ✅ Task submitted! Waiting for review.
                    </p>
                  </div>
                )}
                
                {taskStatus === 'Reviewed' && (
                  <div className="text-center">
                    <p className="text-green-400 font-semibold">
                      🎉 Task completed and reviewed!
                    </p>
                  </div>
                )}

                {taskUnlocked && !hasStarted && taskStatus === 'Not Started' && (
                  <div className="text-center">
                    <p className="text-gray-400">
                      Start the task above to begin working on it.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Mentor view
          <div className="bg-dark-grey rounded-md p-3 md:p-4 min-h-[100px] md:min-h-[120px] text-sm md:text-base text-white-text mb-4 md:mb-6">
            {submissionText || "No submission from mentee yet"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;