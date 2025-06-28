import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { authManager } from '../utils/authManager';

const { FiAlertCircle } = FiIcons;

function SystemNotice() {
  const config = authManager.getSystemConfig();
  
  if (!config.showNotice || !config.systemNotice) {
    return null;
  }

  // Get theme colors for consistent styling
  const primaryColor = config.primaryColor || '#dc2626';

  return (
    <div 
      className="border-l-4 p-4 mb-6 rounded-r-lg"
      style={{ 
        backgroundColor: '#fef3c7',
        borderLeftColor: '#f59e0b',
        color: '#92400e'
      }}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <SafeIcon icon={FiAlertCircle} className="h-5 w-5" style={{ color: '#f59e0b' }} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{config.systemNotice}</p>
        </div>
      </div>
    </div>
  );
}

export default SystemNotice;