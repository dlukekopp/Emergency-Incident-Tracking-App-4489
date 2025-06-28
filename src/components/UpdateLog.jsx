import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { exportManager, EXPORT_FORMATS } from '../utils/exportManager';
import { authManager } from '../utils/authManager';

const { FiPlus, FiClock, FiUser, FiMessageCircle, FiDownload } = FiIcons;

// Unified priority system matching tasks
const UPDATE_PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'text-green-600 bg-green-100' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
];

// Default update categories - users can add more (shared with tasks)
const getUpdateCategories = () => {
  const saved = localStorage.getItem('taskCategories');
  return saved ? JSON.parse(saved) : [
    'General', 'Operations', 'Planning', 'Logistics', 'Safety',
    'Communications', 'Medical', 'Security', 'Evacuation', 'Recovery'
  ];
};

function UpdateLog({ incidentId, onAddUpdate, incident }) {
  const { state } = useIncident();
  const [newUpdate, setNewUpdate] = useState('');
  const [updatePriority, setUpdatePriority] = useState('normal');
  const [updateCategory, setUpdateCategory] = useState('General');
  const [showForm, setShowForm] = useState(false);
  const [updateCategories, setUpdateCategories] = useState(getUpdateCategories);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const incidentUpdates = state.updates.filter(update => update.incidentId === incidentId);

  const saveCategories = (updatedCategories) => {
    localStorage.setItem('taskCategories', JSON.stringify(updatedCategories));
    setUpdateCategories(updatedCategories);
  };

  const addCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim() || updateCategories.includes(newCategory)) return;

    const updatedCategories = [...updateCategories, newCategory];
    saveCategories(updatedCategories);
    setNewCategory('');
    setShowCategoryForm(false);
  };

  const addUpdate = (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    onAddUpdate(newUpdate, updatePriority, updateCategory);
    setNewUpdate('');
    setUpdatePriority('normal');
    setUpdateCategory('General');
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    const priorityObj = UPDATE_PRIORITIES.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'text-gray-600 bg-gray-100';
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = UPDATE_PRIORITIES.find(p => p.value === priority);
    return priorityObj ? priorityObj.label : priority;
  };

  const handleExport = (format) => {
    exportManager.exportUpdates(incidentUpdates, incident, format);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Updates & Log</h3>
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
            <span>Add Update</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addUpdate} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Details *
            </label>
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Enter update details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={updatePriority}
                onChange={(e) => setUpdatePriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {UPDATE_PRIORITIES.map(priority => (
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
                value={updateCategory}
                onChange={(e) => setUpdateCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {updateCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
              Add Update
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {incidentUpdates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No updates logged for this incident.</p>
        ) : (
          incidentUpdates.map((update) => (
            <motion.div
              key={update.id}
              className="bg-white border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiMessageCircle} className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">Update</span>
                    {update.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        {getPriorityLabel(update.priority)}
                      </span>
                    )}
                    {update.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {update.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 mb-3">{update.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiUser} className="w-3 h-3" />
                      <span>{update.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>{new Date(update.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default UpdateLog;