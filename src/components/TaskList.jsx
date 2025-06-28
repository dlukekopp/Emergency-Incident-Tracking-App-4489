import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { auditLogger } from '../utils/auditLogger';
import { exportManager, EXPORT_FORMATS } from '../utils/exportManager';
import { authManager } from '../utils/authManager';

const { FiPlus, FiCheck, FiClock, FiUser, FiTrash2, FiMessageCircle, FiEdit3, FiDownload, FiFilter, FiCalendar } = FiIcons;

// Predefined priority levels
const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
];

// Default task categories - users can add more
const DEFAULT_TASK_CATEGORIES = [
  'General', 'Operations', 'Planning', 'Logistics', 'Safety', 
  'Communications', 'Medical', 'Security', 'Evacuation', 'Recovery'
];

function TaskList({ incidentId, incident }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`tasks-${incidentId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [taskCategories, setTaskCategories] = useState(() => {
    const saved = localStorage.getItem('taskCategories');
    return saved ? JSON.parse(saved) : DEFAULT_TASK_CATEGORIES;
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedTo: '',
    priority: 'normal',
    category: 'General',
    dueDate: '',
    dueTime: '',
    createdDate: '',
    createdTime: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all',
    status: 'all',
    assignedTo: 'all'
  });
  const [sortBy, setSortBy] = useState('created');

  const saveTasks = (updatedTasks) => {
    localStorage.setItem(`tasks-${incidentId}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const saveCategories = (updatedCategories) => {
    localStorage.setItem('taskCategories', JSON.stringify(updatedCategories));
    setTaskCategories(updatedCategories);
  };

  const addCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim() || taskCategories.includes(newCategory)) return;

    const updatedCategories = [...taskCategories, newCategory];
    saveCategories(updatedCategories);
    setNewCategory('');
    setShowCategoryForm(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const currentUser = authManager.getCurrentUser();

    // Handle created date/time
    let createdAt;
    if (formData.createdDate && formData.createdTime) {
      createdAt = new Date(`${formData.createdDate}T${formData.createdTime}`).toISOString();
    } else if (formData.createdDate) {
      createdAt = new Date(`${formData.createdDate}T00:00`).toISOString();
    } else {
      createdAt = new Date().toISOString();
    }

    const task = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      category: formData.category,
      status: 'pending',
      createdAt: createdAt,
      dueDate: formData.dueDate ? new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`).toISOString() : null,
      incidentId,
      comments: []
    };

    saveTasks([...tasks, task]);
    auditLogger.logCreate(
      'task',
      task.id,
      `Created ${formData.priority} priority task: ${formData.name}`,
      {
        incidentId,
        incidentTitle: incident?.title,
        priority: formData.priority,
        category: formData.category,
        assignedTo: formData.assignedTo
      }
    );
    resetForm();
  };

  const editTask = (task) => {
    setEditingTask(task);
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const createdDate = new Date(task.createdAt);
    
    setFormData({
      name: task.name,
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      priority: task.priority,
      category: task.category,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : '',
      dueTime: dueDate ? dueDate.toTimeString().slice(0, 5) : '',
      createdDate: createdDate.toISOString().split('T')[0],
      createdTime: createdDate.toTimeString().slice(0, 5)
    });
    setShowForm(true);
  };

  const updateTask = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Handle created date/time
    let createdAt;
    if (formData.createdDate && formData.createdTime) {
      createdAt = new Date(`${formData.createdDate}T${formData.createdTime}`).toISOString();
    } else if (formData.createdDate) {
      createdAt = new Date(`${formData.createdDate}T00:00`).toISOString();
    } else {
      createdAt = editingTask.createdAt;
    }

    const updatedTask = {
      ...editingTask,
      name: formData.name,
      description: formData.description,
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      category: formData.category,
      createdAt: createdAt,
      dueDate: formData.dueDate ? new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`).toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id ? updatedTask : task
    );
    saveTasks(updatedTasks);

    // Audit log for task update
    const changes = [];
    ['name', 'description', 'assignedTo', 'priority', 'category', 'createdAt', 'dueDate'].forEach(field => {
      const oldValue = field === 'dueDate' ? editingTask.dueDate : 
                     field === 'createdAt' ? editingTask.createdAt : editingTask[field];
      const newValue = field === 'dueDate' ? updatedTask.dueDate : 
                       field === 'createdAt' ? updatedTask.createdAt : formData[field];
      if (oldValue !== newValue) {
        changes.push({
          field,
          oldValue: oldValue || '',
          newValue: newValue || ''
        });
      }
    });

    if (changes.length > 0) {
      auditLogger.logUpdate(
        'task',
        editingTask.id,
        `Updated task: ${formData.name}`,
        changes,
        {
          incidentId,
          incidentTitle: incident?.title,
          taskName: formData.name
        }
      );
    }

    resetForm();
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        auditLogger.logStatusChange(
          'task',
          task.id,
          task.status,
          newStatus,
          {
            incidentId,
            incidentTitle: incident?.title,
            taskName: task.name
          }
        );
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!confirm(`Delete task "${task?.name}"?`)) return;

    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);

    auditLogger.logDelete(
      'task',
      taskId,
      `Deleted task: ${task?.name}`,
      {
        incidentId,
        incidentTitle: incident?.title,
        taskName: task?.name
      }
    );
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    const currentUser = authManager.getCurrentUser();
    const comment = {
      id: Date.now().toString(),
      content: newComment,
      author: currentUser?.name || 'Unknown User',
      timestamp: new Date().toISOString()
    };

    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        const updatedTask = {
          ...task,
          comments: [...(task.comments || []), comment]
        };
        auditLogger.logCreate(
          'task-comment',
          comment.id,
          `Added comment to task: ${newComment.substring(0, 50)}...`,
          {
            incidentId,
            incidentTitle: incident?.title,
            taskId: task.id,
            taskName: task.name
          }
        );
        return updatedTask;
      }
      return task;
    });

    saveTasks(updatedTasks);
    setNewComment('');
    setShowCommentForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      assignedTo: '',
      priority: 'normal',
      category: 'General',
      dueDate: '',
      dueTime: '',
      createdDate: '',
      createdTime: ''
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleExport = (format) => {
    exportManager.exportTasks(filteredAndSortedTasks, incident, format);
  };

  const getPriorityColor = (priority) => {
    const priorityObj = TASK_PRIORITIES.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'text-gray-600 bg-gray-100';
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = TASK_PRIORITIES.find(p => p.value === priority);
    return priorityObj ? priorityObj.label : priority;
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, urgent: 3, normal: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'status':
          if (a.status === b.status) return 0;
          return a.status === 'pending' ? -1 : 1;
        default: // created
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Get unique assignees for filter
  const uniqueAssignees = [...new Set(tasks.map(t => t.assignedTo).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.CSV)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.HTML)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export HTML
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {TASK_PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {taskCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Created Date</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={editingTask ? updateTask : addTask}
            className="bg-gray-50 p-4 rounded-lg space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter task name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Enter assignee name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TASK_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    className="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Created Date/Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created Date
                </label>
                <input
                  type="date"
                  value={formData.createdDate}
                  onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created Time
                </label>
                <input
                  type="time"
                  value={formData.createdTime}
                  onChange={(e) => setFormData({ ...formData, createdTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Due Date/Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {showCategoryForm && (
              <div className="bg-white p-3 rounded border">
                <form onSubmit={addCategory} className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {tasks.length === 0 ? 'No tasks assigned to this incident.' : 'No tasks match the current filters.'}
          </p>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <motion.div
              key={task.id}
              className="bg-white border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-1 ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <SafeIcon icon={FiCheck} className="w-3 h-3" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    {task.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiUser} className="w-3 h-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                        <span className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                          Due: {new Date(task.dueDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {task.comments && task.comments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiMessageCircle} className="w-3 h-3" />
                        <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  {task.comments && task.comments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded p-2">
                          <p className="text-sm text-gray-800">{comment.content}</p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <span>{comment.author}</span>
                            <span>•</span>
                            <span>{new Date(comment.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Form */}
                  {showCommentForm && selectedTask?.id === task.id && (
                    <form onSubmit={addComment} className="mt-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCommentForm(false)}
                          className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => editTask(task)}
                    className="p-1 text-gray-500 hover:text-blue-700 transition-colors"
                    title="Edit task"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowCommentForm(true);
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    title="Add comment"
                  >
                    <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete task"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;