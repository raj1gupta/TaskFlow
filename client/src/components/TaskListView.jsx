import React from 'react';
import { Calendar, AlertCircle, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';

const TaskListView = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  const toggleComplete = (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    if (nextStatus === 'Completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onStatusChange(task._id, nextStatus);
  };

  const priorityStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-[#EAF4EE] text-[#194D33] border-[#D2E7DC]',
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5EAE6] bg-white p-12 text-center shadow-sm">
        <p className="text-slate-400 text-sm">No tasks found matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5EAE6] bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-[#F8FAF9] border-b border-[#E5EAE6] text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">Done</th>
              <th className="py-3.5 px-4">Task Details</th>
              <th className="py-3.5 px-4 w-28">Priority</th>
              <th className="py-3.5 px-4 w-36">Status</th>
              <th className="py-3.5 px-4 w-36">Due Date</th>
              <th className="py-3.5 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const isOverdue =
                task.dueDate &&
                !isCompleted &&
                new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <tr
                  key={task._id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Done checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleComplete(task)}
                      className="cursor-pointer text-slate-400 hover:text-[#194D33] transition-colors inline-flex items-center justify-center"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#194D33] fill-[#EAF4EE]" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-4">
                    <p
                      className={`font-semibold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        priorityStyles[task.priority] || ''
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task._id, e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-2.5 py-1 outline-none focus:border-[#194D33] cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        {isOverdue ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(task._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListView;
