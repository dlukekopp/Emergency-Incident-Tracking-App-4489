import React from 'react';
import { motion } from 'framer-motion';
import { useIncident } from '../context/IncidentContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';
import StatCard from '../components/StatCard';
import RecentIncidents from '../components/RecentIncidents';
import ActiveTasks from '../components/ActiveTasks';
import PersonnelTable from '../components/PersonnelTable';

const { FiAlertTriangle, FiUsers } = FiIcons;

function Dashboard() {
  const { state } = useIncident();
  const { incidents, personnel } = state;

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const activePersonnel = personnel.filter(p => ['on-duty', 'responding', 'on-scene'].includes(p.status));

  const stats = [
    {
      title: 'Active Incidents',
      value: activeIncidents.length,
      icon: FiAlertTriangle,
      color: 'red',
      trend: `${incidents.filter(i => i.status === 'resolved').length} resolved total`
    },
    {
      title: 'Active Personnel',
      value: activePersonnel.length,
      icon: FiUsers,
      color: 'green',
      trend: `${personnel.length} total personnel`
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Emergency Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIncidents incidents={activeIncidents.slice(0, 5)} />
        <ActiveTasks />
      </div>

      <PersonnelTable />
    </motion.div>
  );
}

export default Dashboard;