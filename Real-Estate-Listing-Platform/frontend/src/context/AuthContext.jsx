import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  });

  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token') || localStorage.getItem('authToken')));

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('isLoggedIn');
      setCurrentUser(null);
      setLoading(false);
      return undefined;
    }

    if (token.startsWith('demo-token-')) {
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        try {
          setCurrentUser(JSON.parse(savedUserStr));
        } catch (e) {}
      }
      setLoading(false);
      return undefined;
    }

    let isCurrent = true;
    setLoading(true);
    api.get('/api/auth/me')
      .then((response) => {
        const user = response.data?.data;
        if (!user) throw new Error('The server returned an incomplete user profile.');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        if (isCurrent) setCurrentUser(user);
      })
      .catch(() => {
        // Fallback: If offline or API fails, preserve locally stored user session if available
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (isCurrent) setCurrentUser(savedUser);
            return;
          } catch (e) {}
        }
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        if (isCurrent) {
          setToken(null);
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const login = ({ user, token: authToken }) => {
    if (!authToken || !user) {
      throw new Error('A valid user and authentication token are required.');
    }

    localStorage.setItem('token', authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');

    setToken(authToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setCurrentUser(null);
  };

  const updateUser = (updatedFields) => {
    setCurrentUser(prev => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newObj));

      try {
        const registeredStr = localStorage.getItem('registered_users');
        const registeredUsers = registeredStr ? JSON.parse(registeredStr) : [];
        const targetEmail = newObj.email?.toLowerCase();
        const targetId = newObj.id || newObj._id;

        const idx = registeredUsers.findIndex(u =>
          (targetEmail && u.email?.toLowerCase() === targetEmail) ||
          (targetId && (u.id === targetId || u._id === targetId))
        );

        if (idx !== -1) {
          registeredUsers[idx] = { ...registeredUsers[idx], ...newObj };
        } else {
          registeredUsers.push(newObj);
        }
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      } catch (e) {
        console.warn('Could not sync profile to registered_users array:', e);
      }

      return newObj;
    });
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!token && !!currentUser,
    login,
    logout,
    updateUser,
    loading,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
