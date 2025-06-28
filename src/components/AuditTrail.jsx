import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { exportManager, EXPORT_FORMATS } from '../utils/exportManager';

const { FiClock, FiUser, FiEdit3, FiPlus, FiTrash2, FiActivity, FiFilter, FiDownload } = FiIcons;

function AuditTrail({ incidentId = null, maxEntries = 50 }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    let filteredLogs = logs;

    if (incidentId) {
      filteredLogs = logs.filter(log =>
        log.entityId === incidentId ||
        (log.metadata && log.metadata.incidentId === incidentId)
      );
    }

    if (filter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === filter);
    }

    // Sort by timestamp (newest first) and limit entries
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAuditLogs(filteredLogs.slice(0, maxEntries));
  }, [incidentId, filter, maxEntries]);

  const getActionIcon = (action) => {
    const icons = {
      'CREATE': FiPlus,
      'UPDATE': FiEdit3,
      'DELETE': FiTrash2,
      'STATUS_CHANGE': FiActivity
    };
    return icons[action] || FiEdit3;
  };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'text-green-600 bg-green-100',
      'UPDATE': 'text-blue-600 bg-blue-100',
      'DELETE': 'text-red-600 bg-red-100',
      'STATUS_CHANGE': 'text-yellow-600 bg-yellow-100'
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  const formatFieldChange = (log) => {
    if (log.changes && log.changes.length > 0) {
      return log.changes.map((change, index) => (
        <div key={index} className="text-sm text-gray-600 mt-1">
          <span className="font-medium">{change.field}:</span>
          {change.oldValue && (
            <span className="text-red-600 line-through ml-1">{change.oldValue}</span>
          )}
          {change.newValue && (
            <span className="text-green-600 ml-1">{change.newValue}</span>
          )}
        </div>
      ));
    }
    return null;
  };

  const handleExport = (format) => {
    exportManager.exportAuditTrail(auditLogs, incidentId ? { id: incidentId } : null, format);
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {incidentId ? 'Incident Audit Trail' : 'System Audit Trail'}
        </h3>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.CSV)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.HTML)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export HTML
                </button>
              </div>
            </div>
          </div>
          <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
            <option value="STATUS_CHANGE">Status Changes</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit entries found</p>
          </div>
        ) : (
          auditLogs.map((log) => (
            <motion.div
              key={log.id}
              className="border-l-4 border-blue-500 pl-4 py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                  <SafeIcon icon={getActionIcon(log.action)} className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {log.action.replace('_', ' ')} {log.entityType}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{log.entityId.slice(0, 8)}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                  )}
                  {formatFieldChange(log)}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiUser} className="w-3 h-3" />
                      <span>{log.userId}</span>
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
    </motion.div>
  );
}

export default AuditTrail;