import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiActivity, FiClock, FiFilter } = FiIcons;

function PersonnelTable() {
  const { state } = useIncident();
  const { personnel, incidents } = state;
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Get personnel assignments from incidents
  const getPersonnelAssignments = () => {
    const assignments = {};
    
    incidents.forEach(incident => {
      // Check regular assignedTo field
      if (incident.assignedTo) {
        const person = personnel.find(p => p.name === incident.assignedTo);
        if (person) {
          if (!assignments[person.id]) {
            assignments[person.id] = [];
          }
          assignments[person.id].push({
            incidentId: incident.id,
            incidentTitle: incident.title,
            incidentStatus: incident.status,
            role: 'Assigned'
          });
        }
      }

      // Check ICS assignments if they exist
      const incidentPersonnel = JSON.parse(localStorage.getItem(`incident-personnel-${incident.id}`) || '[]');
      incidentPersonnel.forEach(assignment => {
        if (!assignments[assignment.personnelId]) {
          assignments[assignment.personnelId] = [];
        }
        assignments[assignment.personnelId].push({
          incidentId: incident.id,
          incidentTitle: incident.title,
          incidentStatus: incident.status,
          role: assignment.icsRole || assignment.role || 'Assigned'
        });
      });
    });

    return assignments;
  };

  const assignments = getPersonnelAssignments();
  const activeIncidents = incidents.filter(i => i.status === 'active');

  const filteredPersonnel = showActiveOnly 
    ? personnel.filter(person => {
        const personAssignments = assignments[person.id] || [];
        return personAssignments.some(assignment => 
          activeIncidents.some(incident => incident.id === assignment.incidentId)
        );
      })
    : personnel;

  const getStatusColor = (status) => {
    const colors = {
      'on-duty': 'bg-green-100 text-green-800',
      'responding': 'bg-blue-100 text-blue-800',
      'on-scene': 'bg-yellow-100 text-yellow-800',
      'off-duty': 'bg-gray-100 text-gray-800',
      'unavailable': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Personnel Status</h2>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-500" />
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active incidents only</span>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Incident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.map((person) => {
              const personAssignments = assignments[person.id] || [];
              const activeAssignments = personAssignments.filter(assignment => 
                activeIncidents.some(incident => incident.id === assignment.incidentId)
              );

              if (showActiveOnly && activeAssignments.length === 0) return null;

              return (
                <tr key={person.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiUser} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.badge && `#${person.badge}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                      {person.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {personAssignments.length > 0 ? (
                      <div className="space-y-1">
                        {personAssignments.slice(0, 2).map((assignment, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {assignment.incidentTitle}
                            </div>
                            <div className={`text-xs ${assignment.incidentStatus === 'active' ? 'text-red-600' : 'text-gray-500'}`}>
                              {assignment.incidentStatus.toUpperCase()}
                            </div>
                          </div>
                        ))}
                        {personAssignments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{personAssignments.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No assignments</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {personAssignments.length > 0 ? (
                      <div className="space-y-1">
                        {personAssignments.slice(0, 2).map((assignment, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {assignment.role}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>
                        {person.lastActivity 
                          ? new Date(person.lastActivity).toLocaleString()
                          : 'No activity'
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredPersonnel.length === 0 && (
          <div className="text-center py-8">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {showActiveOnly 
                ? 'No personnel assigned to active incidents'
                : 'No personnel available'
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PersonnelTable;