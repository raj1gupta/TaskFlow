import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, initialTask = null, loading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'Pending');
      setPriority(initialTask.priority || 'Medium');
      setDueDate(
        initialTask.dueDate
          ? new Date(initialTask.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setPriority('Medium');
      setDueDate('');
    }
    setErrors({});
  }, [initialTask, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 150) {
      newErrors.title = 'Title must be under 150 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  const setRelativeDueDate = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-[#E5EAE6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialTask ? 'Update task attributes and details' : 'Add a new action item to your workspace'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] ${title.length > 130 ? 'text-amber-500' : 'text-slate-400'}`}>
                {title.length}/150
              </span>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Develop API Endpoints"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 ${
                errors.title
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-200 focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/15'
              }`}
            />
            {errors.title && (
              <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add details, deliverables, or checklist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/15 resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
                {[
                  { value: 'Low', active: 'bg-[#EAF4EE] text-[#194D33] border border-[#D2E7DC] font-bold' },
                  { value: 'Medium', active: 'bg-amber-100/70 text-amber-800 border border-amber-200 font-bold' },
                  { value: 'High', active: 'bg-rose-100/70 text-rose-700 border border-rose-200 font-bold' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPriority(item.value)}
                    className={`py-1.5 px-2 text-xs rounded-lg transition-all text-center cursor-pointer ${
                      priority === item.value ? item.active : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Status</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
                {[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'In Progress', label: 'In Dev' },
                  { value: 'Completed', label: 'Done' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatus(item.value)}
                    className={`py-1.5 px-1.5 text-xs rounded-lg transition-all text-center cursor-pointer ${
                      status === item.value
                        ? 'bg-[#194D33] text-white font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm outline-none transition-all focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/15"
            />

            {/* Quick date chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setRelativeDueDate(0)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setRelativeDueDate(1)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setRelativeDueDate(7)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                In 1 Week
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[11px] px-2 py-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Clear date
                </button>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white shadow-md shadow-[#194D33]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
