import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { auditLogger } from '../utils/auditLogger';
import { exportManager, EXPORT_FORMATS } from '../utils/exportManager';
import { authManager } from '../utils/authManager';

const { FiPlus, FiPhone, FiMail, FiUser, FiEdit3, FiTrash2, FiDownload } = FiIcons;

function ContactList({ incident }) {
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(`contacts-${incident.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: ''
  });

  const saveContacts = (updatedContacts) => {
    localStorage.setItem(`contacts-${incident.id}`, JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const currentUser = authManager.getCurrentUser();
    const contact = {
      id: Date.now().toString(),
      ...formData
    };

    saveContacts([...contacts, contact]);

    // Audit log for contact creation
    auditLogger.logCreate(
      'contact',
      contact.id,
      `Added contact "${formData.name}" (${formData.role}) to incident ${incident.title}`,
      {
        incidentId: incident.id,
        incidentTitle: incident.title,
        contactName: formData.name,
        contactRole: formData.role
      }
    );

    setFormData({ name: '', role: '', phone: '', email: '' });
    setShowForm(false);
  };

  const editContact = (contact) => {
    setEditingContact(contact);
    setFormData({ ...contact });
    setShowForm(true);
  };

  const updateContact = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const updatedContact = {
      ...editingContact,
      ...formData
    };

    const updatedContacts = contacts.map(contact =>
      contact.id === editingContact.id ? updatedContact : contact
    );
    saveContacts(updatedContacts);

    // Audit log for contact update
    const changes = [];
    Object.keys(formData).forEach(key => {
      if (editingContact[key] !== formData[key]) {
        changes.push({
          field: key,
          oldValue: editingContact[key],
          newValue: formData[key]
        });
      }
    });

    if (changes.length > 0) {
      auditLogger.logUpdate(
        'contact',
        editingContact.id,
        `Updated contact "${formData.name}" in incident ${incident.title}`,
        changes,
        {
          incidentId: incident.id,
          incidentTitle: incident.title,
          contactName: formData.name
        }
      );
    }

    setFormData({ name: '', role: '', phone: '', email: '' });
    setEditingContact(null);
    setShowForm(false);
  };

  const deleteContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!confirm(`Delete contact "${contact.name}"?`)) return;

    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    saveContacts(updatedContacts);

    // Audit log for contact deletion
    auditLogger.logDelete(
      'contact',
      contactId,
      `Deleted contact "${contact.name}" from incident ${incident.title}`,
      {
        incidentId: incident.id,
        incidentTitle: incident.title,
        contactName: contact.name,
        contactRole: contact.role
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', phone: '', email: '' });
    setEditingContact(null);
    setShowForm(false);
  };

  const handleExport = (format) => {
    // Get ICS personnel data to include in export
    const icsPersonnel = JSON.parse(localStorage.getItem(`incident-personnel-${incident.id}`) || '[]');
    exportManager.exportContactsAndICS(contacts, icsPersonnel, incident, format);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Key Contacts</h3>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm">
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.CSV)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export Contacts + ICS (CSV)
                </button>
                <button
                  onClick={() => handleExport(EXPORT_FORMATS.HTML)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Export Contacts + ICS (HTML)
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={editingContact ? updateContact : addContact} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contact name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Role/Title"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingContact ? 'Update Contact' : 'Add Contact'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contacts added yet</p>
            <p className="text-sm text-gray-400">Add key contacts for this incident</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <motion.div
              key={contact.id}
              className="bg-white border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUser} className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    {contact.role && (
                      <p className="text-sm text-gray-600">{contact.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => editContact(contact)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit contact"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete contact"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiPhone} className="w-4 h-4" />
                    <a href={`tel:${contact.phone}`} className="hover:text-purple-600">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiMail} className="w-4 h-4" />
                    <a href={`mailto:${contact.email}`} className="hover:text-purple-600">
                      {contact.email}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactList;