import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { auditLogger } from '../utils/auditLogger';
import { authManager } from '../utils/authManager';

const IncidentContext = createContext();

const initialState = {
  incidents: [],
  personnel: [],
  updates: [],
  statusLogs: []
};

function incidentReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'ADD_INCIDENT':
      const newIncident = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedIncidents = [...state.incidents, newIncident];
      localStorage.setItem('incidents', JSON.stringify(updatedIncidents));

      // Log audit trail
      auditLogger.logCreate(
        'incident',
        newIncident.id,
        `Created new incident: ${newIncident.title}`,
        {
          priority: newIncident.priority,
          status: newIncident.status
        }
      );

      return { ...state, incidents: updatedIncidents };

    case 'UPDATE_INCIDENT':
      const oldIncident = state.incidents.find(i => i.id === action.payload.id);
      const updatedIncident = {
        ...oldIncident,
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
      const updatedIncidentList = state.incidents.map(incident =>
        incident.id === action.payload.id ? updatedIncident : incident
      );
      localStorage.setItem('incidents', JSON.stringify(updatedIncidentList));

      // Log changes for audit trail
      if (oldIncident) {
        const changes = [];
        Object.keys(action.payload).forEach(key => {
          if (key !== 'id' && key !== 'updatedAt' && oldIncident[key] !== action.payload[key]) {
            changes.push({
              field: key,
              oldValue: oldIncident[key],
              newValue: action.payload[key]
            });
          }
        });

        if (changes.length > 0) {
          auditLogger.logUpdate(
            'incident',
            action.payload.id,
            `Updated incident: ${oldIncident.title}`,
            changes
          );
        }
      }

      return { ...state, incidents: updatedIncidentList };

    case 'ADD_PERSONNEL':
      const currentUser = authManager.getCurrentUser();
      const newPersonnel = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      const updatedPersonnelList = [...state.personnel, newPersonnel];
      localStorage.setItem('personnel', JSON.stringify(updatedPersonnelList));

      auditLogger.logCreate(
        'personnel',
        newPersonnel.id,
        `Added new personnel: ${newPersonnel.name}`,
        {
          department: newPersonnel.department,
          role: newPersonnel.role
        }
      );

      return { ...state, personnel: updatedPersonnelList };

    case 'UPDATE_PERSONNEL':
      const oldPersonnel = state.personnel.find(p => p.id === action.payload.id);
      const updatedPersonnel = state.personnel.map(person =>
        person.id === action.payload.id
          ? { ...person, ...action.payload, lastActivity: new Date().toISOString() }
          : person
      );
      localStorage.setItem('personnel', JSON.stringify(updatedPersonnel));

      if (oldPersonnel && oldPersonnel.status !== action.payload.status) {
        auditLogger.logStatusChange(
          'personnel',
          action.payload.id,
          oldPersonnel.status,
          action.payload.status,
          { personnelName: oldPersonnel.name }
        );
      }

      return { ...state, personnel: updatedPersonnel };

    case 'ADD_STATUS_LOG':
      const newStatusLog = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      const updatedStatusLogs = [...state.statusLogs, newStatusLog];
      localStorage.setItem('statusLogs', JSON.stringify(updatedStatusLogs));

      return { ...state, statusLogs: updatedStatusLogs };

    case 'ADD_UPDATE':
      const newUpdate = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      const updatedUpdatesList = [...state.updates, newUpdate];
      localStorage.setItem('updates', JSON.stringify(updatedUpdatesList));

      return { ...state, updates: updatedUpdatesList };

    default:
      return state;
  }
}

export function IncidentProvider({ children }) {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  useEffect(() => {
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const personnel = JSON.parse(localStorage.getItem('personnel') || '[]');
    const updates = JSON.parse(localStorage.getItem('updates') || '[]');
    const statusLogs = JSON.parse(localStorage.getItem('statusLogs') || '[]');

    dispatch({
      type: 'LOAD_DATA',
      payload: { incidents, personnel, updates, statusLogs }
    });
  }, []);

  return (
    <IncidentContext.Provider value={{ state, dispatch }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncident() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
}