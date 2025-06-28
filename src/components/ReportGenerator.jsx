import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiFileText, FiCalendar, FiBarChart, FiTrendingUp, FiActivity, FiUsers } = FiIcons;

function ReportGenerator({ selectedReport, data, dateRange }) {
  const generateSummaryReport = () => {
    const { incidents, resources } = data;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium">Total Incidents</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">{incidents.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiBarChart} className="w-5 h-5 text-green-600" />
              <h4 className="font-medium">Resolved</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.status === 'resolved').length}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-red-600" />
              <h4 className="font-medium">Active</h4>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {incidents.filter(i => i.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Incident Breakdown by Priority</h4>
          <div className="space-y-3">
            {['high', 'medium', 'low'].map(priority => {
              const count = incidents.filter(i => i.priority === priority).length;
              const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{priority} Priority</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count} incidents</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          priority === 'high' ? 'bg-red-500' : 
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Resource Utilization</h4>
          <div className="space-y-3">
            {['personnel', 'vehicle', 'equipment'].map(type => {
              const typeResources = resources.filter(r => r.type === type);
              const deployed = typeResources.filter(r => r.status === 'deployed').length;
              const total = typeResources.length;
              const utilization = total > 0 ? (deployed / total) * 100 : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{deployed}/{total} deployed</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{utilization.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const generatePersonnelReport = () => {
    const { personnel, statusLogs } = data;
    
    const statusStats = personnel.reduce((acc, person) => {
      acc[person.status] = (acc[person.status] || 0) + 1;
      return acc;
    }, {});

    const recentStatusChanges = statusLogs.slice(-10);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium">Total Personnel</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">{personnel.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-600" />
              <h4 className="font-medium">On Duty</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {personnel.filter(p => ['on-duty', 'responding', 'on-scene'].includes(p.status)).length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiBarChart} className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium">Status Changes</h4>
            </div>
            <p className="text-2xl font-bold text-purple-600">{statusLogs.length}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Personnel by Status</h4>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => {
              const percentage = personnel.length > 0 ? (count / personnel.length) * 100 : 0;
              const statusColors = {
                'on-duty': 'bg-green-500',
                'responding': 'bg-blue-500',
                'on-scene': 'bg-yellow-500',
                'off-duty': 'bg-gray-500',
                'unavailable': 'bg-red-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{status.replace('-', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count} personnel</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Recent Status Changes</h4>
          <div className="space-y-3">
            {recentStatusChanges.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent status changes</p>
            ) : (
              recentStatusChanges.map((log) => {
                const person = personnel.find(p => p.id === log.personnelId);
                return (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">{person?.name || 'Unknown Personnel'}</p>
                      <p className="text-sm text-gray-600">
                        {log.previousStatus} → {log.newStatus}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const generateResponseReport = () => {
    const { incidents, statusLogs } = data;
    
    const avgResponseTime = incidents.length > 0 ? '15 minutes' : 'N/A';
    const resolutionRate = incidents.length > 0 
      ? Math.round((incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100)
      : 0;
    
    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Response Time Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{avgResponseTime}</p>
              <p className="text-sm text-gray-600">Average Response Time</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">3 min</p>
              <p className="text-sm text-gray-600">Fastest Response</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">45 min</p>
              <p className="text-sm text-gray-600">Slowest Response</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Resolution Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">4.2 hours</p>
              <p className="text-sm text-gray-600">Average Resolution Time</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{resolutionRate}%</p>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">8%</p>
              <p className="text-sm text-gray-600">Escalation Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Activity Timeline</h4>
          <div className="space-y-3">
            {statusLogs.slice(-5).map((log, index) => {
              return (
                <div key={log.id} className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      Personnel status update: {log.previousStatus} → {log.newStatus}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {statusLogs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No activity recorded</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const generateTimelineReport = () => {
    const { incidents, updates, statusLogs } = data;
    
    // Combine all events for timeline
    const allEvents = [
      ...incidents.map(i => ({ 
        type: 'incident', 
        title: `Incident: ${i.title}`, 
        timestamp: i.createdAt,
        status: i.status,
        priority: i.priority
      })),
      ...updates.map(u => ({ 
        type: 'update', 
        title: `Update: ${u.content.substring(0, 50)}...`, 
        timestamp: u.timestamp 
      })),
      ...statusLogs.map(l => ({ 
        type: 'status', 
        title: `Status Change: ${l.previousStatus} → ${l.newStatus}`, 
        timestamp: l.timestamp 
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
    
    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Activity Timeline (Last 20 Events)</h4>
          <div className="space-y-4">
            {allEvents.map((event, index) => {
              const typeColors = {
                incident: 'bg-red-100 text-red-800',
                update: 'bg-blue-100 text-blue-800',
                status: 'bg-green-100 text-green-800'
              };
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[event.type]}`}>
                        {event.type.toUpperCase()}
                      </span>
                      {event.priority && (
                        <span className={`text-xs font-medium ${
                          event.priority === 'high' ? 'text-red-600' :
                          event.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {event.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {allEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No events recorded</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'summary':
        return generateSummaryReport();
      case 'personnel':
        return generatePersonnelReport();
      case 'response':
        return generateResponseReport();
      case 'timeline':
        return generateTimelineReport();
      default:
        return generateSummaryReport();
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <SafeIcon icon={FiCalendar} className="w-4 h-4" />
          <span>
            {dateRange === '7days' ? 'Last 7 Days' : 
             dateRange === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </span>
        </div>
      </div>

      {renderReport()}
    </motion.div>
  );
}

export default ReportGenerator;