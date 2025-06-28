import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from './SystemNotice';
import { authManager } from '../utils/authManager';

const { FiSettings, FiSave, FiEye, FiEyeOff, FiGlobe, FiPhone, FiMail, FiAlertCircle, FiPalette, FiImage, FiUpload, FiTrash2 } = FiIcons;

// Predefined color schemes
const COLOR_SCHEMES = [
  { name: 'Emergency Red', primary: '#dc2626', secondary: '#991b1b', accent: '#fef2f2' },
  { name: 'Fire Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fff7ed' },
  { name: 'Police Blue', primary: '#2563eb', secondary: '#1d4ed8', accent: '#eff6ff' },
  { name: 'Forest Green', primary: '#16a34a', secondary: '#15803d', accent: '#f0fdf4' },
  { name: 'Medical Purple', primary: '#9333ea', secondary: '#7c3aed', accent: '#faf5ff' },
  { name: 'Navy Blue', primary: '#1e40af', secondary: '#1e3a8a', accent: '#f0f9ff' },
  { name: 'Amber Alert', primary: '#d97706', secondary: '#b45309', accent: '#fffbeb' },
  { name: 'Steel Gray', primary: '#4b5563', secondary: '#374151', accent: '#f9fafb' }
];

function SystemConfiguration() {
  const [config, setConfig] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const systemConfig = authManager.getSystemConfig();
    setConfig(systemConfig);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorSchemeSelect = (scheme) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: scheme.primary,
      secondaryColor: scheme.secondary,
      accentColor: scheme.accent,
      colorSchemeName: scheme.name
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Logo file must be less than 2MB');
        return;
      }
      setLogoUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig(prev => ({
          ...prev,
          logoUrl: e.target.result
        }));
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setConfig(prev => ({
      ...prev,
      logoUrl: ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Apply CSS variables for dynamic theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.primaryColor || '#dc2626');
    root.style.setProperty('--secondary-color', config.secondaryColor || '#991b1b');
    root.style.setProperty('--accent-color', config.accentColor || '#fef2f2');
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    authManager.updateSystemConfig(config);
    setSaving(false);
    setSaved(true);
    
    // Reset saved indicator after 2 seconds
    setTimeout(() => setSaved(false), 2000);
  };

  const previewLogin = () => {
    const primaryColor = config.primaryColor || '#dc2626';
    return (
      <div className="p-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)` }}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center mb-8">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo Preview" className="w-16 h-16 mx-auto mb-4 object-contain" />
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                   style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                <SafeIcon icon={FiSettings} className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {config.siteName || 'Emergency Management System'}
            </h1>
            {config.contactInfo && (
              <p className="text-gray-600 mt-2">{config.contactInfo}</p>
            )}
          </div>
          
          {/* Sample form elements with new colors */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="User ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              style={{ focusRingColor: primaryColor, borderColor: config.secondaryColor || '#991b1b' }}
              readOnly
            />
            <button
              className="w-full py-2 px-4 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const previewNotice = () => {
    if (!config.showNotice || !config.systemNotice) return null;
    
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">{config.systemNotice}</p>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: FiGlobe },
    { id: 'branding', label: 'Branding & Colors', icon: FiPalette },
    { id: 'notices', label: 'System Notices', icon: FiAlertCircle }
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
        <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={showPreview ? FiEyeOff : FiEye} className="w-4 h-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:bg-gray-400`}
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} className="w-5 h-5" />
                <span>Site Information</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    value={config.siteName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency Management System"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Information (Login Page)
                  </label>
                  <textarea
                    name="contactInfo"
                    value={config.contactInfo || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="For support, contact your system administrator"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showDefaultAdmin"
                    name="showDefaultAdmin"
                    checked={config.showDefaultAdmin !== false} // Default to true
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showDefaultAdmin" className="ml-2 block text-sm text-gray-900">
                    Show default super admin credentials on login page
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Branding & Colors */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <SafeIcon icon={FiImage} className="w-5 h-5" />
                  <span>Logo</span>
                </h2>
                <div className="space-y-4">
                  {config.logoUrl && (
                    <div className="flex items-center space-x-4">
                      <img src={config.logoUrl} alt="Current Logo" className="w-16 h-16 object-contain border rounded" />
                      <button
                        onClick={removeLogo}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        <span>Remove Logo</span>
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={logoUploading}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700"
                    >
                      <SafeIcon icon={logoUploading ? FiSettings : FiUpload} className={`w-8 h-8 ${logoUploading ? 'animate-spin' : ''}`} />
                      <span className="text-sm">
                        {logoUploading ? 'Uploading...' : 'Click to upload logo or drag and drop'}
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, SVG up to 2MB. Recommended: 64x64px
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Color Schemes */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <SafeIcon icon={FiPalette} className="w-5 h-5" />
                  <span>Color Scheme</span>
                </h2>

                {/* Predefined Color Schemes */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Predefined Schemes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_SCHEMES.map((scheme) => (
                      <button
                        key={scheme.name}
                        onClick={() => handleColorSchemeSelect(scheme)}
                        className={`p-3 rounded-lg border transition-all ${
                          config.primaryColor === scheme.primary
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: scheme.accent }} />
                          </div>
                          <span className="text-sm font-medium">{scheme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Custom Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          name="primaryColor"
                          value={config.primaryColor || '#dc2626'}
                          onChange={handleChange}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          name="primaryColor"
                          value={config.primaryColor || '#dc2626'}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          name="secondaryColor"
                          value={config.secondaryColor || '#991b1b'}
                          onChange={handleChange}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          name="secondaryColor"
                          value={config.secondaryColor || '#991b1b'}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accent Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          name="accentColor"
                          value={config.accentColor || '#fef2f2'}
                          onChange={handleChange}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          name="accentColor"
                          value={config.accentColor || '#fef2f2'}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Notice */}
          {activeTab === 'notices' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5" />
                <span>System-Wide Notice</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showNotice"
                    name="showNotice"
                    checked={config.showNotice || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showNotice" className="ml-2 block text-sm text-gray-900">
                    Display system notice on all pages
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Message
                  </label>
                  <textarea
                    name="systemNotice"
                    value={config.systemNotice || ''}
                    onChange={handleChange}
                    rows={4}
                    disabled={!config.showNotice}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Enter important system-wide announcements or notices here..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This notice will appear at the top of every page when enabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              {/* System Notice Preview */}
              {previewNotice()}
              
              {/* Login Page Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Login Page:</h3>
                {previewLogin()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SafeIcon icon={FiSettings} className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Configuration Notes</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Changes take effect immediately after saving</li>
                <li>Color schemes are applied throughout the entire system</li>
                <li>Logo should be optimized for web (PNG/JPG/SVG under 2MB)</li>
                <li>The system notice will appear on all pages when enabled</li>
                <li>Only Super Administrators can access this configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SystemConfiguration;