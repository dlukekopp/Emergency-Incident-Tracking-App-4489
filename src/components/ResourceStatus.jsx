import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiTruck, FiRadio, FiArrowRight } = FiIcons;

function ResourceStatus({ resources }) {
  const getResourcesByType = (type) => {
    return resources.filter(r => r.type === type);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'deployed': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const resourceTypes = [
    { type: 'personnel', icon: FiUsers, label: 'Personnel' },
    { type: 'vehicle', icon: FiTruck, label: 'Vehicles' },
    { type: 'equipment', icon: FiRadio, label: 'Equipment' }
  ];

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Resource Status</h2>
        <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm">
          <span>View all</span>
          <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resourceTypes.map((resourceType) => {
          const typeResources = getResourcesByType(resourceType.type);
          const available = typeResources.filter(r => r.status === 'available').length;
          const deployed = typeResources.filter(r => r.status === 'deployed').length;
          const total = typeResources.length;

          return (
            <div key={resourceType.type} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon icon={resourceType.icon} className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">{resourceType.label}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Available:</span>
                  <span className="font-medium text-green-600">{available}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Deployed:</span>
                  <span className="font-medium text-red-600">{deployed}</span>
                </div>
                
                {total > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Availability</span>
                      <span>{Math.round((available / total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(available / total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-8">
          <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No resources available</p>
        </div>
      )}
    </motion.div>
  );
}

export default ResourceStatus;