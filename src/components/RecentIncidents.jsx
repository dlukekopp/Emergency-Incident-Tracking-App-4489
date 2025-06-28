import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowRight, FiClock } = FiIcons;

function RecentIncidents({ incidents }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
        <Link
          to="/incidents"
          className="text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm"
        >
          <span>View all</span>
          <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active incidents</p>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="border-l-4 border-red-500 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{incident.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority?.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default RecentIncidents;