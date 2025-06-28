import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { auditLogger } from '../utils/auditLogger';
import { authManager } from '../utils/authManager';

const { FiPlus, FiFile, FiDownload, FiTrash2, FiEdit3, FiUpload, FiFileText } = FiIcons;

function DocumentManager({ incidentId }) {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    files: []
  });
  const [uploading, setUploading] = useState(false);

  // Load documents for this incident
  useEffect(() => {
    const saved = localStorage.getItem(`incident-documents-${incidentId}`);
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, [incidentId]);

  // Save documents
  const saveDocuments = (newDocuments) => {
    localStorage.setItem(`incident-documents-${incidentId}`, JSON.stringify(newDocuments));
    setDocuments(newDocuments);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (1GB = 1024 * 1024 * 1024 bytes)
    const maxSize = 1024 * 1024 * 1024;
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 1GB.`);
        return false;
      }
      return true;
    });

    // Convert files to base64 for storage
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
    setUploading(true);

    const currentUser = authManager.getCurrentUser();
    const document = {
      id: editingDoc?.id || Date.now().toString(),
      name: formData.name,
      notes: formData.notes,
      files: formData.files,
      uploadedBy: currentUser?.name || 'Unknown User',
      uploadedAt: editingDoc?.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newDocuments;
    if (editingDoc) {
      newDocuments = documents.map(d => d.id === editingDoc.id ? document : d);
      auditLogger.logUpdate(
        'document',
        document.id,
        `Updated document "${formData.name}" in incident`,
        [
          { field: 'name', oldValue: editingDoc.name, newValue: formData.name },
          { field: 'notes', oldValue: editingDoc.notes, newValue: formData.notes }
        ],
        { incidentId }
      );
    } else {
      newDocuments = [...documents, document];
      auditLogger.logCreate(
        'document',
        document.id,
        `Uploaded document "${formData.name}" to incident`,
        {
          incidentId,
          fileCount: formData.files.length
        }
      );
    }

    saveDocuments(newDocuments);
    resetForm();
    setUploading(false);
  };

  const handleEdit = (document) => {
    setEditingDoc(document);
    setFormData({
      name: document.name,
      notes: document.notes || '',
      files: document.files || []
    });
    setShowForm(true);
  };

  const handleDelete = (document) => {
    if (!confirm(`Delete document "${document.name}"? This action cannot be undone.`)) return;

    const newDocuments = documents.filter(d => d.id !== document.id);
    saveDocuments(newDocuments);

    auditLogger.logDelete(
      'document',
      document.id,
      `Deleted document "${document.name}" from incident`,
      { incidentId }
    );
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
    setFormData({ name: '', notes: '', files: [] });
    setEditingDoc(null);
    setShowForm(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FiFile;
    if (fileType.includes('pdf')) return FiFileText;
    if (fileType.includes('word') || fileType.includes('document')) return FiFileText;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return FiFileText;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return FiFileText;
    return FiFile;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents & Files</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Upload Documents</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter document name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Optional notes about this document"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiUpload} className="w-8 h-8" />
                <span className="text-sm">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-400">
                  Maximum file size: 1GB
                </span>
              </label>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                {formData.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={getFileIcon(file.type)} className="w-4 h-4 text-gray-500" />
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
              disabled={uploading || !formData.name || formData.files.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : editingDoc ? 'Update Document' : 'Upload Document'}
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
      )}

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No documents uploaded</p>
        ) : (
          documents.map((document) => (
            <motion.div
              key={document.id}
              className="bg-white border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{document.name}</h4>
                  {document.notes && (
                    <p className="text-sm text-gray-600 mt-1">{document.notes}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Uploaded by {document.uploadedBy} on {new Date(document.uploadedAt).toLocaleString()}
                    {document.updatedAt !== document.uploadedAt && (
                      <span className="ml-2">
                        • Updated {new Date(document.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(document)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit document"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(document)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete document"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {document.files && document.files.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Files:</h5>
                  {document.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={getFileIcon(file.type)} className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Download file"
                      >
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentManager;