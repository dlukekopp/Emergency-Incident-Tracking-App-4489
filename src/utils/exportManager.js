// Export Manager for all system exports
export const EXPORT_FORMATS = {
  CSV: 'csv',
  HTML: 'html',
  PDF: 'pdf'
};

export const exportManager = {
  // Export tasks
  exportTasks: (tasks, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `tasks-${incident?.id || 'all'}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportTasksCSV(tasks, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportTasksHTML(tasks, incident, filename);
      case EXPORT_FORMATS.PDF:
        return exportManager.exportTasksPDF(tasks, incident, filename);
    }
  },

  exportTasksCSV: (tasks, incident, filename) => {
    const headers = [
      'Task Name', 'Description', 'Priority', 'Category', 'Status', 'Assigned To',
      'Due Date', 'Created Date', 'Completed Date', 'Incident ID', 'Incident Title', 'Comments Count'
    ];

    const csvData = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.name}"`,
        `"${task.description || ''}"`,
        task.priority,
        task.category,
        task.status,
        `"${task.assignedTo || ''}"`,
        task.dueDate ? new Date(task.dueDate).toLocaleString() : '',
        new Date(task.createdAt).toLocaleString(),
        task.completedAt ? new Date(task.completedAt).toLocaleString() : '',
        task.incidentId || incident?.id || '',
        `"${task.incidentTitle || incident?.title || ''}"`,
        task.comments?.length || 0
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportTasksHTML: (tasks, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tasks Report - ${incident?.title || 'All Incidents'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .priority-critical { color: #dc2626; font-weight: bold; }
          .priority-urgent { color: #ea580c; font-weight: bold; }
          .priority-normal { color: #2563eb; }
          .priority-low { color: #16a34a; }
          .status-completed { background-color: #dcfce7; }
          .status-pending { background-color: #fef3c7; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Tasks Report</h1>
        <p><strong>Incident:</strong> ${incident?.title || 'All Incidents'}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Tasks:</strong> ${tasks.length}</p>
        <table>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr class="status-${task.status}">
                <td>${task.name}</td>
                <td class="priority-${task.priority}">${task.priority.toUpperCase()}</td>
                <td>${task.category}</td>
                <td>${task.status.toUpperCase()}</td>
                <td>${task.assignedTo || '-'}</td>
                <td>${task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</td>
                <td>${new Date(task.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export contacts and ICS personnel together
  exportContactsAndICS: (contacts, icsPersonnel, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `contacts-ics-${incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportContactsAndICSCSV(contacts, icsPersonnel, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportContactsAndICSHTML(contacts, icsPersonnel, incident, filename);
    }
  },

  exportContactsAndICSCSV: (contacts, icsPersonnel, incident, filename) => {
    const headers = ['Name', 'Type', 'Role/ICS Position', 'Phone', 'Email', 'Status', 'Assigned Date', 'Incident ID', 'Incident Title'];
    
    const csvData = [
      headers.join(','),
      // Regular contacts
      ...contacts.map(contact => [
        `"${contact.name}"`,
        'Contact',
        `"${contact.role || ''}"`,
        `"${contact.phone || ''}"`,
        `"${contact.email || ''}"`,
        'N/A',
        'N/A',
        incident.id,
        `"${incident.title}"`
      ].join(',')),
      // ICS Personnel
      ...icsPersonnel.map(person => [
        `"${person.personnelName}"`,
        'ICS Personnel',
        `"${person.icsRole}"`,
        'N/A',
        'N/A',
        person.status,
        new Date(person.assignedAt).toLocaleString(),
        incident.id,
        `"${incident.title}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportContactsAndICSHTML: (contacts, icsPersonnel, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contacts & ICS Personnel Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status-active { background-color: #dcfce7; }
          .status-assigned { background-color: #dbeafe; }
          .status-standby { background-color: #fef3c7; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Contacts & ICS Personnel Report</h1>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Key Contacts (${contacts.length})</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th></tr>
          </thead>
          <tbody>
            ${contacts.map(contact => `
              <tr>
                <td>${contact.name}</td>
                <td>${contact.role || '-'}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.email || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>ICS Personnel (${icsPersonnel.length})</h2>
        <table>
          <thead>
            <tr><th>Personnel Name</th><th>ICS Role</th><th>Status</th><th>Notes</th><th>Assigned Date</th></tr>
          </thead>
          <tbody>
            ${icsPersonnel.map(person => `
              <tr class="status-${person.status}">
                <td>${person.personnelName}</td>
                <td>${person.icsRole}</td>
                <td>${person.status.toUpperCase()}</td>
                <td>${person.notes || '-'}</td>
                <td>${new Date(person.assignedAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export contacts (legacy method for backwards compatibility)
  exportContacts: (contacts, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `contacts-${incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportContactsCSV(contacts, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportContactsHTML(contacts, incident, filename);
    }
  },

  exportContactsCSV: (contacts, incident, filename) => {
    const headers = ['Name', 'Role', 'Phone', 'Email', 'Incident ID', 'Incident Title'];
    const csvData = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.role || ''}"`,
        `"${contact.phone || ''}"`,
        `"${contact.email || ''}"`,
        incident.id,
        `"${incident.title}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportContactsHTML: (contacts, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contacts Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Contacts Report</h1>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Contacts:</strong> ${contacts.length}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            ${contacts.map(contact => `
              <tr>
                <td>${contact.name}</td>
                <td>${contact.role || '-'}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.email || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export updates
  exportUpdates: (updates, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `updates-${incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportUpdatesCSV(updates, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportUpdatesHTML(updates, incident, filename);
    }
  },

  exportUpdatesCSV: (updates, incident, filename) => {
    const headers = ['Timestamp', 'Priority', 'Category', 'Author', 'Content', 'Incident ID', 'Incident Title'];
    const csvData = [
      headers.join(','),
      ...updates.map(update => [
        new Date(update.timestamp).toLocaleString(),
        update.priority || 'normal',
        update.category || 'General',
        `"${update.author}"`,
        `"${update.content}"`,
        incident.id,
        `"${incident.title}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportUpdatesHTML: (updates, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Updates Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .update { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .update-header { font-weight: bold; margin-bottom: 10px; }
          .priority-critical { border-left: 4px solid #dc2626; }
          .priority-urgent { border-left: 4px solid #ea580c; }
          .priority-normal { border-left: 4px solid #2563eb; }
          .priority-low { border-left: 4px solid #16a34a; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Updates Report</h1>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Updates:</strong> ${updates.length}</p>
        ${updates.map(update => `
          <div class="update priority-${update.priority || 'normal'}">
            <div class="update-header">
              ${new Date(update.timestamp).toLocaleString()} - ${update.author} 
              (${(update.priority || 'normal').toUpperCase()} Priority)
              ${update.category ? ` - ${update.category}` : ''}
            </div>
            <div>${update.content}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export ICS Personnel
  exportICSPersonnel: (personnel, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `ics-personnel-${incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportICSPersonnelCSV(personnel, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportICSPersonnelHTML(personnel, incident, filename);
    }
  },

  exportICSPersonnelCSV: (personnel, incident, filename) => {
    const headers = ['Personnel Name', 'ICS Role', 'Status', 'Notes', 'Assigned Date', 'Incident ID', 'Incident Title'];
    const csvData = [
      headers.join(','),
      ...personnel.map(person => [
        `"${person.personnelName}"`,
        `"${person.icsRole}"`,
        person.status,
        `"${person.notes || ''}"`,
        new Date(person.assignedAt).toLocaleString(),
        incident.id,
        `"${incident.title}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportICSPersonnelHTML: (personnel, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ICS Personnel Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status-active { background-color: #dcfce7; }
          .status-assigned { background-color: #dbeafe; }
          .status-standby { background-color: #fef3c7; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>ICS Personnel Report</h1>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Personnel:</strong> ${personnel.length}</p>
        <table>
          <thead>
            <tr>
              <th>Personnel Name</th>
              <th>ICS Role</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Assigned Date</th>
            </tr>
          </thead>
          <tbody>
            ${personnel.map(person => `
              <tr class="status-${person.status}">
                <td>${person.personnelName}</td>
                <td>${person.icsRole}</td>
                <td>${person.status.toUpperCase()}</td>
                <td>${person.notes || '-'}</td>
                <td>${new Date(person.assignedAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export documents
  exportDocuments: (documents, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `documents-${incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportDocumentsCSV(documents, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportDocumentsHTML(documents, incident, filename);
    }
  },

  exportDocumentsCSV: (documents, incident, filename) => {
    const headers = ['Document Name', 'Notes', 'File Count', 'Uploaded By', 'Upload Date', 'Incident ID', 'Incident Title'];
    const csvData = [
      headers.join(','),
      ...documents.map(doc => [
        `"${doc.name}"`,
        `"${doc.notes || ''}"`,
        doc.files?.length || 0,
        `"${doc.uploadedBy}"`,
        new Date(doc.uploadedAt).toLocaleString(),
        incident.id,
        `"${incident.title}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportDocumentsHTML: (documents, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Documents Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Documents Report</h1>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Documents:</strong> ${documents.length}</p>
        <table>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Notes</th>
              <th>File Count</th>
              <th>Uploaded By</th>
              <th>Upload Date</th>
            </tr>
          </thead>
          <tbody>
            ${documents.map(doc => `
              <tr>
                <td>${doc.name}</td>
                <td>${doc.notes || '-'}</td>
                <td>${doc.files?.length || 0}</td>
                <td>${doc.uploadedBy}</td>
                <td>${new Date(doc.uploadedAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Export audit trail
  exportAuditTrail: (auditLogs, incident, format = EXPORT_FORMATS.CSV) => {
    const filename = `audit-trail-${incident?.id || 'system'}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return exportManager.exportAuditTrailCSV(auditLogs, incident, filename);
      case EXPORT_FORMATS.HTML:
        return exportManager.exportAuditTrailHTML(auditLogs, incident, filename);
    }
  },

  exportAuditTrailCSV: (auditLogs, incident, filename) => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Changes'];
    const csvData = [
      headers.join(','),
      ...auditLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        `"${log.userId}"`,
        log.action,
        log.entityType,
        log.entityId,
        `"${log.description}"`,
        `"${log.changes?.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ') || ''}"`
      ].join(','))
    ].join('\n');

    exportManager.downloadFile(csvData, `${filename}.csv`, 'text/csv');
  },

  exportAuditTrailHTML: (auditLogs, incident, filename) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audit Trail Report${incident ? ` - ${incident.title}` : ' - System'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .action-create { background-color: #dcfce7; }
          .action-update { background-color: #dbeafe; }
          .action-delete { background-color: #fecaca; }
          .action-status_change { background-color: #fef3c7; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Audit Trail Report</h1>
        ${incident ? `<p><strong>Incident:</strong> ${incident.title}</p>` : '<p><strong>Scope:</strong> System-wide</p>'}
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Entries:</strong> ${auditLogs.length}</p>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogs.map(log => `
              <tr class="action-${log.action.toLowerCase()}">
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.userId}</td>
                <td>${log.action}</td>
                <td>${log.entityType}</td>
                <td>${log.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Complete incident report
  exportIncidentReport: (reportData, format = EXPORT_FORMATS.HTML) => {
    const filename = `incident-report-${reportData.incident.id}-${new Date().toISOString().split('T')[0]}`;
    switch (format) {
      case EXPORT_FORMATS.HTML:
        return exportManager.exportIncidentReportHTML(reportData, filename);
      case EXPORT_FORMATS.CSV:
        return exportManager.exportIncidentReportCSV(reportData, filename);
    }
  },

  exportIncidentReportHTML: (reportData, filename) => {
    const { incident, tasks, updates, contacts, personnel, documents, auditTrail, summary } = reportData;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete Incident Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 3px solid #333; padding-bottom: 10px; }
          h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f9f9f9; }
          .priority-critical { color: #dc2626; font-weight: bold; }
          .priority-urgent { color: #ea580c; font-weight: bold; }
          .priority-normal { color: #2563eb; }
          .priority-low { color: #16a34a; }
          .status-completed { background-color: #dcfce7; }
          .status-pending { background-color: #fef3c7; }
          .action-create { background-color: #dcfce7; }
          .action-update { background-color: #dbeafe; }
          .action-delete { background-color: #fecaca; }
          .action-status_change { background-color: #fef3c7; }
          @media print { body { margin: 0; } .summary-grid { grid-template-columns: repeat(2, 1fr); } }
        </style>
      </head>
      <body>
        <h1>Complete Incident Report</h1>
        
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Incident Information</h3>
            <p><strong>Title:</strong> ${incident.title}</p>
            <p><strong>ID:</strong> ${incident.id}</p>
            <p><strong>Status:</strong> ${incident.status.toUpperCase()}</p>
            <p><strong>Priority:</strong> ${incident.priority.toUpperCase()}</p>
            <p><strong>Created:</strong> ${new Date(incident.createdAt).toLocaleString()}</p>
            <p><strong>Location:</strong> ${incident.location || 'Not specified'}</p>
            <p><strong>Assigned To:</strong> ${incident.assignedTo || 'Unassigned'}</p>
          </div>
          <div class="summary-card">
            <h3>Summary Statistics</h3>
            <p><strong>Total Tasks:</strong> ${summary.totalTasks}</p>
            <p><strong>Completed Tasks:</strong> ${summary.completedTasks}</p>
            <p><strong>Overdue Tasks:</strong> ${summary.overdueTasks}</p>
            <p><strong>Total Updates:</strong> ${summary.totalUpdates}</p>
            <p><strong>Documents:</strong> ${summary.totalDocuments}</p>
            <p><strong>Personnel Assigned:</strong> ${summary.totalPersonnelAssigned}</p>
            <p><strong>Contacts:</strong> ${summary.totalContacts}</p>
            <p><strong>Audit Entries:</strong> ${summary.auditEntries}</p>
          </div>
        </div>

        <h2>Description</h2>
        <p>${incident.description}</p>

        <h2>Tasks (${tasks.length})</h2>
        <table>
          <thead>
            <tr><th>Task Name</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Due Date</th><th>Created</th></tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr class="status-${task.status}">
                <td>${task.name}</td>
                <td class="priority-${task.priority}">${task.priority.toUpperCase()}</td>
                <td>${task.status.toUpperCase()}</td>
                <td>${task.assignedTo || '-'}</td>
                <td>${task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</td>
                <td>${new Date(task.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Updates & Log (${updates.length})</h2>
        ${updates.map(update => `
          <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid ${
            update.category === 'critical' ? '#dc2626' : 
            update.category === 'urgent' ? '#ea580c' : '#2563eb'
          };">
            <div style="font-weight: bold; margin-bottom: 10px;">
              ${new Date(update.timestamp).toLocaleString()} - ${update.author} 
              (${(update.priority || 'normal').toUpperCase()} Priority)
              ${update.category ? ` - ${update.category}` : ''}
            </div>
            <div>${update.content}</div>
          </div>
        `).join('')}

        <h2>Contacts (${contacts.length})</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th></tr>
          </thead>
          <tbody>
            ${contacts.map(contact => `
              <tr>
                <td>${contact.name}</td>
                <td>${contact.role || '-'}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.email || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>ICS Personnel (${personnel.length})</h2>
        <table>
          <thead>
            <tr><th>Personnel Name</th><th>ICS Role</th><th>Status</th><th>Assigned Date</th></tr>
          </thead>
          <tbody>
            ${personnel.map(person => `
              <tr>
                <td>${person.personnelName}</td>
                <td>${person.icsRole}</td>
                <td>${person.status.toUpperCase()}</td>
                <td>${new Date(person.assignedAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Documents (${documents.length})</h2>
        <table>
          <thead>
            <tr><th>Document Name</th><th>File Count</th><th>Uploaded By</th><th>Upload Date</th></tr>
          </thead>
          <tbody>
            ${documents.map(doc => `
              <tr>
                <td>${doc.name}</td>
                <td>${doc.files?.length || 0}</td>
                <td>${doc.uploadedBy}</td>
                <td>${new Date(doc.uploadedAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Audit Trail (${auditTrail.length})</h2>
        <table>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${auditTrail.map(log => `
              <tr class="action-${log.action.toLowerCase()}">
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.userId}</td>
                <td>${log.action}</td>
                <td>${log.entityType}</td>
                <td>${log.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 12px;">
          Report generated on ${new Date().toLocaleString()} by Emergency Management System
        </div>
      </body>
      </html>
    `;

    exportManager.downloadFile(html, `${filename}.html`, 'text/html');
  },

  // Utility function to download files
  downloadFile: (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Print function
  printContent: (content, title) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
};