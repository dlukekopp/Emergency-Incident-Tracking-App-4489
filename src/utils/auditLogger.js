// Audit logging utility
import { authManager } from './authManager';

export const auditLogger = {
  log: (action, entityType, entityId, description, changes = [], metadata = {}) => {
    const currentUser = authManager.getCurrentUser();
    const auditEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser?.name || 'Unknown User', // Use actual user name
      action, // CREATE, UPDATE, DELETE, STATUS_CHANGE
      entityType, // incident, personnel, resource, contact, etc.
      entityId,
      description,
      changes, // Array of {field, oldValue, newValue}
      metadata // Additional context data
    };

    // Get existing logs
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    
    // Add new entry
    existingLogs.push(auditEntry);
    
    // Keep only last 1000 entries to prevent storage bloat
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }

    // Save back to storage
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
    
    return auditEntry;
  },

  // Helper methods for common audit scenarios
  logCreate: (entityType, entityId, description, metadata = {}) => {
    return auditLogger.log('CREATE', entityType, entityId, description, [], metadata);
  },

  logUpdate: (entityType, entityId, description, changes = [], metadata = {}) => {
    return auditLogger.log('UPDATE', entityType, entityId, description, changes, metadata);
  },

  logDelete: (entityType, entityId, description, metadata = {}) => {
    return auditLogger.log('DELETE', entityType, entityId, description, [], metadata);
  },

  logStatusChange: (entityType, entityId, oldStatus, newStatus, metadata = {}) => {
    return auditLogger.log(
      'STATUS_CHANGE',
      entityType,
      entityId,
      `Status changed from ${oldStatus} to ${newStatus}`,
      [{ field: 'status', oldValue: oldStatus, newValue: newStatus }],
      metadata
    );
  },

  // Get audit logs with optional filtering
  getLogs: (filters = {}) => {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    let filteredLogs = logs;

    if (filters.entityId) {
      filteredLogs = filteredLogs.filter(log => log.entityId === filters.entityId);
    }

    if (filters.entityType) {
      filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo));
    }

    // Sort by timestamp (newest first)
    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};