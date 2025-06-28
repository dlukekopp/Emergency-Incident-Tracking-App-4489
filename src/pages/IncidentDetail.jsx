import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';
import TaskList from '../components/TaskList';
import UpdateLog from '../components/UpdateLog';
import ContactList from '../components/ContactList';
import ICSPersonnel from '../components/ICSPersonnel';
import DocumentManager from '../components/DocumentManager';
import AuditTrail from '../components/AuditTrail';
import IncidentForm from '../components/IncidentForm';
import { auditLogger } from '../utils/auditLogger';
import { exportManager, EXPORT_FORMATS } from '../utils/exportManager';
import { authManager } from '../utils/authManager';

const { FiArrowLeft, FiEdit3, FiUsers, FiClock, FiMapPin, FiAlertTriangle, FiDownload, FiFileText, FiMessageCircle } = FiIcons;

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useIncident();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditForm, setShowEditForm] = useState(false);

  const incident = state.incidents.find(i => i.id === id);

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incident not found.</p>
      </div>
    );
  }

  const updateIncidentStatus = (newStatus) => {
    const oldStatus = incident.status;
    dispatch({
      type: 'UPDATE_INCIDENT',
      payload: { id: incident.id, status: newStatus }
    });

    // Log audit trail
    auditLogger.logStatusChange(
      'incident',
      incident.id,
      oldStatus,
      newStatus,
      { incidentTitle: incident.title }
    );
  };

  const addUpdate = (update, priority, category) => {
    const currentUser = authManager.getCurrentUser();
    dispatch({
      type: 'ADD_UPDATE',
      payload: {
        incidentId: incident.id,
        type: 'general',
        content: update,
        priority: priority,
        category: category,
        author: currentUser?.name || 'Unknown User'
      }
    });

    // Log audit trail
    auditLogger.logCreate(
      'update',
      Date.now().toString(),
      `Added ${priority} update to incident: ${update.substring(0, 50)}...`,
      {
        incidentId: incident.id,
        priority,
        category
      }
    );
  };

  const exportIncidentReport = () => {
    const incidentUpdates = state.updates.filter(update => update.incidentId === incident.id);
    const incidentTasks = JSON.parse(localStorage.getItem(`tasks-${incident.id}`) || '[]');
    const incidentDocuments = JSON.parse(localStorage.getItem(`incident-documents-${incident.id}`) || '[]');
    const incidentPersonnel = JSON.parse(localStorage.getItem(`incident-personnel-${incident.id}`) || '[]');
    const incidentContacts = JSON.parse(localStorage.getItem(`contacts-${incident.id}`) || '[]');
    const incidentAudit = auditLogger.getLogs({ entityId: incident.id });

    const report = {
      incident: {
        ...incident,
        exportedAt: new Date().toISOString()
      },
      updates: incidentUpdates,
      tasks: incidentTasks,
      documents: incidentDocuments.map(doc => ({
        ...doc,
        files: doc.files ? doc.files.length : 0 // Don't include file data in export, just count
      })),
      personnel: incidentPersonnel,
      contacts: incidentContacts,
      auditTrail: incidentAudit,
      summary: {
        totalUpdates: incidentUpdates.length,
        totalTasks: incidentTasks.length,
        completedTasks: incidentTasks.filter(t => t.status === 'completed').length,
        overdueTasks: incidentTasks.filter(t => 
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length,
        totalDocuments: incidentDocuments.length,
        totalPersonnelAssigned: incidentPersonnel.length,
        totalContacts: incidentContacts.length,
        auditEntries: incidentAudit.length
      }
    };

    exportManager.exportIncidentReport(report, EXPORT_FORMATS.HTML);
  };

  const statusColors = {
    active: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'contacts', label: 'Contacts & ICS' },
    { id: 'documents', label: 'Documents' },
    { id: 'updates', label: 'Updates' },
    { id: 'audit', label: 'Audit Trail' }
  ];

  // Get data for overview
  const incidentTasks = JSON.parse(localStorage.getItem(`tasks-${incident.id}`) || '[]');
  const incidentContacts = JSON.parse(localStorage.getItem(`contacts-${incident.id}`) || '[]');
  const incidentPersonnel = JSON.parse(localStorage.getItem(`incident-personnel-${incident.id}`) || '[]');
  const incidentUpdates = state.updates.filter(update => update.incidentId === incident.id).slice(-10);

  const renderOverview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Incident Overview</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium">Tasks</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600">{incidentTasks.length}</p>
          <p className="text-sm text-gray-600">
            {incidentTasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-green-600" />
            <h4 className="font-medium">Contacts</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">{incidentContacts.length}</p>
          <p className="text-sm text-gray-600">Key contacts</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium">Personnel</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">{incidentPersonnel.length}</p>
          <p className="text-sm text-gray-600">ICS assigned</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiMessageCircle} className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium">Updates</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{state.updates.filter(u => u.incidentId === incident.id).length}</p>
          <p className="text-sm text-gray-600">Total updates</p>
        </div>
      </div>

      {/* Contacts Table */}
      {incidentContacts.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Key Contacts</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidentContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{contact.role || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{contact.phone || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{contact.email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Updates */}
      {incidentUpdates.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Recent Updates (Last 10)</h4>
          <div className="space-y-3">
            {incidentUpdates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">Update</span>
                  {update.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      update.priority === 'critical' ? 'text-red-600 bg-red-100' :
                      update.priority === 'urgent' ? 'text-orange-600 bg-orange-100' :
                      update.priority === 'normal' ? 'text-blue-600 bg-blue-100' :
                      'text-green-600 bg-green-100'
                    }`}>
                      {update.priority.toUpperCase()}
                    </span>
                  )}
                  {update.category && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {update.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 mb-2">{update.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{update.author}</span>
                  <span>•</span>
                  <span>{new Date(update.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State Messages */}
      {incidentContacts.length === 0 && incidentUpdates.length === 0 && incidentTasks.length === 0 && (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
          <p className="text-gray-600">
            Start by adding tasks, contacts, or updates to this incident using the tabs above.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SystemNotice />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
            <p className="text-gray-600 mt-1">Incident #{incident.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportIncidentReport}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setShowEditForm(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
            <span>Edit Incident</span>
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[incident.status]}`}>
            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </span>
          <select
            value={incident.status}
            onChange={(e) => updateIncidentStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className={`w-5 h-5 ${priorityColors[incident.priority]}`} />
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-medium capitalize">{incident.priority}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(incident.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{incident.location || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Assigned</p>
              <p className="font-medium">{incident.assignedTo || 'Unassigned'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Description</p>
          <p className="text-gray-800">{incident.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          
          {activeTab === 'tasks' && <TaskList incidentId={incident.id} incident={incident} />}
          
          {activeTab === 'contacts' && (
            <div className="space-y-8">
              <ContactList incident={incident} />
              <ICSPersonnel incident={incident} />
            </div>
          )}
          
          {activeTab === 'documents' && <DocumentManager incidentId={incident.id} />}
          
          {activeTab === 'updates' && (
            <UpdateLog incidentId={incident.id} onAddUpdate={addUpdate} incident={incident} />
          )}
          
          {activeTab === 'audit' && <AuditTrail incidentId={incident.id} />}
        </div>
      </div>

      {showEditForm && (
        <IncidentForm onClose={() => setShowEditForm(false)} incident={incident} />
      )}
    </motion.div>
  );
}

export default IncidentDetail;