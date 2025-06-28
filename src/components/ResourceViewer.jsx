import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiDownload, FiFile, FiEdit3, FiClock, FiUser } = FiIcons;

function ResourceViewer({ resource, onClose, onEdit }) {
  if (!resource) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{resource.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiUser} className="w-4 h-4" />
                <span>Created by {resource.createdBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiClock} className="w-4 h-4" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              {resource.updatedAt !== resource.createdAt && (
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  <span>Updated {new Date(resource.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {resource.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div 
                className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: resource.description }}
                style={{
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          {/* Files */}
          {resource.files && resource.files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Attached Files ({resource.files.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resource.files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <SafeIcon icon={FiFile} className="w-8 h-8 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                        title="Download file"
                      >
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!resource.description && (!resource.files || resource.files.length === 0) && (
            <div className="text-center py-12">
              <SafeIcon icon={FiFile} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-500">This resource doesn't have any description or files yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Resource ID:</span> {resource.id}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .prose h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }
        .prose ul, .prose ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .prose li {
          margin: 0.25rem 0;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .prose p {
          margin: 0.75rem 0;
        }
        .prose strong {
          font-weight: 600;
          color: #374151;
        }
        .prose em {
          font-style: italic;
        }
      `}</style>
    </motion.div>
  );
}

export default ResourceViewer;