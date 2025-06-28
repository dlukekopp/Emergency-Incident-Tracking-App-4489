import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import UserProfile from './UserProfile';
import { authManager } from '../utils/authManager';

const { FiHome, FiAlertTriangle, FiFileText, FiMenu, FiX, FiActivity, FiUsers, FiLogOut, FiSettings, FiFolder, FiEdit3, FiUser } = FiIcons;

function Sidebar({ isOpen, onToggle, onLogout }) {
  const currentUser = authManager.getCurrentUser();
  const [showProfile, setShowProfile] = useState(false);

  // Get system configuration for dynamic colors
  const systemConfig = authManager.getSystemConfig();
  const primaryColor = systemConfig.primaryColor || '#dc2626';
  const secondaryColor = systemConfig.secondaryColor || '#991b1b';
  const accentColor = systemConfig.accentColor || '#fef2f2';

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/incidents', icon: FiAlertTriangle, label: 'Incidents' },
    { to: '/personnel', icon: FiActivity, label: 'Personnel' },
    { to: '/resources', icon: FiFolder, label: 'Resources' },
    { to: '/reports', icon: FiFileText, label: 'Reports' },
    { to: '/profile', icon: FiUser, label: 'My Profile' }
  ];

  // Add Users management for admins only
  if (authManager.hasPermission('canManageUsers')) {
    navItems.splice(-1, 0, { to: '/users', icon: FiUsers, label: 'Users' });
  }

  // Add System Config for super admins only
  if (authManager.isSuperAdmin()) {
    navItems.splice(-1, 0, { to: '/admin', icon: FiSettings, label: 'Admin' });
  }

  // Generate dynamic styles for active navigation items
  const getNavLinkStyle = (isActive) => {
    const baseClasses = "flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200";
    
    if (isActive) {
      return {
        className: `${baseClasses} border-r-4`,
        style: {
          backgroundColor: `${primaryColor}15`, // 15% opacity
          color: primaryColor,
          borderRightColor: primaryColor
        }
      };
    } else {
      return {
        className: `${baseClasses} text-gray-600 hover:bg-gray-100`,
        style: {}
      };
    }
  };

  return (
    <>
      <motion.div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with Logo/Title */}
        <div className="flex items-center justify-between p-4 border-b">
          <motion.div
            className={`flex items-center space-x-3 ${isOpen ? 'block' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {systemConfig.logoUrl ? (
              <img
                src={systemConfig.logoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <SafeIcon icon={FiSettings} className="w-4 h-4" />
              </div>
            )}
            <h1 className="font-bold text-xl text-gray-800">
              {systemConfig.siteName || 'Emergency Hub'}
            </h1>
          </motion.div>
          
          {/* Collapsed state - show just logo/icon */}
          {!isOpen && (
            <div className="flex items-center justify-center w-full">
              {systemConfig.logoUrl ? (
                <img
                  src={systemConfig.logoUrl}
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <SafeIcon icon={FiSettings} className="w-3 h-3" />
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <SafeIcon icon={isOpen ? FiX : FiMenu} className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        {isOpen && currentUser && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowProfile(true)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Edit Profile"
              >
                <SafeIcon icon={FiEdit3} className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const styles = getNavLinkStyle(isActive);
                return styles.className;
              }}
              style={({ isActive }) => {
                const styles = getNavLinkStyle(isActive);
                return styles.style;
              }}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
              <motion.span
                className={`ml-3 font-medium ${isOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        {isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

export default Sidebar;