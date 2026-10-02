'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'STAFF';
  tenantId?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  logo?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  currency: string;
  timezone: string;
  gstNumber?: string | null;
  invoicePrefix: string;
  bookingPrefix: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchTenantContext: (tenantId: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  // Modal states
  openModal: string | null;
  modalData: any;
  setOpenModal: (name: string | null, data?: any) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [openModal, setOpenModalState] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setOpenModal = (name: string | null, data: any = null) => {
    setOpenModalState(name);
    setModalData(data);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
        if (data.user.role === 'SUPER_ADMIN' && activeView === 'dashboard') {
          // Keep active view or allow superadmin
        }
      } else {
        setUser(null);
        setTenant(null);
      }
    } catch (err) {
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [refreshTrigger]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login failed', 'error');
        return false;
      }
      setUser(data.user);
      setTenant(data.tenant);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      if (data.user.role === 'SUPER_ADMIN') {
        setActiveView('superadmin');
      } else {
        setActiveView('dashboard');
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'An error occurred during login', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTenant(null);
      showToast('Logged out successfully', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const switchTenantContext = (tenantId: string) => {
    // Used by SuperAdmin
    triggerRefresh();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        tenant,
        loading,
        activeView,
        setActiveView,
        login,
        logout,
        switchTenantContext,
        toasts,
        showToast,
        removeToast,
        openModal,
        modalData,
        setOpenModal,
        refreshTrigger,
        triggerRefresh
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 500,
              color: '#ffffff',
              background:
                toast.type === 'success' ? '#059669' :
                toast.type === 'error' ? '#dc2626' :
                toast.type === 'warning' ? '#d97706' : '#1e293b',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              pointerEvents: 'auto',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.8,
                fontSize: 14
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
