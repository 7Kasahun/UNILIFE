import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, adminApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('unilife_student');
    return saved ? JSON.parse(saved) : null;
  });

  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('unilife_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify sessions if tokens exist
    async function checkAuth() {
      const studentToken = localStorage.getItem('unilife_student_token');
      if (studentToken) {
        try {
          const res = await api.getProfile();
          if (res.success && res.user) {
            setStudent(res.user);
            localStorage.setItem('unilife_student', JSON.stringify(res.user));
          }
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            logoutStudent();
          }
        }
      }

      const adminToken = localStorage.getItem('unilife_admin_token');
      if (adminToken) {
        try {
          const res = await adminApi.getMe();
          if (res.success && res.admin) {
            setAdmin(res.admin);
            localStorage.setItem('unilife_admin', JSON.stringify(res.admin));
          }
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            logoutAdmin();
          }
        }
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  const loginStudent = (token, user) => {
    localStorage.setItem('unilife_student_token', token);
    localStorage.setItem('unilife_student', JSON.stringify(user));
    setStudent(user);
  };

  const logoutStudent = () => {
    localStorage.removeItem('unilife_student_token');
    localStorage.removeItem('unilife_student');
    setStudent(null);
  };

  const loginAdmin = (token, adminData) => {
    localStorage.setItem('unilife_admin_token', token);
    localStorage.setItem('unilife_admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('unilife_admin_token');
    localStorage.removeItem('unilife_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        admin,
        loading,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        isStudentAuthenticated: !!student,
        isAdminAuthenticated: !!admin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
