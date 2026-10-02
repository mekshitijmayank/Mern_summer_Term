import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Building2, CalendarDays, Check, CircleAlert, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-react';
import { getAdminUsers, setAccountRole } from '../api/admin.api';
import { getInquiries, updateInquiryStatus } from '../api/inquiries.api';
import { deleteProperty, getProperties } from '../api/properties.api';
import formatPrice from '../utils/formatPrice';

const tabs = [
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'agents', label: 'People & agents', icon: Users },
  { id: 'deals', label: 'Inquiries & deals', icon: ShieldCheck }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    const customProps = JSON.parse(localStorage.getItem('custom_properties') || '[]');
    const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

    try {
      const [propertyResult, userResult, inquiryResult] = await Promise.all([getProperties({ limit: 200 }), getAdminUsers(), getInquiries()]);
      const apiProps = propertyResult.data || [];
      const combinedProps = [...customProps, ...apiProps.filter(ap => !customProps.some(cp => cp._id === ap._id))];
      setProperties(combinedProps);

      const apiUsers = userResult.data || [];
      const combinedUsers = [...localUsers, ...apiUsers.filter(au => !localUsers.some(lu => lu.email === au.email))];
      setUsers(combinedUsers);

      setInquiries(inquiryResult.data || []);
    } catch (requestError) {
      console.warn('API connection offline in AdminDashboard, using local data');
      const { INDIA_PROPERTIES } = await import('../data/indiaProperties');
      const { INDIAN_AGENTS } = await import('../data/indiaProperties');
      setProperties([...customProps, ...INDIA_PROPERTIES]);
      setUsers([...localUsers, ...INDIAN_AGENTS.map(a => ({ _id: a._id, name: a.name, email: a.email, role: 'agent', city: 'Mumbai', country: 'India' }))]);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const changeRole = async (account, role) => {
    setSavingId(account._id);
    try {
      await setAccountRole(account._id, role);
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this account.');
    } finally {
      setSavingId('');
    }
  };

  const removeListing = async (property) => {
    const propId = property._id || property.id;
    if (!window.confirm(`Remove "${property.title}" from the live listings?`)) return;
    try {
      await deleteProperty(propId);
    } catch (requestError) {
      console.warn('API remove listing failed, deleting locally:', requestError);
    } finally {
      const customStr = localStorage.getItem('custom_properties');
      if (customStr) {
        const customProps = JSON.parse(customStr).filter((item) => item._id !== propId && item.id !== propId);
        localStorage.setItem('custom_properties', JSON.stringify(customProps));
      }
      setProperties((current) => current.filter((item) => (item._id !== propId && item.id !== propId)));
    }
  };

  const updateStatus = async (inquiryId, status) => {
    setSavingId(inquiryId);
    try {
      await updateInquiryStatus(inquiryId, status);
      const response = await getInquiries();
      setInquiries(response.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this inquiry.');
    } finally {
      setSavingId('');
    }
  };

  const agentCount = users.filter((user) => user.role === 'agent').length;
  const pendingDeals = inquiries.filter((inquiry) => inquiry.status === 'pending-verification').length;

  return (
    <div className="role-dashboard admin-dashboard">
      <header className="role-dashboard-header">
        <div><span className="gf-eyebrow">GharFind operations</span><h1>Admin control room</h1><p>Property inventory, advisor access and final deal checks.</p></div>
        <span className="admin-secure-label"><ShieldCheck size={16} /> Admin access</span>
      </header>
      <div className="admin-metrics">
        <div><span>Listed properties</span><strong>{properties.length}</strong><Building2 size={19} /></div>
        <div><span>Active agents</span><strong>{agentCount}</strong><Users size={19} /></div>
        <div className={pendingDeals ? 'admin-metric-alert' : ''}><span>Deals to verify</span><strong>{pendingDeals}</strong>{pendingDeals ? <CircleAlert size={19} /> : <BadgeCheck size={19} />}</div>
      </div>
      <nav className="admin-tabs" aria-label="Admin operations">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={16} />{label}{id === 'deals' && pendingDeals > 0 && <span>{pendingDeals}</span>}</button>)}
      </nav>
      {error && <div className="dashboard-error" role="alert">{error}</div>}
      {loading ? <div className="dashboard-loading">Loading operations data…</div> : (
        <section className="admin-workspace">
          {activeTab === 'properties' && <>
            <div className="dashboard-section-title"><div><h2>All property listings</h2><p>Review inventory and remove a listing when required.</p></div><span>{properties.length} total</span></div>
            {properties.length ? <div className="admin-property-list">{properties.map((property) => <article key={property._id} className="admin-property-row"><img src={property.images?.[0]} alt={property.title} /><div className="admin-row-copy"><strong>{property.title}</strong><span><MapPin size={13} />{property.address?.city}, {property.address?.state}</span><small>{property.agent?.name || 'Agent not assigned'} · {property.type}</small></div><b>{formatPrice(property.price, property.type)}</b><a href={`/properties/${property._id}`} target="_blank" rel="noreferrer" aria-label={`Open ${property.title}`}><ArrowUpRight size={17} /></a><button type="button" className="admin-remove-button" onClick={() => removeListing(property)}>Remove</button></article>)}</div> : <div className="dashboard-empty">No listings are available yet.</div>}
          </>}
          {activeTab === 'agents' && <>
            <div className="dashboard-section-title"><div><h2>Agent access</h2><p>Promote registered buyers to agents or return access to buyer level.</p></div><span>{users.length} accounts</span></div>
            <div className="admin-agent-list">{users.filter((user) => user.role !== 'admin').map((account) => <article key={account._id} className="admin-agent-row"><div className="admin-avatar">{account.photo ? <img src={account.photo} alt="" /> : account.name?.slice(0, 1)}</div><div className="admin-row-copy"><strong>{account.name}</strong><span><Mail size={13} />{account.email}</span>{account.phone && <small><Phone size={12} />{account.phone}</small>}</div><span className={`role-pill role-${account.role}`}>{account.role}</span><button type="button" disabled={savingId === account._id} onClick={() => changeRole(account, account.role === 'agent' ? 'buyer' : 'agent')}>{account.role === 'agent' ? 'Remove agent' : 'Make agent'}</button></article>)}</div>
          </>}
          {activeTab === 'deals' && <>
            <div className="dashboard-section-title"><div><h2>Buyer conversations & deal checks</h2><p>Contact the buyer directly, follow progress, and approve only after review.</p></div><span>{inquiries.length} requests</span></div>
            {inquiries.length ? <div className="admin-inquiry-list">{inquiries.map((inquiry) => <article key={inquiry._id} className="admin-inquiry-row"><div className="admin-inquiry-top"><div><strong>{inquiry.property?.title || 'Property inquiry'}</strong><span>{inquiry.name} · {inquiry.property?.address?.city || 'India'}</span></div><span className={`request-status status-${inquiry.status}`}>{inquiry.status?.replaceAll('-', ' ')}</span></div><p>{inquiry.message}</p><div className="admin-inquiry-actions"><a href={`mailto:${inquiry.email}`}><Mail size={14} />{inquiry.email}</a>{inquiry.phone && <a href={`tel:${inquiry.phone}`}><Phone size={14} />{inquiry.phone}</a>}{inquiry.preferredDate && <span><CalendarDays size={14} />{new Date(inquiry.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>}{inquiry.status === 'pending-verification' ? <button type="button" disabled={savingId === inquiry._id} onClick={() => updateStatus(inquiry._id, 'completed')}><Check size={15} />Approve deal</button> : inquiry.status !== 'completed' && <button type="button" disabled={savingId === inquiry._id} onClick={() => updateStatus(inquiry._id, 'contacted')}>Mark contacted</button>}</div></article>)}</div> : <div className="dashboard-empty">No buyer inquiries have arrived yet.</div>}
          </>}
        </section>
      )}
    </div>
  );
}