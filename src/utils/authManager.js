// Authentication and User Management Utility

export const USER_ROLES = {
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
  VIEW_ONLY: 'view_only'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true,
    canExport: true,
    canViewReports: true,
    canManageSystem: true
  },
  [USER_ROLES.CONTRIBUTOR]: {
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: false,
    canExport: true,
    canViewReports: true,
    canManageSystem: false
  },
  [USER_ROLES.VIEW_ONLY]: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
    canExport: true,
    canViewReports: true,
    canManageSystem: false
  }
};

// Default super admin account
const SUPER_ADMIN = {
  id: '999',
  userId: '999',
  pin: 'E911',
  name: 'Super Administrator',
  role: USER_ROLES.ADMIN,
  isActive: true,
  canBeDeleted: false,
  isSuperAdmin: true,
  createdAt: new Date().toISOString(),
  lastLogin: null
};

// Default system configuration
const DEFAULT_SYSTEM_CONFIG = {
  siteName: 'Emergency Management System',
  contactInfo: 'For support, contact your system administrator',
  systemNotice: '',
  showNotice: false,
  showDefaultAdmin: true, // New setting to control default admin notice
  logoUrl: '',
  primaryColor: '#dc2626',
  secondaryColor: '#991b1b',
  accentColor: '#fef2f2',
  colorSchemeName: 'Emergency Red',
  createdAt: new Date().toISOString()
};

export const authManager = {
  // Initialize default users and system config
  initializeUsers: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.userId === '999')) {
      users.push(SUPER_ADMIN);
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Initialize system config if it doesn't exist
    if (!localStorage.getItem('systemConfig')) {
      localStorage.setItem('systemConfig', JSON.stringify(DEFAULT_SYSTEM_CONFIG));
    }
  },

  // Login user
  login: (userId, pin) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.userId === userId && u.pin === pin && u.isActive);

    if (user) {
      user.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, error: 'Invalid credentials' };
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return authManager.getCurrentUser() !== null;
  },

  // Check if user is super admin
  isSuperAdmin: () => {
    const user = authManager.getCurrentUser();
    return user && user.isSuperAdmin === true;
  },

  // Check user permissions
  hasPermission: (permission) => {
    const user = authManager.getCurrentUser();
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions ? permissions[permission] : false;
  },

  // Get system configuration
  getSystemConfig: () => {
    const config = localStorage.getItem('systemConfig');
    if (!config) {
      // Initialize with default if missing
      localStorage.setItem('systemConfig', JSON.stringify(DEFAULT_SYSTEM_CONFIG));
      return DEFAULT_SYSTEM_CONFIG;
    }
    return JSON.parse(config);
  },

  // Update system configuration
  updateSystemConfig: (config) => {
    const currentConfig = authManager.getSystemConfig();
    const updatedConfig = {
      ...currentConfig,
      ...config,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('systemConfig', JSON.stringify(updatedConfig));
    
    // Force a page refresh to apply changes immediately
    window.dispatchEvent(new Event('storage'));
    
    return updatedConfig;
  },

  // Get all users
  getUsers: () => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },

  // Add user
  addUser: (userData) => {
    const users = authManager.getUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      canBeDeleted: true,
      isSuperAdmin: false
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  },

  // Update user
  updateUser: (userId, updates) => {
    const users = authManager.getUsers();
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user if editing self
    const currentUser = authManager.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  },

  // Delete user
  deleteUser: (userId) => {
    const users = authManager.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user && user.canBeDeleted) {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return true;
    }
    return false;
  },

  // Reset user PIN
  resetUserPin: (userId, newPin) => {
    authManager.updateUser(userId, { pin: newPin });
  },

  // Toggle user active status
  toggleUserStatus: (userId) => {
    const users = authManager.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user && user.canBeDeleted) {
      authManager.updateUser(userId, { isActive: !user.isActive });
      return true;
    }
    return false;
  }
};