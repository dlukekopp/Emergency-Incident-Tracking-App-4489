import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';
import PersonnelForm from '../components/PersonnelForm';
import PersonnelCard from '../components/PersonnelCard';
import PersonnelStatusLog from '../components/PersonnelStatusLog';

const { FiPlus, FiUsers, FiActivity, FiClock } = FiIcons;

function Personnel() {
  const { state } = useIncident();
  const { personnel, statusLogs } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredPersonnel = personnel.filter(person =>
    filter === 'all' || person.status === filter
  );

  const getStatusStats = () => {
    const stats = {};
    personnel.forEach(person => {
      stats[person.status] = (stats[person.status] || 0) + 1;
    });
    return stats;
  };

  const handleEdit = (person) => {
    setEditingPersonnel(person);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPersonnel(null);
  };

  const stats = getStatusStats();
  const statusTypes = [
    { value: 'all', label: 'All Personnel', color: 'bg-gray-100' },
    { value: 'on-duty', label: 'On Duty', color: 'bg-green-100' },
    { value: 'responding', label: 'Responding', color: 'bg-blue-100' },
    { value: 'on-scene', label: 'On Scene', color: 'bg-yellow-100' },
    { value: 'off-duty', label: 'Off Duty', color: 'bg-gray-100' },
    { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100' }
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SystemNotice />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Personnel Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Personnel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`p-4 rounded-lg border transition-all ${
              filter === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {type.value === 'all' ? personnel.length : (stats[type.value] || 0)}
              </p>
              <p className="text-sm text-gray-600">{type.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Personnel Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPersonnel.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PersonnelCard
                    person={person}
                    onEdit={() => handleEdit(person)}
                    onSelect={() => setSelectedPersonnel(person)}
                  />
                </motion.div>
              ))}
            </div>
            {filteredPersonnel.length === 0 && (
              <div className="text-center py-8">
                <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No personnel found for the selected status.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <PersonnelStatusLog
            selectedPersonnel={selectedPersonnel}
            statusLogs={statusLogs}
          />
        </div>
      </div>

      {showForm && (
        <PersonnelForm
          onClose={handleCloseForm}
          personnel={editingPersonnel}
        />
      )}
    </motion.div>
  );
}

export default Personnel;