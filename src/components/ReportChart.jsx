import React from 'react';
import { motion } from 'framer-motion';

function ReportChart({ type, data, title }) {
  const generateChartData = () => {
    if (type === 'incidents') {
      // Group incidents by date
      const dateGroups = {};
      data.forEach(incident => {
        const date = new Date(incident.createdAt).toLocaleDateString();
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      });
      
      const dates = Object.keys(dateGroups).slice(-7); // Last 7 days
      const counts = dates.map(date => dateGroups[date] || 0);
      
      return { dates, counts };
    } else if (type === 'status') {
      // Group by status
      const statusGroups = {};
      data.forEach(incident => {
        statusGroups[incident.status] = (statusGroups[incident.status] || 0) + 1;
      });
      
      return statusGroups;
    }
    
    return {};
  };

  const chartData = generateChartData();

  const renderIncidentChart = () => {
    const { dates, counts } = chartData;
    const maxCount = Math.max(...counts, 1);
    
    return (
      <div className="space-y-4">
        <div className="flex items-end space-x-2 h-40">
          {dates.map((date, index) => (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div className="w-8 bg-blue-500 rounded-t" style={{ height: `${(counts[index] / maxCount) * 100}%` }} />
              <span className="text-xs text-gray-500 mt-2 transform -rotate-45">{date}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          Daily incident count over the last 7 days
        </div>
      </div>
    );
  };

  const renderStatusChart = () => {
    const total = Object.values(chartData).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="space-y-4">
        {Object.entries(chartData).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const colors = {
            active: 'bg-red-500',
            pending: 'bg-yellow-500',
            resolved: 'bg-green-500'
          };
          
          return (
            <div key={status} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{status}</span>
                <span>{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${colors[status] || 'bg-gray-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {type === 'incidents' ? renderIncidentChart() : renderStatusChart()}
    </motion.div>
  );
}

export default ReportChart;