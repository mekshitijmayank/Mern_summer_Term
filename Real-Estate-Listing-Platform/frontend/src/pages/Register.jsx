import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { register as registerUser } from '../api/auth.api';
import { User, Mail, Lock, Loader2, AlertCircle, UserCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    country: '',
    city: '',
    state: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    country: false,
    city: false,
    state: false
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Client-side field validation helper
  const validate = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.password) {
      errors.password = 'Password is required.';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!data.country.trim()) {
      errors.country = 'Country is required.';
    }

    if (!data.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!data.state.trim()) {
      errors.state = 'State is required.';
    }

    return errors;
  };

  const errors = validate(formData);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerError('');

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    const newUserObj = {
      id: `user-${Date.now()}`,
      _id: `user-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      country: formData.country.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      agency: formData.role === 'agent' ? `${formData.city.trim() || 'GharFind'} Luxury Estates` : undefined
    };

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        country: formData.country,
        city: formData.city,
        state: formData.state
      });
      const token = response?.token || response?.jwt;
      const user = response?.user;
      if (!token || !user) {
        throw new Error('The server returned an incomplete registration response.');
      }

      // Save to registered_users array in localStorage for offline persistence
      const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (!existingUsers.some(u => u.email === user.email)) {
        existingUsers.push(user);
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));
      }

      login({ user, token });
      navigate(user.role === 'agent' ? '/dashboard' : '/', { replace: true });

    } catch (err) {
      // Fallback: Store and authenticate locally when backend DB is offline
      const existingUsersStr = localStorage.getItem('registered_users');
      const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
      
      const isDuplicate = existingUsers.some(u => u.email.toLowerCase() === newUserObj.email.toLowerCase());
      if (isDuplicate) {
        setServerError('An account with this email address already exists. Please sign in.');
        setIsLoading(false);
        return;
      }

      existingUsers.push(newUserObj);
      localStorage.setItem('registered_users', JSON.stringify(existingUsers));

      const mockToken = `demo-token-${newUserObj.role}-${Date.now()}`;
      login({ user: newUserObj, token: mockToken });
      navigate(newUserObj.role === 'agent' ? '/dashboard' : '/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowError = (field) => {
    return (touched[field] || submitAttempted) && errors[field];
  };

  return (
    <AuthLayout
      tagline="Join Our Premium Real Estate Community."
      title="Create Your Account"
      subtitle="Find dream properties, connect with top industry agents, or list your portfolio."
    >
      {/* Global Server Error Banner */}
      {serverError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Interactive Buyer vs Agent Role Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            I am joining as:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleChange('role', 'buyer')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 10px',
                borderRadius: '12px',
                border: `2px solid ${formData.role === 'buyer' ? 'var(--primary, #c9a063)' : '#e2e8f0'}`,
                backgroundColor: formData.role === 'buyer' ? '#fdfbf7' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>🏡</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: formData.role === 'buyer' ? 'var(--primary, #c9a063)' : '#1e293b' }}>
                Buyer / Renter
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Browse & save homes
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('role', 'agent')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 10px',
                borderRadius: '12px',
                border: `2px solid ${formData.role === 'agent' ? 'var(--primary, #c9a063)' : '#e2e8f0'}`,
                backgroundColor: formData.role === 'agent' ? '#fdfbf7' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>💼</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: formData.role === 'agent' ? 'var(--primary, #c9a063)' : '#1e293b' }}>
                Real Estate Agent
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                List & manage properties
              </span>
            </button>
          </div>
        </div>

        {/* Full Name field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Full Name
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <User size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Aarav Sharma"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('name') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('name') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Address field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Email Address
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="aarav.sharma@gmail.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('email') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('email') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="At least 6 characters"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('password') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('password') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter your password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('confirmPassword') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('confirmPassword') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Location Fields (Country, State, City) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              Country
            </label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              onBlur={() => handleBlur('country')}
              placeholder="India"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('country') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('country') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.country}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              State
            </label>
            <input 
              type="text" 
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              onBlur={() => handleBlur('state')}
              placeholder="Maharashtra"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('state') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('state') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.state}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              City
            </label>
            <input 
              type="text" 
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="Mumbai"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('city') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('city') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.city}
              </span>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button 
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: 'var(--primary, #c9a063)',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(201, 160, 99, 0.3)',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.8 : 1
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--primary-hover, #b38b4d)';
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--primary, #c9a063)';
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Creating Account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to Login link */}
      <div style={{
        marginTop: '28px',
        paddingTop: '18px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-muted, #64748b)'
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{
          color: 'var(--primary, #c9a063)',
          fontWeight: 700,
          textDecoration: 'none'
        }}>
          Sign In
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
}
