import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Heart, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getInquiries } from '../api/inquiries.api';
import { getSavedFavorites } from '../utils/favorites';
import formatPrice from '../utils/formatPrice';

export default function BuyerDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [savedHomes] = useState(() => getSavedFavorites());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInquiries()
      .then((response) => setInquiries(response.data || []))
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="role-dashboard">
      <header className="role-dashboard-header">
        <div><span className="gf-eyebrow">Your GharFind</span><h1>Your home search, in one place.</h1><p>Keep an eye on the homes you love and the conversations you’ve started.</p></div>
        <Link to="/listings?country=India" className="dashboard-primary-action">Explore homes <ArrowRight size={16} /></Link>
      </header>
      <div className="buyer-summary">
        <div><Heart size={20} /><span>{savedHomes.length} saved homes</span></div>
        <div><MessageCircle size={20} /><span>{inquiries.length} advisor conversations</span></div>
      </div>
      <section className="dashboard-section">
        <div className="dashboard-section-title"><h2>Saved homes</h2><Link to="/favorites">View saved <ArrowRight size={15} /></Link></div>
        {savedHomes.length ? <div className="buyer-saved-list">{savedHomes.slice(0, 4).map((home) => <Link key={home._id || home.id} to={`/properties/${home._id || home.id}`} className="buyer-saved-item"><img src={home.images?.[0]} alt={home.title} /><div><strong>{home.title}</strong><span><MapPin size={13} />{home.address?.city}, {home.address?.state}</span></div><b>{formatPrice(home.price, home.type)}</b></Link>)}</div> : <div className="dashboard-empty"><p>Save a few homes to compare them here.</p><Link to="/listings?country=India">Browse the collection <ArrowRight size={15} /></Link></div>}
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section-title"><h2>Visits & conversations</h2><span>{loading ? 'Loading' : `${inquiries.length} requests`}</span></div>
        {inquiries.length ? <div className="buyer-request-list">{inquiries.map((request) => <article key={request._id} className="buyer-request"><div className="buyer-request-icon">{request.requestType === 'call' ? <Phone size={18} /> : <CalendarDays size={18} />}</div><div className="buyer-request-main"><strong>{request.property?.title || 'Property enquiry'}</strong><p>{request.requestType?.replace('-', ' ') || 'general inquiry'}{request.preferredDate ? ` · ${new Date(request.preferredDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : ''}</p></div><span className={`request-status status-${request.status}`}>{request.status?.replaceAll('-', ' ')}</span></article>)}</div> : <div className="dashboard-empty"><p>{loading ? 'Fetching your requests…' : 'Your viewing requests and advisor conversations will appear here.'}</p></div>}
      </section>
    </div>
  );
}