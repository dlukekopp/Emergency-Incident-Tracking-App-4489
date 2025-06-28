import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from './SystemNotice';
import { authManager, USER_ROLES } from '../utils/authManager';

const { FiPlus, FiEdit3, FiTrash2, FiLock, FiToggleLeft, FiToggleRight, FiUsers, FiShield, FiEye, FiUserCheck } = FiIcons;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPinReset, setShowPinReset] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    role: USER_ROLES.CONTRIBUTOR,
    pin: ''
  });
  const [newPin, setNewPin] = useState('');
  const currentUser = authManager.getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authManager.getUsers());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      authManager.updateUser(editingUser.id, {
        userId: formData.userId,
        name: formData.name,
        role: formData.role,
        ...(formData.pin && { pin: formData.pin })
      });
    } else {
      authManager.addUser(formData);
    }
    loadUsers();
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      userId: user.userId,
      name: user.name,
      role: user.role,
      pin: ''
    });
    setShowForm(true);
  };

  const handleDelete = (user) => {
    if (!user.canBeDeleted) {
      alert('This user cannot be deleted.');
      return;
    }
    if (confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      authManager.deleteUser(user.id);
      loadUsers();
    }
  };

  const handleToggleStatus = (user) => {
    if (!user.canBeDeleted) {
      alert('This user\'s status cannot be changed.');
      return;
    }
    authManager.toggleUserStatus(user.id);
    loadUsers();
  };

  const handleResetPin = (userId) => {
    if (!newPin.trim()) {
      alert('Please enter a new PIN.');
      return;
    }
    authManager.resetUserPin(userId, newPin);
    setShowPinReset(null);
    setNewPin('');
    loadUsers();
    alert('PIN has been reset successfully.');
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      name: '',
      role: USER_ROLES.CONTRIBUTOR,
      pin: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return FiShield;
      case USER_ROLES.CONTRIBUTOR: return FiEdit3;
      case USER_ROLES.VIEW_ONLY: return FiEye;
      default: return FiUsers;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'text-red-600 bg-red-100';
      case USER_ROLES.CONTRIBUTOR: return 'text-blue-600 bg-blue-100';
      case USER_ROLES.VIEW_ONLY: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SystemNotice />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Total Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUserCheck} className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Active Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiShield} className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Administrators</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.role === USER_ROLES.ADMIN).length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID *
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter unique user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={USER_ROLES.VIEW_ONLY}>View Only</option>
                  <option value={USER_ROLES.CONTRIBUTOR}>Contributor</option>
                  <option value={USER_ROLES.ADMIN}>Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'New PIN (leave blank to keep current)' : 'PIN *'}
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  required={!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={editingUser ? 'Enter new PIN' : 'Enter PIN'}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUsers} className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={getRoleIcon(user.role)} className="w-4 h-4" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit user"
                      >
                        <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPinReset(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Reset PIN"
                      >
                        <SafeIcon icon={FiLock} className="w-4 h-4" />
                      </button>
                      {user.canBeDeleted && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <SafeIcon icon={user.isActive ? FiToggleRight : FiToggleLeft} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PIN Reset Modal */}
      {showPinReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset User PIN</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new PIN"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleResetPin(showPinReset)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset PIN
                </button>
                <button
                  onClick={() => {
                    setShowPinReset(null);
                    setNewPin('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UserManagement;