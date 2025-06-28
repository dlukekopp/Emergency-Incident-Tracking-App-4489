import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SystemNotice from '../components/SystemNotice';
import RichTextEditor from '../components/RichTextEditor';
import ResourceViewer from '../components/ResourceViewer';

const { FiPlus, FiEdit3, FiTrash2, FiDownload, FiFile, FiSearch, FiEye } = FiIcons;

function Resources() {
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('systemResources');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    files: []
  });

  const saveResources = (updatedResources) => {
    localStorage.setItem('systemResources', JSON.stringify(updatedResources));
    setResources(updatedResources);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const filePromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target.result,
            uploadedAt: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(fileData => {
      setFormData({
        ...formData,
        files: [...formData.files, ...fileData]
      });
    });
  };

  const removeFile = (fileId) => {
    setFormData({
      ...formData,
      files: formData.files.filter(f => f.id !== fileId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const resource = {
      id: editingResource?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      files: formData.files,
      createdBy: 'Current User',
      createdAt: editingResource?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newResources;
    if (editingResource) {
      newResources = resources.map(r => r.id === editingResource.id ? resource : r);
    } else {
      newResources = [...resources, resource];
    }

    saveResources(newResources);
    resetForm();
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description,
      files: resource.files || []
    });
    setShowForm(true);
  };

  const handleView = (resource) => {
    setSelectedResource(resource);
  };

  const handleDelete = (resource) => {
    if (!confirm(`Delete resource "${resource.name}"? This action cannot be undone.`)) return;
    
    const newResources = resources.filter(r => r.id !== resource.id);
    saveResources(newResources);
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      files: []
    });
    setEditingResource(null);
    setShowForm(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stripHtml = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stripHtml(resource.description).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SystemNotice />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Resource Hub</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter resource name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter detailed resource information with formatting, lists, links, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the toolbar to add formatting, lists, links, and more. This supports emergency procedures, role descriptions, and detailed instructions.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Files & Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="resource-file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                />
                <label
                  htmlFor="resource-file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiFile} className="w-8 h-8" />
                  <span className="text-sm">
                    Click to upload files or drag and drop
                  </span>
                  <span className="text-xs text-gray-400">
                    Maximum file size: 10MB per file
                  </span>
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {formData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiFile} className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingResource ? 'Update Resource' : 'Add Resource'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiFile} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm
                ? 'No resources match your search.'
                : 'No resources available. Add your first resource to get started.'
              }
            </p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleView(resource)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">{resource.name}</h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(resource);
                    }}
                    className="text-green-500 hover:text-green-700 transition-colors"
                    title="View resource"
                  >
                    <SafeIcon icon={FiEye} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(resource);
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit resource"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resource);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete resource"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {resource.description && (
                <div className="text-gray-600 text-sm mb-4">
                  <div
                    className="line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: stripHtml(resource.description).substring(0, 150) + 
                              (stripHtml(resource.description).length > 150 ? '...' : '')
                    }}
                  />
                </div>
              )}

              {resource.files && resource.files.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiFile} className="w-4 h-4" />
                    <span>{resource.files.length} file{resource.files.length !== 1 ? 's' : ''} attached</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <p>Created by {resource.createdBy} on {new Date(resource.createdAt).toLocaleDateString()}</p>
                {resource.updatedAt !== resource.createdAt && (
                  <p>Updated {new Date(resource.updatedAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs text-blue-600 font-medium">Click to view full resource</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onEdit={() => {
            setSelectedResource(null);
            handleEdit(selectedResource);
          }}
        />
      )}
    </motion.div>
  );
}

export default Resources;