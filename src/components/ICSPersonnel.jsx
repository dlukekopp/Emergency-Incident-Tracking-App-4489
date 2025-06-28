import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { auditLogger } from '../utils/auditLogger';

const { FiPlus, FiUser, FiEdit3, FiTrash2, FiUserCheck } = FiIcons;

// Predefined ICS roles
const PREDEFINED_ICS_ROLES = [
  'Incident Commander',
  'Operations Section Chief',
  'Planning Section Chief',
  'Logistics Section Chief',
  'Finance/Admin Section Chief',
  'Safety Officer',
  'Public Information Officer',
  'Liaison Officer'
];

function ICSPersonnel({ incident }) {
  const { state } = useIncident();
  const { personnel } = state;
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    personnelId: '',
    icsRole: '',
    customRole: '',
    status: 'assigned',
    notes: ''
  });

  // Load assignments for this incident
  useEffect(() => {
    const saved = localStorage.getItem(`incident-personnel-${incident.id}`);
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }, [incident.id]);

  // Save assignments
  const saveAssignments = (newAssignments) => {
    localStorage.setItem(`incident-personnel-${incident.id}`, JSON.stringify(newAssignments));
    setAssignments(newAssignments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedPerson = personnel.find(p => p.id === formData.personnelId);
    if (!selectedPerson) return;

    const finalRole = formData.icsRole === 'custom' ? formData.customRole : formData.icsRole;
    
    const assignment = {
      id: editingAssignment?.id || Date.now().toString(),
      personnelId: formData.personnelId,
      personnelName: selectedPerson.name,
      icsRole: finalRole,
      status: formData.status,
      notes: formData.notes,
      assignedAt: editingAssignment?.assignedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newAssignments;
    if (editingAssignment) {
      newAssignments = assignments.map(a => a.id === editingAssignment.id ? assignment : a);
      auditLogger.logUpdate(
        'ics-assignment',
        assignment.id,
        `Updated ICS assignment for ${selectedPerson.name} in incident ${incident.title}`,
        [
          { field: 'role', oldValue: editingAssignment.icsRole, newValue: finalRole },
          { field: 'status', oldValue: editingAssignment.status, newValue: formData.status }
        ],
        { incidentId: incident.id, personnelId: formData.personnelId }
      );
    } else {
      newAssignments = [...assignments, assignment];
      auditLogger.logCreate(
        'ics-assignment',
        assignment.id,
        `Assigned ${selectedPerson.name} as ${finalRole} to incident ${incident.title}`,
        { incidentId: incident.id, personnelId: formData.personnelId }
      );
    }

    saveAssignments(newAssignments);
    resetForm();
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      personnelId: assignment.personnelId,
      icsRole: PREDEFINED_ICS_ROLES.includes(assignment.icsRole) ? assignment.icsRole : 'custom',
      customRole: PREDEFINED_ICS_ROLES.includes(assignment.icsRole) ? '' : assignment.icsRole,
      status: assignment.status,
      notes: assignment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (assignment) => {
    if (!confirm(`Remove ${assignment.personnelName} from this incident?`)) return;
    
    const newAssignments = assignments.filter(a => a.id !== assignment.id);
    saveAssignments(newAssignments);
    
    auditLogger.logDelete(
      'ics-assignment',
      assignment.id,
      `Removed ${assignment.personnelName} (${assignment.icsRole}) from incident ${incident.title}`,
      { incidentId: incident.id, personnelId: assignment.personnelId }
    );
  };

  const resetForm = () => {
    setFormData({
      personnelId: '',
      icsRole: '',
      customRole: '',
      status: 'assigned',
      notes: ''
    });
    setEditingAssignment(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'standby': 'bg-yellow-100 text-yellow-800',
      'released': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get available personnel (not already assigned to this incident)
  const availablePersonnel = personnel.filter(person => 
    !assignments.some(assignment => assignment.personnelId === person.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ICS Personnel Assignments</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Assign Personnel</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personnel *
              </label>
              <select
                value={formData.personnelId}
                onChange={(e) => setFormData({ ...formData, personnelId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select personnel</option>
                {(editingAssignment ? personnel : availablePersonnel).map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.badge || 'No Badge'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ICS Role *
              </label>
              <select
                value={formData.icsRole}
                onChange={(e) => setFormData({ ...formData, icsRole: e.target.value, customRole: '' })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select role</option>
                {PREDEFINED_ICS_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
                <option value="custom">Custom Role...</option>
              </select>
            </div>
          </div>

          {formData.icsRole === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Role *
              </label>
              <input
                type="text"
                value={formData.customRole}
                onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                required
                placeholder="Enter custom role"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="assigned">Assigned</option>
                <option value="active">Active</option>
                <option value="standby">Standby</option>
                <option value="released">Released</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingAssignment ? 'Update Assignment' : 'Assign Personnel'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No personnel assigned to ICS roles</p>
        ) : (
          assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              className="bg-white border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUserCheck} className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.personnelName}</h4>
                    <p className="text-sm text-purple-600 font-medium">{assignment.icsRole}</p>
                    {assignment.notes && (
                      <p className="text-sm text-gray-600 mt-1">{assignment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                {assignment.updatedAt !== assignment.assignedAt && (
                  <span className="ml-4">
                    Updated: {new Date(assignment.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default ICSPersonnel;