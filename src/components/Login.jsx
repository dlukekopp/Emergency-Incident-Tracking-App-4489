import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { authManager } from '../utils/authManager';

const { FiShield, FiUser, FiLock, FiEye, FiEyeOff } = FiIcons;

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    userId: '',
    pin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get system configuration for branding
  const systemConfig = authManager.getSystemConfig();
  
  // Apply dynamic colors
  const primaryColor = systemConfig.primaryColor || '#dc2626';
  const secondaryColor = systemConfig.secondaryColor || '#991b1b';
  const accentColor = systemConfig.accentColor || '#fef2f2';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const result = authManager.login(formData.userId, formData.pin);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: `linear-gradient(135deg, ${accentColor}, ${primaryColor}20)` 
      }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          {systemConfig.logoUrl ? (
            <img
              src={systemConfig.logoUrl}
              alt="Logo"
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              <SafeIcon icon={FiShield} className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {systemConfig.siteName || 'Emergency Management System'}
          </h1>
          <p className="text-gray-600 mt-2">Sign in to access the system</p>
        </div>

        {/* System Notice on Login Page */}
        {systemConfig.showNotice && systemConfig.systemNotice && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiShield} className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{systemConfig.systemNotice}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ 
                  '--tw-ring-color': primaryColor,
                  focusRingColor: primaryColor 
                }}
                placeholder="Enter your user ID"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type={showPin ? 'text' : 'password'}
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ 
                  '--tw-ring-color': primaryColor,
                  focusRingColor: primaryColor 
                }}
                placeholder="Enter your PIN"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showPin ? FiEyeOff : FiEye} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.userId || !formData.pin}
            className="w-full py-2 px-4 rounded-lg text-white font-medium disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            style={{ 
              backgroundColor: isLoading || !formData.userId || !formData.pin ? '#9ca3af' : primaryColor,
              ':hover': { backgroundColor: secondaryColor }
            }}
            onMouseEnter={(e) => {
              if (!isLoading && formData.userId && formData.pin) {
                e.target.style.backgroundColor = secondaryColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && formData.userId && formData.pin) {
                e.target.style.backgroundColor = primaryColor;
              }
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <SafeIcon icon={FiShield} className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Contact Information */}
        {systemConfig.contactInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>{systemConfig.contactInfo}</p>
            </div>
          </div>
        )}

        {/* Default Admin Notice - Only show if enabled */}
        {systemConfig.showDefaultAdmin !== false && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Default Super Admin:</p>
              <p className="font-mono">ID: 999 | PIN: E911</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Login;