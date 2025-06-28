import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiActivity, FiClock, FiUser, FiMessageCircle } = FiIcons;

function PersonnelStatusLog({ selectedPersonnel, statusLogs }) {
  const personnelLogs = selectedPersonnel 
    ? statusLogs.filter(log => log.personnelId === selectedPersonnel.id)
    : statusLogs.slice(0, 10); // Show recent logs if no personnel selected

  const getStatusColor = (status) => {
    const colors = {
      'on-duty': 'text-green-600',
      'responding': 'text-blue-600',
      'on-scene': 'text-yellow-600',
      'off-duty': 'text-gray-600',
      'unavailable': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <SafeIcon icon={FiActivity} className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold">
          {selectedPersonnel ? `${selectedPersonnel.name} - Status Log` : 'Recent Status Changes'}
        </h2>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {personnelLogs.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedPersonnel 
                ? 'No status changes recorded for this person.' 
                : 'No status changes recorded yet.'
              }
            </p>
          </div>
        ) : (
          personnelLogs.map((log) => (
            <motion.div
              key={log.id}
              className="border-l-4 border-blue-500 pl-4 py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiActivity} className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${getStatusColor(log.previousStatus)}`}>
                      {log.previousStatus}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`text-sm font-medium ${getStatusColor(log.newStatus)}`}>
                      {log.newStatus}
                    </span>
                  </div>
                  
                  {log.notes && (
                    <p className="text-sm text-gray-600 mb-2">{log.notes}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiUser} className="w-3 h-3" />
                      <span>{log.updatedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
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

export default PersonnelStatusLog;