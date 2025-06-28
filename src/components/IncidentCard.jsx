import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiMapPin, FiUser, FiAlertTriangle } = FiIcons;

function IncidentCard({ incident }) {
  const statusColors = {
    active: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  const typeIcons = {
    fire: FiAlertTriangle,
    medical: FiAlertTriangle,
    security: FiAlertTriangle,
    technical: FiAlertTriangle,
    general: FiAlertTriangle
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={typeIcons[incident.type] || FiAlertTriangle} 
              className={`w-5 h-5 ${priorityColors[incident.priority]}`} 
            />
            <h3 className="font-semibold text-gray-900 line-clamp-1">{incident.title}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[incident.status]}`}>
            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{incident.description}</p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <SafeIcon icon={FiClock} className="w-4 h-4" />
            <span>{new Date(incident.createdAt).toLocaleString()}</span>
          </div>
          
          {incident.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiMapPin} className="w-4 h-4" />
              <span>{incident.location}</span>
            </div>
          )}
          
          {incident.assignedTo && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              <span>{incident.assignedTo}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-xs font-medium ${priorityColors[incident.priority]}`}>
            {incident.priority?.toUpperCase()} PRIORITY
          </span>
          <span className="text-xs text-gray-500">
            #{incident.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default IncidentCard;