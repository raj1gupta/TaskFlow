import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { CircleDot, PlayCircle, CheckCircle2, Plus } from 'lucide-react';

const KanbanBoard = ({ tasks, onEdit, onDelete, onStatusChange, onOpenCreateModal }) => {
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const columns = [
    {
      id: 'Pending',
      title: 'Pending',
      icon: CircleDot,
      color: 'text-slate-500',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: PlayCircle,
      color: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'Completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'text-[#194D33]',
      badgeBg: 'bg-[#EAF4EE] text-[#194D33] border-[#D2E7DC]',
    },
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, colId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const Icon = col.icon;
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isDraggedOver = draggedOverCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 min-h-[500px] bg-slate-50/60 ${
              isDraggedOver
                ? 'border-[#194D33] ring-2 ring-[#194D33]/20 bg-[#EAF4EE]/30'
                : 'border-[#E5EAE6]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5EAE6]">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{col.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.badgeBg}`}
                >
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateModal(col.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#194D33] hover:bg-[#EAF4EE] transition-colors cursor-pointer"
                title={`Add ${col.title} Task`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex-1 space-y-3">
              {colTasks.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-[#E5EAE6] rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-xs text-slate-400 font-medium mb-1.5">No tasks in {col.title}</p>
                  <button
                    onClick={() => onOpenCreateModal(col.id)}
                    className="text-xs text-[#194D33] hover:underline font-semibold cursor-pointer"
                  >
                    + Add task
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
