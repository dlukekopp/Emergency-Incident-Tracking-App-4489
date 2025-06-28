import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiCheck, FiClock, FiUser, FiExternalLink, FiCalendar } = FiIcons;

function ActiveTasks() {
  const { state } = useIncident();
  const { incidents } = state;

  // Get all tasks from all incidents
  const getAllTasks = () => {
    const allTasks = [];
    incidents.forEach(incident => {
      const incidentTasks = JSON.parse(localStorage.getItem(`tasks-${incident.id}`) || '[]');
      incidentTasks.forEach(task => {
        allTasks.push({
          ...task,
          incidentId: incident.id,
          incidentTitle: incident.title,
          incidentStatus: incident.status
        });
      });
    });
    return allTasks;
  };

  const allTasks = getAllTasks();
  
  // Filter for pending tasks only, sorted by priority and due date
  const activeTasks = allTasks
    .filter(task => task.status === 'pending')
    .sort((a, b) => {
      // First sort by priority
      const priorityOrder = { critical: 4, urgent: 3, normal: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (overdue tasks first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // Finally by creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 10); // Show top 10 active tasks

  const toggleTask = (task) => {
    const incidentTasks = JSON.parse(localStorage.getItem(`tasks-${task.incidentId}`) || '[]');
    const updatedTasks = incidentTasks.map(t => 
      t.id === task.id 
        ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed', completedAt: new Date().toISOString() }
        : t
    );
    localStorage.setItem(`tasks-${task.incidentId}`, JSON.stringify(updatedTasks));
    window.location.reload(); // Simple refresh to update UI
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      normal: 'text-blue-600 bg-blue-100',
      urgent: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low',
      normal: 'Normal', 
      urgent: 'Urgent',
      critical: 'Critical'
    };
    return labels[priority] || priority;
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Active Tasks</h2>
        <Link 
          to="/incidents"
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm"
        >
          <span>View all incidents</span>
          <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active tasks across all incidents</p>
        ) : (
          activeTasks.map((task) => (
            <motion.div
              key={`${task.incidentId}-${task.id}`}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTask(task)}
                  className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <SafeIcon icon={FiCheck} className="w-2.5 h-2.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link
                      to={`/incidents/${task.incidentId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
                    >
                      {task.name}
                    </Link>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    {task.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {task.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <Link
                      to={`/incidents/${task.incidentId}`}
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                      <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                      <span>{task.incidentTitle}</span>
                    </Link>
                    
                    {task.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiUser} className="w-3 h-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                        <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && ' (Overdue)'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {activeTasks.length > 0 && (
        <div className="mt-4 text-center">
          <Link
            to="/incidents"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all incidents and tasks →
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default ActiveTasks;