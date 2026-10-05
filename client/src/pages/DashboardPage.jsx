import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatsOverview from '../components/StatsOverview';
import KanbanBoard from '../components/KanbanBoard';
import TaskListView from '../components/TaskListView';
import TaskModal from '../components/TaskModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { taskService } from '../services/api';
import {
  Filter,
  Kanban,
  List,
  Plus,
  RefreshCw,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

const DEMO_TASKS = [
  {
    _id: 'demo-1',
    title: 'Develop API Endpoints',
    description: 'Build REST endpoints with express-validator and JWT protection',
    status: 'Pending',
    priority: 'High',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-2',
    title: 'Onboarding Flow',
    description: 'Design step-by-step OTP email verification and Google OAuth flow',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-3',
    title: 'Build Dashboard',
    description: 'Implement TaskFlow Kanban board and analytics summary cards',
    status: 'Completed',
    priority: 'High',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-4',
    title: 'Optimize Page Load',
    description: 'Lazy load components and streamline asset bundles with Vite',
    status: 'Pending',
    priority: 'Low',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-5',
    title: 'Cross-Browser Testing',
    description: 'Verify responsiveness and theme consistency across Chrome, Firefox, and Safari',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const DashboardPage = () => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & View State
  const [viewMode, setViewMode] = useState('board');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [presetStatus, setPresetStatus] = useState('Pending');
  const [submitting, setSubmitting] = useState(false);

  // Auth Prompt Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch or filter tasks
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated) {
      // Use demo tasks for unauthenticated preview
      let filtered = [...DEMO_TASKS];
      if (statusFilter !== 'All') {
        filtered = filtered.filter((t) => t.status === statusFilter);
      }
      if (priorityFilter !== 'All') {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        );
      }

      setTasks(filtered);
      setStats({
        total: DEMO_TASKS.length,
        pending: DEMO_TASKS.filter((t) => t.status === 'Pending').length,
        inProgress: DEMO_TASKS.filter((t) => t.status === 'In Progress').length,
        completed: DEMO_TASKS.filter((t) => t.status === 'Completed').length,
        overdue: 1,
      });
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [tasksRes, statsRes] = await Promise.all([
        taskService.getTasks({
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
          sortBy,
          order: sortOrder,
        }),
        taskService.getStats(),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.tasks || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.warn('Could not fetch user tasks:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, statusFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal for task creation (guards authentication!)
  const handleOpenCreateModal = (defaultStatus = 'Pending') => {
    if (!isAuthenticated) {
      setPendingAction(() => () => {
        setEditingTask(null);
        setPresetStatus(defaultStatus);
        setModalOpen(true);
      });
      setAuthModalOpen(true);
      return;
    }

    setEditingTask(null);
    setPresetStatus(defaultStatus);
    setModalOpen(true);
  };

  // Open modal for editing existing task
  const handleOpenEditModal = (task) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setEditingTask(task);
    setModalOpen(true);
  };

  // Submit task (Create or Edit)
  const handleSubmitTask = async (taskFormData) => {
    try {
      setSubmitting(true);
      if (editingTask) {
        const res = await taskService.updateTask(editingTask._id, taskFormData);
        if (res.success) {
          toast.success('Task updated successfully.');
          setModalOpen(false);
          fetchData(true);
        }
      } else {
        const res = await taskService.createTask(taskFormData);
        if (res.success) {
          toast.success('Task created successfully.');
          setModalOpen(false);
          fetchData(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Change task status (guards authentication!)
  const handleStatusChange = async (taskId, newStatus) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTask(taskId, { status: newStatus });
      const statsRes = await taskService.getStats();
      if (statsRes.success) setStats(statsRes.stats);
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status.');
      fetchData(true);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await taskService.deleteTask(taskId);
      if (res.success) {
        toast.success('Task deleted.');
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        const statsRes = await taskService.getStats();
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  // Callback when user completes authentication via modal
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    fetchData(true);

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenCreateModal={() => handleOpenCreateModal('Pending')}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest Mode Announcement Banner */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EAF4EE] border border-[#D2E7DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#194D33] shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#194D33] shrink-0" />
              <span>
                <strong>Workspace Preview:</strong> You are exploring TaskFlow in guest mode. Sign in to create, update, and sync your personal tasks.
              </span>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
            >
              Sign In to Create Tasks
            </button>
          </div>
        )}

        {/* Dashboard Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Plan, prioritize, and accomplish your tasks with ease.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center p-1 rounded-full bg-white border border-[#E5EAE6] shadow-sm">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-[#194D33] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#194D33] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {/* + Add Task Button (Prompts Auth if not logged in!) */}
            <button
              onClick={() => handleOpenCreateModal('Pending')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white font-bold text-sm shadow-md shadow-[#194D33]/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* 4 Top Metric Cards */}
        <StatsOverview stats={stats} />

        {/* Filter Controls Row */}
        <div className="rounded-2xl border border-[#E5EAE6] bg-white p-3.5 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#EAF4EE] text-[#194D33] border border-[#D2E7DC]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Priority & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-slate-700 outline-none cursor-pointer font-bold"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="bg-transparent text-slate-700 outline-none cursor-pointer font-bold"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="dueDate-asc">Due Soonest</option>
                <option value="priority-desc">Priority</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh tasks"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#194D33]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Content: Board vs List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-[#194D33]/20 border-t-[#194D33] rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-400">Loading tasks...</p>
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Task Creation & Editing Modal (Available once authenticated) */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialTask={editingTask || (presetStatus ? { status: presetStatus } : null)}
        loading={submitting}
      />

      {/* Authentication Prompt Modal (Triggered on unauthenticated actions) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Sign In to Manage Tasks"
        subtitle="Sign in or create an account with email OTP or Google to add, edit, and organize tasks."
      />
    </div>
  );
};

export default DashboardPage;
