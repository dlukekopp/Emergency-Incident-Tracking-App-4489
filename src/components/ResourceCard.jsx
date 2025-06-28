import React from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiPhone, FiUsers, FiTruck, FiRadio } = FiIcons;

function ResourceCard({ resource }) {
  const { dispatch } = useIncident();

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    deployed: 'bg-red-100 text-red-800 border-red-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  const typeIcons = {
    personnel: FiUsers,
    vehicle: FiTruck,
    equipment: FiRadio
  };

  const updateStatus = (newStatus) => {
    dispatch({
      type: 'UPDATE_RESOURCE',
      payload: { ...resource, status: newStatus }
    });
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={typeIcons[resource.type] || FiUsers} 
              className="w-5 h-5 text-blue-600" 
            />
            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[resource.status]}`}>
            {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
          </span>
        </div>

        {resource.description && (
          <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
        )}

        <div className="space-y-2">
          {resource.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiMapPin} className="w-4 h-4" />
              <span>{resource.location}</span>
            </div>
          )}
          
          {resource.contact && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiPhone} className="w-4 h-4" />
              <span>{resource.contact}</span>
            </div>
          )}
          
          {resource.capacity && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium">Capacity:</span>
              <span>{resource.capacity}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <select
            value={resource.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <span className="text-xs text-gray-500 capitalize">
            {resource.type}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ResourceCard;