import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';

const { FiFileText, FiDownload, FiCalendar, FiBarChart, FiTrendingUp, FiUsers, FiActivity, FiAlertTriangle } = FiIcons;

function Reports() {
  const { state } = useIncident();
  const { incidents, personnel, updates } = state;
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState('30days');

  // Get filtered data based on date range
  const getFilteredData = () => {
    const now = new Date();
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return {
      incidents: incidents.filter(i => new Date(i.createdAt) > cutoff),
      personnel: personnel,
      updates: updates.filter(u => new Date(u.timestamp) > cutoff)
    };
  };

  const filteredData = getFilteredData();

  // Calculate basic statistics
  const stats = {
    totalIncidents: filteredData.incidents.length,
    activeIncidents: filteredData.incidents.filter(i => i.status === 'active').length,
    resolvedIncidents: filteredData.incidents.filter(i => i.status === 'resolved').length,
    pendingIncidents: filteredData.incidents.filter(i => i.status === 'pending').length,
    totalPersonnel: personnel.length,
    activePersonnel: personnel.filter(p => ['on-duty', 'responding', 'on-scene'].includes(p.status)).length,
    totalUpdates: filteredData.updates.length,
    highPriorityIncidents: filteredData.incidents.filter(i => i.priority === 'high').length
  };

  // Export functions
  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Type', 'Created Date', 'Location', 'Assigned To'];
    const csvData = [
      headers.join(','),
      ...filteredData.incidents.map(incident => [
        incident.id,
        `"${incident.title}"`,
        incident.status,
        incident.priority,
        incident.type,
        new Date(incident.createdAt).toLocaleDateString(),
        `"${incident.location || ''}"`,
        `"${incident.assignedTo || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Incidents Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Incidents Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Period:</strong> Last ${dateRange === '7days' ? '7' : dateRange === '30days' ? '30' : '90'} days</p>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total Incidents</h3>
            <p style="font-size: 24px; font-weight: bold;">${stats.totalIncidents}</p>
          </div>
          <div class="stat-card">
            <h3>Active Incidents</h3>
            <p style="font-size: 24px; font-weight: bold;">${stats.activeIncidents}</p>
          </div>
          <div class="stat-card">
            <h3>Resolved Incidents</h3>
            <p style="font-size: 24px; font-weight: bold;">${stats.resolvedIncidents}</p>
          </div>
          <div class="stat-card">
            <h3>High Priority</h3>
            <p style="font-size: 24px; font-weight: bold;">${stats.highPriorityIncidents}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.incidents.map(incident => `
              <tr>
                <td>${incident.title}</td>
                <td>${incident.status.toUpperCase()}</td>
                <td>${incident.priority.toUpperCase()}</td>
                <td>${new Date(incident.createdAt).toLocaleDateString()}</td>
                <td>${incident.location || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const renderSummaryReport = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Total Incidents</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalIncidents}</p>
          <p className="text-sm text-gray-500">In selected period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Active Incidents</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeIncidents}</p>
          <p className="text-sm text-gray-500">Currently active</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Resolved</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.resolvedIncidents}</p>
          <p className="text-sm text-gray-500">
            {stats.totalIncidents > 0 ? Math.round((stats.resolvedIncidents / stats.totalIncidents) * 100) : 0}% resolution rate
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Personnel</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activePersonnel}</p>
          <p className="text-sm text-gray-500">of {stats.totalPersonnel} on duty</p>
        </div>
      </div>

      {/* Incidents by Priority */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Incidents by Priority</h3>
        <div className="space-y-3">
          {['high', 'medium', 'low'].map(priority => {
            const count = filteredData.incidents.filter(i => i.priority === priority).length;
            const percentage = stats.totalIncidents > 0 ? (count / stats.totalIncidents) * 100 : 0;
            const colors = {
              high: 'bg-red-500',
              medium: 'bg-yellow-500', 
              low: 'bg-green-500'
            };

            return (
              <div key={priority} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium">{priority} Priority</span>
                  <span>{count} incidents ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${colors[priority]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents by Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Incidents by Status</h3>
        <div className="space-y-3">
          {['active', 'pending', 'resolved'].map(status => {
            const count = filteredData.incidents.filter(i => i.status === status).length;
            const percentage = stats.totalIncidents > 0 ? (count / stats.totalIncidents) * 100 : 0;
            const colors = {
              active: 'bg-red-500',
              pending: 'bg-yellow-500',
              resolved: 'bg-green-500'
            };

            return (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium">{status}</span>
                  <span>{count} incidents ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${colors[status]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderIncidentsTable = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Incidents Details</h3>
      {filteredData.incidents.length === 0 ? (
        <div className="text-center py-8">
          <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No incidents found for the selected period</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                    <div className="text-sm text-gray-500">#{incident.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incident.status === 'active' ? 'bg-red-100 text-red-800' :
                      incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incident.priority === 'high' ? 'bg-red-100 text-red-800' :
                      incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {incident.location || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPersonnelReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Personnel Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { status: 'on-duty', label: 'On Duty', color: 'bg-green-500' },
            { status: 'responding', label: 'Responding', color: 'bg-blue-500' },
            { status: 'on-scene', label: 'On Scene', color: 'bg-yellow-500' },
            { status: 'off-duty', label: 'Off Duty', color: 'bg-gray-500' }
          ].map(({ status, label, color }) => {
            const count = personnel.filter(p => p.status === status).length;
            const percentage = personnel.length > 0 ? (count / personnel.length) * 100 : 0;

            return (
              <div key={status} className="text-center p-4 border rounded-lg">
                <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold text-xl">{count}</span>
                </div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Personnel List</h3>
        {personnel.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No personnel records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personnel.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {person.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        person.status === 'on-duty' ? 'bg-green-100 text-green-800' :
                        person.status === 'responding' ? 'bg-blue-100 text-blue-800' :
                        person.status === 'on-scene' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {person.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.role || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Export Buttons */}
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={printReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiFileText} className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { id: 'summary', label: 'Summary Report', icon: FiBarChart },
          { id: 'incidents', label: 'Incidents Report', icon: FiAlertTriangle },
          { id: 'personnel', label: 'Personnel Report', icon: FiUsers }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedReport(type.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedReport === type.id
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={type.icon} className="w-4 h-4" />
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="min-h-96">
        {selectedReport === 'summary' && renderSummaryReport()}
        {selectedReport === 'incidents' && renderIncidentsTable()}
        {selectedReport === 'personnel' && renderPersonnelReport()}
      </div>
    </motion.div>
  );
}

export default Reports;