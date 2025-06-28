import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';
import { authManager } from '../utils/authManager';
import { auditLogger } from '../utils/auditLogger';

const { FiUser, FiEdit3, FiSave, FiEye, FiEyeOff, FiActivity, FiPhone, FiMail, FiCamera, FiLock, FiSettings } = FiIcons;

function Profile() {
  const currentUser = authManager.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    userId: currentUser?.userId || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    currentPin: '',
    newPin: '',
    confirmPin: '',
    profilePhoto: currentUser?.profilePhoto || ''
  });
  const [userAuditLogs, setUserAuditLogs] = useState([]);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load user's audit history
    const logs = auditLogger.getLogs();
    const userLogs = logs.filter(log => log.userId === currentUser?.name);
    setUserAuditLogs(userLogs.slice(0, 50)); // Last 50 actions
  }, [currentUser]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Profile photo must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, profilePhoto: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, profilePhoto: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate PIN change if provided
    if (formData.newPin) {
      if (!formData.currentPin) {
        setError('Current PIN is required to change PIN');
        return;
      }

      if (formData.newPin !== formData.confirmPin) {
        setError('New PIN confirmation does not match');
        return;
      }

      if (formData.newPin.length < 3) {
        setError('New PIN must be at least 3 characters');
        return;
      }

      // Verify current PIN
      const loginResult = authManager.login(currentUser.userId, formData.currentPin);
      if (!loginResult.success) {
        setError('Current PIN is incorrect');
        return;
      }
    }

    // Update user profile
    const updates = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      profilePhoto: formData.profilePhoto
    };

    if (formData.newPin) {
      updates.pin = formData.newPin;
    }

    authManager.updateUser(currentUser.id, updates);

    // Log the profile update
    const changes = [];
    if (currentUser.name !== formData.name) {
      changes.push({ field: 'name', oldValue: currentUser.name, newValue: formData.name });
    }
    if (currentUser.phone !== formData.phone) {
      changes.push({ field: 'phone', oldValue: currentUser.phone || '', newValue: formData.phone });
    }
    if (currentUser.email !== formData.email) {
      changes.push({ field: 'email', oldValue: currentUser.email || '', newValue: formData.email });
    }
    if (currentUser.profilePhoto !== formData.profilePhoto) {
      changes.push({ field: 'profilePhoto', oldValue: 'Changed', newValue: 'Updated' });
    }
    if (formData.newPin) {
      changes.push({ field: 'pin', oldValue: 'Hidden', newValue: 'Updated' });
    }

    if (changes.length > 0) {
      auditLogger.logUpdate(
        'user-profile',
        currentUser.id,
        'Updated user profile',
        changes
      );
    }

    setSuccess('Profile updated successfully!');
    setIsEditing(false);

    // Clear PIN fields
    setFormData({
      ...formData,
      currentPin: '',
      newPin: '',
      confirmPin: ''
    });

    // Reload user audit logs
    setTimeout(() => {
      const logs = auditLogger.getLogs();
      const userLogs = logs.filter(log => log.userId === formData.name);
      setUserAuditLogs(userLogs.slice(0, 50));
    }, 100);

    // Refresh page to show updated user info
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const formatActionDescription = (log) => {
    switch (log.action) {
      case 'CREATE': return `Created ${log.entityType}`;
      case 'UPDATE': return `Updated ${log.entityType}`;
      case 'DELETE': return `Deleted ${log.entityType}`;
      case 'STATUS_CHANGE': return `Changed ${log.entityType} status`;
      default: return log.description;
    }
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

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: FiUser },
    { id: 'activity', label: 'My Activity', icon: FiActivity }
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SystemNotice />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                    <SafeIcon icon={FiUser} className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 cursor-pointer inline-flex"
                    >
                      <SafeIcon icon={FiCamera} className="w-3 h-3" />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentUser?.name}</h3>
                <p className="text-gray-600">{currentUser?.role.replace('_', ' ').toUpperCase()}</p>
                <p className="text-sm text-gray-500">User ID: {currentUser?.userId}</p>
                {isEditing && formData.profilePhoto && (
                  <button
                    onClick={removePhoto}
                    className="text-red-600 hover:text-red-700 text-sm mt-1"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <SafeIcon icon={FiLock} className="w-5 h-5" />
                      <span>Change PIN (Optional)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current PIN
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPin ? 'text' : 'password'}
                            name="currentPin"
                            value={formData.currentPin}
                            onChange={handleChange}
                            className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPin(!showCurrentPin)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            <SafeIcon icon={showCurrentPin ? FiEyeOff : FiEye} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New PIN
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPin ? 'text' : 'password'}
                            name="newPin"
                            value={formData.newPin}
                            onChange={handleChange}
                            className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPin(!showNewPin)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            <SafeIcon icon={showNewPin ? FiEyeOff : FiEye} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New PIN
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPin ? 'text' : 'password'}
                            name="confirmPin"
                            value={formData.confirmPin}
                            onChange={handleChange}
                            className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPin(!showConfirmPin)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            <SafeIcon icon={showConfirmPin ? FiEyeOff : FiEye} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: currentUser?.name || '',
                          userId: currentUser?.userId || '',
                          phone: currentUser?.phone || '',
                          email: currentUser?.email || '',
                          currentPin: '',
                          newPin: '',
                          confirmPin: '',
                          profilePhoto: currentUser?.profilePhoto || ''
                        });
                        setError('');
                        setSuccess('');
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiSave} className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Activity History</h3>
              <p className="text-sm text-gray-500">Showing last 50 actions</p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userAuditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity recorded yet</p>
                </div>
              ) : (
                userAuditLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                        <SafeIcon icon={FiActivity} className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {formatActionDescription(log)}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                        )}
                        {log.changes && log.changes.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {log.changes.map((change, index) => (
                              <div key={index}>
                                <span className="font-medium">{change.field}:</span>
                                {change.oldValue && (
                                  <span className="text-red-600 line-through ml-1">{change.oldValue}</span>
                                )}
                                {change.newValue && (
                                  <span className="text-green-600 ml-1">{change.newValue}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Profile;