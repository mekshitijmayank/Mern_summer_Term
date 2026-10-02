import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Search, 
  Lock, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  LogOut,
  Building2,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Phone,
  Mail,
  Globe,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../api/properties.api';
import { getInquiries } from '../api/inquiries.api';
import InquiryList from '../components/inquiry/InquiryList';
import formatPrice from '../utils/formatPrice';
import api from '../api/axios';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, updateUser, logout } = useAuth();
  
  // Dashboard & Navigation tab state
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    agency: '',
    bio: '',
    yearsOfExperience: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Password Form States
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passError, setPassError] = useState('');

  // Agent Listings and Inquiries state
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  
  // Property Add Form State
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: '2',
    bathrooms: '2',
    areaSqft: '1500',
    city: '',
    street: '',
    country: 'India',
    state: '',
    lng: '72.8777',
    lat: '19.0760',
    amenities: 'pool, parking, airConditioning'
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedBrochure, setSelectedBrochure] = useState(null);
  const [brochureError, setBrochureError] = useState('');
  const [imageError, setImageError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Guard routing check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        photo: currentUser.photo || '',
        agency: currentUser.agency || 'GharFind',
        bio: currentUser.bio || '',
        yearsOfExperience: currentUser.yearsOfExperience || 0
      });
      setPreviewUrl(currentUser.photo || '');
      
      if (currentUser.role === 'agent') {
        fetchAgentData();
      }
    }
  }, [currentUser, isAuthenticated, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Listings & Inquiries for Agents
  const fetchAgentData = async () => {
    setLoading(true);
    const userEmail = currentUser?.email || localStorage.getItem('userEmail');
    const userRole = currentUser?.role || localStorage.getItem('userRole');
    const userId = currentUser?.id || currentUser?._id;

    // Load local custom properties
    const customStr = localStorage.getItem('custom_properties');
    const customProps = customStr ? JSON.parse(customStr) : [];
    const localAgentProps = customProps.filter(p => {
      if (userRole === 'admin') return true;
      return p.agent?.email === userEmail || p.agent === userEmail || p.agent?.id === userId || p.agent?._id === userId;
    });

    try {
      const propsRes = await getProperties();
      const apiListings = propsRes.data?.filter(p => {
        if (userRole === 'admin') return true;
        return p.agent?.email === userEmail || p.agent === userEmail;
      }) || [];
      
      const combined = [...localAgentProps, ...apiListings.filter(ap => !localAgentProps.some(lp => lp._id === ap._id))];
      setProperties(combined);

      const inquiriesRes = await getInquiries();
      setInquiries(inquiriesRes.data || []);
    } catch (err) {
      console.warn('API error listing fetch, using local agent properties:', err);
      setProperties(localAgentProps);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', profileData.name);
      data.append('email', profileData.email);
      data.append('phone', profileData.phone);
      
      if (currentUser.role === 'agent') {
        data.append('agency', profileData.agency);
        data.append('bio', profileData.bio);
        data.append('yearsOfExperience', profileData.yearsOfExperience);
      }

      if (selectedFile) {
        data.append('photo', selectedFile);
      } else {
        data.append('photo', profileData.photo);
      }

      const response = await api.put('/api/auth/updatedetails', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        updateUser(response.data.data);
        showToast('Profile settings updated successfully');
        setSelectedFile(null);
      }
    } catch (err) {
      console.warn('Backend details update error, saving locally:', err);
      const simulatedUpdate = {
        ...currentUser,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        photo: previewUrl || profileData.photo,
        agency: profileData.agency,
        bio: profileData.bio,
        yearsOfExperience: parseInt(profileData.yearsOfExperience)
      };
      updateUser(simulatedUpdate);
      showToast('Profile details updated (local mode)');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      showToast('Password updated successfully');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Password update failed. Verify current password.';
      setPassError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? All your listings and profile details will be lost forever. This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await api.delete('/api/auth/me');
      handleLogout();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Account deletion failed.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Agent Listings Handlers
  const handlePropertyFormChange = (e) => {
    setPropertyForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateClick = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      title: '',
      description: '',
      price: '',
      type: 'sale',
      propertyType: 'apartment',
      bedrooms: '2',
      bathrooms: '2',
      areaSqft: '1500',
      city: '',
      street: '',
      country: 'India',
      state: '',
      lng: '72.8777',
      lat: '19.0760',
      amenities: 'pool, parking, airConditioning'
    });
    setSelectedImages([]);
    setSelectedBrochure(null);
    setImageError('');
    setBrochureError('');
    setIsModalOpen(true);
  };

  const handleEditClick = (property) => {
    setEditingPropertyId(property._id || property.id);
    setPropertyForm({
      title: property.title || '',
      description: property.description || '',
      price: property.price ? String(property.price) : '',
      type: property.type || 'sale',
      propertyType: property.propertyType || 'apartment',
      bedrooms: property.bedrooms ? String(property.bedrooms) : '2',
      bathrooms: property.bathrooms ? String(property.bathrooms) : '2',
      areaSqft: property.areaSqft ? String(property.areaSqft) : '1500',
      city: property.address?.city || '',
      street: property.address?.street || '',
      country: property.address?.country || '',
      state: property.address?.state || '',
      lng: property.location?.coordinates?.[0] ? String(property.location.coordinates[0]) : '72.8777',
      lat: property.location?.coordinates?.[1] ? String(property.location.coordinates[1]) : '19.0760',
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : ''
    });
    setSelectedImages(property.images || []);
    setSelectedBrochure(property.brochureUrl || null);
    setImageError('');
    setBrochureError('');
    setIsModalOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendImages(Array.from(e.dataTransfer.files));
    }
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      appendImages(Array.from(e.target.files));
    }
  };

  const appendImages = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setImageError('Only image files are allowed in this zone.');
      return;
    }
    
    setSelectedImages(prev => {
      const combined = [...prev, ...imageFiles];
      if (combined.length > 10) {
        setImageError('Maximum limit of 10 images reached.');
        return combined.slice(0, 10);
      }
      if (combined.length >= 3) {
        setImageError('');
      }
      return combined;
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < 3) {
        setImageError('Minimum of 3 images required.');
      } else {
        setImageError('');
      }
      return updated;
    });
  };

  const handleBrochureFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setBrochureError('Only PDF files are accepted for the brochure.');
        setSelectedBrochure(null);
        e.target.value = null;
      } else {
        setBrochureError('');
        setSelectedBrochure(file);
      }
    }
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const defaultImages = [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85'
    ];

    const processedImages = selectedImages.length > 0
      ? selectedImages.map(img => typeof img === 'string' ? img : URL.createObjectURL(img))
      : defaultImages;

    const fallbackProperty = {
      _id: editingPropertyId || `prop-${Date.now()}`,
      id: editingPropertyId || `prop-${Date.now()}`,
      title: propertyForm.title || 'Luxury Residence',
      description: propertyForm.description || 'A beautiful contemporary home with premium amenities.',
      price: parseFloat(propertyForm.price) || 25000000,
      type: propertyForm.type || 'sale',
      propertyType: propertyForm.propertyType || 'apartment',
      bedrooms: parseInt(propertyForm.bedrooms, 10) || 2,
      bathrooms: parseFloat(propertyForm.bathrooms) || 2,
      areaSqft: parseInt(propertyForm.areaSqft, 10) || 1500,
      address: {
        street: propertyForm.street || 'Prime Avenue',
        city: propertyForm.city || currentUser?.city || 'Mumbai',
        state: propertyForm.state || currentUser?.state || 'Maharashtra',
        country: propertyForm.country || 'India',
        zip: '400001'
      },
      location: {
        type: 'Point',
        coordinates: [parseFloat(propertyForm.lng) || 72.8777, parseFloat(propertyForm.lat) || 19.0760]
      },
      images: processedImages,
      amenities: propertyForm.amenities ? propertyForm.amenities.split(',').map(a => a.trim()) : ['pool', 'parking', 'security'],
      featured: true,
      agent: {
        _id: currentUser?._id || currentUser?.id || `agent-${Date.now()}`,
        name: currentUser?.name || 'Agent',
        email: currentUser?.email || 'agent@gharfind.in',
        phone: currentUser?.phone || '+91 98000 00000',
        agency: currentUser?.agency || 'GharFind Luxury Estates'
      },
      createdAt: new Date().toISOString()
    };

    try {
      const formData = new FormData();
      formData.append('title', propertyForm.title);
      formData.append('description', propertyForm.description);
      formData.append('price', parseFloat(propertyForm.price));
      formData.append('type', propertyForm.type);
      formData.append('propertyType', propertyForm.propertyType);
      formData.append('bedrooms', parseInt(propertyForm.bedrooms, 10));
      formData.append('bathrooms', parseFloat(propertyForm.bathrooms));
      formData.append('areaSqft', parseInt(propertyForm.areaSqft, 10));
      
      const addressObj = {
        street: propertyForm.street,
        city: propertyForm.city,
        country: propertyForm.country,
        state: propertyForm.state,
        zip: ''
      };
      formData.append('address', JSON.stringify(addressObj));

      const locationObj = {
        type: 'Point',
        coordinates: [parseFloat(propertyForm.lng), parseFloat(propertyForm.lat)]
      };
      formData.append('location', JSON.stringify(locationObj));

      const amenitiesArr = propertyForm.amenities.split(',').map(a => a.trim());
      formData.append('amenities', JSON.stringify(amenitiesArr));

      selectedImages.forEach((img) => {
        if (typeof img !== 'string') formData.append('images', img);
      });

      if (editingPropertyId) {
        await updateProperty(editingPropertyId, formData);
      } else {
        await createProperty(formData);
      }
    } catch (err) {
      console.warn('API property submission failed, persisting locally:', err);
    } finally {
      // Save locally to custom_properties in localStorage
      const customStr = localStorage.getItem('custom_properties');
      const customProps = customStr ? JSON.parse(customStr) : [];
      let updatedCustom;
      if (editingPropertyId) {
        updatedCustom = customProps.map(p => (p._id === editingPropertyId || p.id === editingPropertyId) ? fallbackProperty : p);
      } else {
        updatedCustom = [fallbackProperty, ...customProps];
      }
      localStorage.setItem('custom_properties', JSON.stringify(updatedCustom));

      setModalSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
        setPropertyForm({
          title: '',
          description: '',
          price: '',
          type: 'sale',
          propertyType: 'apartment',
          bedrooms: '2',
          bathrooms: '2',
          areaSqft: '1500',
          city: '',
          street: '',
          country: 'India',
          state: '',
          lng: '72.8777',
          lat: '19.0760',
          amenities: 'pool, parking, airConditioning'
        });
        setSelectedImages([]);
        setSelectedBrochure(null);
        setImageError('');
        setBrochureError('');
        fetchAgentData();
        setLoading(false);
      }, 1200);
    }
  };

  const handlePropertyDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteProperty(id);
    } catch (err) {
      console.warn('API delete failed, removing locally:', err);
    } finally {
      const customStr = localStorage.getItem('custom_properties');
      if (customStr) {
        const customProps = JSON.parse(customStr).filter(p => p._id !== id && p.id !== id);
        localStorage.setItem('custom_properties', JSON.stringify(customProps));
      }
      fetchAgentData();
      showToast('Listing deleted successfully');
    }
  };

  const isAgent = currentUser?.role === 'agent';

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: 'var(--bg-offset)',
      paddingTop: '60px',
      paddingBottom: '80px'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
        
        {/* Toast alert banner */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '24px',
            zIndex: 9999,
            padding: '16px 24px',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            borderRadius: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Unified Left Sidebar */}
        <div style={{
          gridColumn: 'span 3',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '24px',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)'
        }} className="profile-sidebar">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 160, 89, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              overflow: 'hidden'
            }}>
              {previewUrl ? (
                <img src={previewUrl} alt={currentUser?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>{currentUser?.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{currentUser?.role} Account</span>
            </div>
          </div>

          {/* Dynamic tabs based on Buyer / Agent Roles */}
          <button
            onClick={() => setActiveTab('info')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'info' ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
              color: activeTab === 'info' ? 'var(--primary)' : 'var(--text)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={18} />
            <span>Profile Info</span>
          </button>

          {!isAgent ? (
            <button
              onClick={() => setActiveTab('searches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'searches' ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                color: activeTab === 'searches' ? 'var(--primary)' : 'var(--text)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={18} />
              <span>Saved Searches</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('listings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'listings' ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                  color: activeTab === 'listings' ? 'var(--primary)' : 'var(--text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <Building2 size={18} />
                <span>My Listings</span>
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'inquiries' ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                  color: activeTab === 'inquiries' ? 'var(--primary)' : 'var(--text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageSquare size={18} />
                <span>Inquiries Received</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'security' ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
              color: activeTab === 'security' ? 'var(--primary)' : 'var(--text)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={18} />
            <span>Password & Security</span>
          </button>

          {/* Relocated Logout sidebar option */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              marginTop: '16px',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              transition: 'all 0.2s ease'
            }}
            className="logout-sidebar-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Right workspace panels */}
        <div style={{
          gridColumn: 'span 9',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          padding: '40px',
          boxShadow: 'var(--shadow)',
          minHeight: '450px'
        }} className="profile-content">
          
          {/* PROFILE INFO TAB */}
          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                Profile Information
              </h2>

              {/* Avatar Selector block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <img
                    src={previewUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                    alt="Avatar Preview"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <label htmlFor="avatar-file" style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <Camera size={14} />
                    <input 
                      type="file" 
                      id="avatar-file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>Your Profile Picture</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PNG, JPG or WebP. Max 5MB file sizes.</span>
                </div>
              </div>

              {/* Input Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isAgent ? '1fr 1fr' : '1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="name-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Full Name</label>
                    <input
                      type="text"
                      id="name-input"
                      name="name"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="email-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Email Address</label>
                    <input
                      type="email"
                      id="email-input"
                      name="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isAgent ? '1fr 1fr' : '1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="phone-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                      type="tel"
                      id="phone-input"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="e.g. +91 98765 43210"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  {isAgent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="agency-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Agency Name</label>
                      <input
                        type="text"
                        id="agency-input"
                        name="agency"
                        value={profileData.agency}
                        onChange={handleProfileChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>

                {isAgent && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="experience-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Years of Experience</label>
                      <input
                        type="number"
                        id="experience-input"
                        name="yearsOfExperience"
                        value={profileData.yearsOfExperience}
                        onChange={handleProfileChange}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {isAgent && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="bio-input" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Biography (Bio)</label>
                    <textarea
                      id="bio-input"
                      name="bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Describe your target markets and expertise."
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: 'fit-content',
                  transition: 'background-color 0.2s'
                }}
                className="save-btn"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </form>
          )}

          {/* SAVED SEARCHES TAB (BUYERS ONLY) */}
          {activeTab === 'searches' && !isAgent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                Saved Searches
              </h2>
              <div style={{
                border: '1px dashed var(--border)',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-offset)'
              }}>
                <Search size={36} style={{ color: 'var(--primary)', marginBottom: '12px', opacity: 0.8 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>Saved Searches Panel</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Feature coming soon! You will be able to save filters defined in listings.</p>
              </div>
            </div>
          )}

          {/* MY LISTINGS TAB (AGENTS ONLY) */}
          {activeTab === 'listings' && isAgent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                  My Listed Properties
                </h2>
                <button
                  onClick={handleCreateClick}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="save-btn"
                >
                  <Plus size={16} />
                  <span>Create Listing</span>
                </button>
              </div>

              {properties.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {properties.map(property => (
                    <div key={property._id || property.id} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditClick(property)}
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          title="Edit Listing"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handlePropertyDelete(property._id || property.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                        alt={property.title}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{property.title}</h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {property.address?.street}, {property.address?.city}
                        </p>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatPrice(property.price, property.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '1px dashed var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You have not listed any properties yet. Click "Create Listing" to start.
                </div>
              )}
            </div>
          )}

          {/* INQUIRIES RECEIVED TAB (AGENTS ONLY) */}
          {activeTab === 'inquiries' && isAgent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                Client Inquiries
              </h2>
              <InquiryList inquiries={inquiries} loading={loading} />
            </div>
          )}

          {/* PASSWORD & SECURITY TAB (BOTH) */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                  Password & Security
                </h2>

                {passError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px' }}>
                    <AlertCircle size={16} />
                    <span>{passError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="cur-pass" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Current Password</label>
                    <input
                      type="password"
                      id="cur-pass"
                      required
                      value={passData.currentPassword}
                      onChange={(e) => setPassData(p => ({ ...p, currentPassword: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="new-pass" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>New Password</label>
                    <input
                      type="password"
                      id="new-pass"
                      required
                      value={passData.newPassword}
                      onChange={(e) => setPassData(p => ({ ...p, newPassword: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="conf-pass" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      id="conf-pass"
                      required
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData(p => ({ ...p, confirmPassword: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'fit-content',
                    transition: 'background-color 0.2s'
                  }}
                  className="save-btn"
                >
                  <Save size={16} />
                  <span>{loading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>

              {/* DANGER ZONE - DELETE ACCOUNT */}
              <div style={{
                marginTop: '16px',
                paddingTop: '32px',
                borderTop: '1px solid #fee2e2'
              }}>
                <h3 style={{ color: '#b91c1c', fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
                  Danger Zone
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                  Permanently delete your profile account and all associated data. Listed properties and message inquiries will be removed from active catalogs. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CREATE PROPERTY LISTING MODAL (AGENTS ONLY) */}
      {isModalOpen && isAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(18, 24, 36, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            {modalSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <CheckCircle size={54} style={{ color: '#10b981' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  {editingPropertyId ? 'Property Updated' : 'Property Created'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  {editingPropertyId 
                    ? 'Your property details have been successfully updated.' 
                    : 'Your property has been successfully added to listings.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                  {editingPropertyId ? 'Edit Property Listing' : 'Add New Property'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Property Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    value={propertyForm.title} 
                    onChange={handlePropertyFormChange}
                    placeholder="Glass Waterfront Villa"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={3} 
                    value={propertyForm.description} 
                    onChange={handlePropertyFormChange}
                    placeholder="Describe highlights and amenities."
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Price (₹)</label>
                    <input 
                      type="number" 
                      name="price" 
                      required 
                      value={propertyForm.price} 
                      onChange={handlePropertyFormChange}
                      placeholder="12500000"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', width: '100%', minWidth: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Transaction Type</label>
                    <select 
                      name="type" 
                      value={propertyForm.type} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', height: '42px', backgroundColor: '#ffffff', width: '100%', minWidth: 0 }}
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Beds</label>
                    <input 
                      type="number" 
                      name="bedrooms" 
                      required 
                      value={propertyForm.bedrooms} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', width: '100%', minWidth: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Baths</label>
                    <input 
                      type="number" 
                      name="bathrooms" 
                      required 
                      value={propertyForm.bathrooms} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', width: '100%', minWidth: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Area (sqft)</label>
                    <input 
                      type="number" 
                      name="areaSqft" 
                      required 
                      value={propertyForm.areaSqft} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', width: '100%', minWidth: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Type</label>
                    <select 
                      name="propertyType" 
                      value={propertyForm.propertyType} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', height: '42px', backgroundColor: '#ffffff', width: '100%', minWidth: 0 }}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Street Address</label>
                    <input 
                      type="text" 
                      name="street" 
                      required 
                      value={propertyForm.street} 
                      onChange={handlePropertyFormChange}
                      placeholder="Pali Hill, Bandra West"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      required 
                      value={propertyForm.city} 
                      onChange={handlePropertyFormChange}
                      placeholder="Mumbai"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>State</label>
                    <input 
                      type="text" 
                      name="state"
                      required 
                      value={propertyForm.state}
                      onChange={handlePropertyFormChange}
                      placeholder="Maharashtra"
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Longitude</label>
                    <input 
                      type="text" 
                      name="lng" 
                      required 
                      value={propertyForm.lng} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Latitude</label>
                    <input 
                      type="text" 
                      name="lat" 
                      required 
                      value={propertyForm.lat} 
                      onChange={handlePropertyFormChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Drag-and-drop Image Upload Zone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    Property Images (Required: 3 to 10)
                  </label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                      borderRadius: '12px',
                      padding: '30px 20px',
                      textAlign: 'center',
                      backgroundColor: dragActive ? 'rgba(197, 160, 89, 0.05)' : 'var(--bg-offset)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('image-upload-input').click()}
                  >
                    <input 
                      type="file" 
                      id="image-upload-input"
                      multiple 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileChange}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>📸</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                        Drag & Drop your images here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Supports JPG, PNG, WEBP (min 3, max 10 images)
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Previews Grid */}
                  {selectedImages.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '12px',
                      marginTop: '8px'
                    }}>
                      {selectedImages.map((img, idx) => {
                        const url = typeof img === 'string' ? img : URL.createObjectURL(img);
                        return (
                          <div key={idx} style={{ position: 'relative', width: '100%', pt: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(18, 24, 36, 0.75)',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Image Counter and Errors */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: selectedImages.length < 3 || selectedImages.length > 10 ? '#ef4444' : '#10b981'
                    }}>
                      {selectedImages.length}/10 images
                    </span>
                    {imageError && (
                      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                        {imageError}
                      </span>
                    )}
                  </div>
                </div>

                {/* PDF Brochure Upload Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    Property Brochure (PDF, optional)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-offset)'
                  }}>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handleBrochureFileChange}
                      style={{ fontSize: '13px', outline: 'none', flexGrow: 1 }}
                    />
                    {selectedBrochure && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedBrochure(null)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {brochureError && (
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>
                      {brochureError}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    name="amenities" 
                    value={propertyForm.amenities} 
                    onChange={handlePropertyFormChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '15px',
                    marginTop: '10px'
                  }}
                >
                  {loading ? (editingPropertyId ? 'Saving...' : 'Creating...') : (editingPropertyId ? 'Save Changes' : 'Save Property Listing')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .save-btn:hover {
          background-color: var(--primary-hover) !important;
        }
        .logout-sidebar-btn:hover {
          background-color: rgba(239, 68, 68, 0.08) !important;
        }
        @media (max-width: 768px) {
          .profile-sidebar {
            grid-column: span 12 !important;
          }
          .profile-content {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
}
