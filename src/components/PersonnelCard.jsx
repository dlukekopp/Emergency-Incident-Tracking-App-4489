import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiPhone, FiRadio, FiEdit3, FiActivity, FiClock } = FiIcons;

function PersonnelCard({ person, onEdit, onSelect }) {
  const { dispatch } = useIncident();
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const statusColors = {
    'on-duty': 'bg-green-100 text-green-800 border-green-200',
    'responding': 'bg-blue-100 text-blue-800 border-blue-200',
    'on-scene': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'off-duty': 'bg-gray-100 text-gray-800 border-gray-200',
    'unavailable': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusOptions = [
    { value: 'on-duty', label: 'On Duty' },
    { value: 'responding', label: 'Responding' },
    { value: 'on-scene', label: 'On Scene' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  const updateStatus = (newStatus) => {
    const previousStatus = person.status;
    
    // Update personnel status
    dispatch({
      type: 'UPDATE_PERSONNEL',
      payload: { ...person, status: newStatus }
    });

    // Log the status change
    dispatch({
      type: 'ADD_STATUS_LOG',
      payload: {
        personnelId: person.id,
        previousStatus,
        newStatus,
        notes: statusNotes || `Status changed from ${previousStatus} to ${newStatus}`,
        updatedBy: 'Current User'
      }
    });

    setShowStatusUpdate(false);
    setStatusNotes('');
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus !== person.status) {
      setShowStatusUpdate(true);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={() => onSelect && onSelect()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{person.name}</h3>
              <p className="text-sm text-gray-600">
                {person.badge && `#${person.badge}`} {person.role}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {person.department && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Department:</span> {person.department}
            </p>
          )}
          {person.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <SafeIcon icon={FiPhone} className="w-3 h-3" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.radio && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <SafeIcon icon={FiRadio} className="w-3 h-3" />
              <span>{person.radio}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[person.status]}`}>
            {statusOptions.find(opt => opt.value === person.status)?.label || person.status}
          </span>
          
          <select
            value={person.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {person.lastActivity && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
            <SafeIcon icon={FiClock} className="w-3 h-3" />
            <span>Last update: {new Date(person.lastActivity).toLocaleString()}</span>
          </div>
        )}
      </motion.div>

      {showStatusUpdate && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <p className="text-gray-600 mb-4">
              Updating {person.name}'s status. Add any relevant notes:
            </p>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Optional notes about this status change..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowStatusUpdate(false);
                  setStatusNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(statusOptions.find(opt => opt.value !== person.status)?.value || 'on-duty')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default PersonnelCard;