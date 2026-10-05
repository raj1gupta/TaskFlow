import React from 'react';
import { Calendar, AlertCircle, Edit2, Trash2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isCompleted = task.status === 'Completed';
  const isInProgress = task.status === 'In Progress';

  const isOverdue =
    task.dueDate &&
    !isCompleted &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const priorityStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-[#EAF4EE] text-[#194D33] border-[#D2E7DC]',
  }[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200';

  const handleNextStatus = () => {
    let nextStatus = 'Pending';
    if (task.status === 'Pending') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') {
      nextStatus = 'Completed';
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else if (task.status === 'Completed') {
      nextStatus = 'Pending';
    }
    onStatusChange(task._id, nextStatus);
  };

  return (
    <div
      className={`group rounded-2xl p-4 transition-all duration-200 border ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-75'
          : 'bg-white border-[#E5EAE6] hover:border-[#194D33]/40 hover:shadow-md'
      }`}
    >
      {/* Top row: Priority & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyles}`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
          {/* Quick status cycle button */}
          <button
            onClick={handleNextStatus}
            title="Advance status"
            className="p-1 rounded-lg text-slate-400 hover:text-[#194D33] hover:bg-[#EAF4EE] transition-colors cursor-pointer"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#194D33]" />
            ) : isInProgress ? (
              <ArrowRight className="w-4 h-4 text-amber-600" />
            ) : (
              <Clock className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h3
        className={`text-sm font-semibold mb-1.5 leading-snug break-words ${
          isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-[#194D33]'
        }`}
      >
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom info row */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
        {formattedDueDate ? (
          <div
            className={`flex items-center gap-1.5 font-medium ${
              isOverdue
                ? 'text-rose-600 font-semibold'
                : isCompleted
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {formattedDueDate}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">No due date</span>
        )}

        {/* Status Pill */}
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-[#EAF4EE] text-[#194D33]'
              : isInProgress
              ? 'bg-amber-50 text-amber-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
