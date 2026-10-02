import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BedDouble, Building2, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import { INDIA_PROPERTIES } from '../data/indiaProperties';
import { FEATURED_CITIES, INDIA_LOCATIONS } from '../data/indiaLocations';
import { getProperties } from '../api/properties.api';

const featureNotes = [
  { icon: ShieldCheck, title: 'People before property', description: 'Work directly with a named local property advisor.' },
  { icon: Building2, title: 'A considered collection', description: 'Homes selected across India’s most sought-after addresses.' },
  { icon: Sparkles, title: 'From first visit to final word', description: 'Keep conversations, viewings and decisions in one place.' }
];

export default function GharFindHome() {
  const navigate = useNavigate();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [featuredHomes, setFeaturedHomes] = useState([]);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const cities = state ? INDIA_LOCATIONS[state] || [] : [];

  useEffect(() => {
    const customPropsStr = localStorage.getItem('custom_properties');
    const customProps = customPropsStr ? JSON.parse(customPropsStr) : [];

    getProperties({ featured: true, country: 'India', limit: 6 })
      .then((response) => {
        const properties = response.data || response.properties || [];
        const combined = [...customProps, ...(Array.isArray(properties) ? properties : [])];
        setFeaturedHomes(combined.length ? combined.slice(0, 6) : [...customProps, ...INDIA_PROPERTIES].slice(0, 6));
      })
      .catch(() => setFeaturedHomes([...customProps, ...INDIA_PROPERTIES].slice(0, 6)))
      .finally(() => setLoadingHomes(false));
  }, []);

  const searchHomes = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ country: 'India' });
    if (state) params.set('state', state);
    if (city) params.set('city', city);
    if (budget) params.set('maxPrice', budget);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="gharfind-home">
      <section className="gf-hero" aria-labelledby="home-heading">
        <div className="gf-hero-image" role="img" aria-label="Modern Indian home with landscaped courtyard" />
        <div className="gf-hero-inner container">
          <div className="gf-hero-copy">
            <span className="gf-eyebrow gf-eyebrow-light">A better way home, across India</span>
            <h1 id="home-heading">Find a home<br />that feels like <em>yours.</em></h1>
            <p>Thoughtfully chosen residences. Local people who know the neighbourhood. A clearer path from first look to key handover.</p>
          </div>
          <form className="gf-search" onSubmit={searchHomes}>
            <label className="gf-search-field">
              <span>State</span>
              <select value={state} onChange={(event) => { setState(event.target.value); setCity(''); }}>
                <option value="">All India</option>
                {Object.keys(INDIA_LOCATIONS).map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="gf-search-field">
              <span>City or neighbourhood</span>
              <select value={city} onChange={(event) => setCity(event.target.value)} disabled={!state}>
                <option value="">Any city</option>
                {cities.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="gf-search-field gf-budget-field">
              <span>Maximum budget</span>
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                <option value="">Any budget</option>
                <option value="15000000">Up to ₹1.5 Cr</option>
                <option value="30000000">Up to ₹3 Cr</option>
                <option value="50000000">Up to ₹5 Cr</option>
                <option value="100000000">Up to ₹10 Cr</option>
              </select>
            </label>
            <button className="gf-search-button" type="submit" aria-label="Search homes"><Search size={19} /><span>Find a home</span></button>
          </form>
          <div className="gf-hero-footnote"><span><MapPin size={15} /> Across 10 states</span><span><BedDouble size={15} /> Homes, villas & apartments</span></div>
        </div>
        <div className="gf-hero-index"><span>01</span><i /><span>12</span></div>
      </section>

      <section className="gf-city-section container" aria-labelledby="city-heading">
        <div className="gf-section-heading">
          <div><span className="gf-eyebrow">Places to begin</span><h2 id="city-heading">Find your corner of India.</h2></div>
          <Link to="/listings?country=India" className="gf-text-link">Explore all locations <ArrowUpRight size={17} /></Link>
        </div>
        <div className="gf-city-grid">
          {FEATURED_CITIES.map((place, index) => (
            <Link key={place.name} to={`/listings?country=India&state=${encodeURIComponent(place.state)}${place.name === place.state ? '' : `&city=${encodeURIComponent(place.name)}`}`} className={`gf-city-tile gf-city-tile-${index + 1}`}>
              <img src={place.image} alt={`${place.name}, India`} loading="lazy" />
              <div className="gf-city-shade" />
              <div className="gf-city-copy"><span>{place.state}</span><h3>{place.name}</h3><p>{place.note}</p></div>
              <ArrowUpRight size={18} className="gf-city-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="gf-featured-section" aria-labelledby="featured-heading">
        <div className="container">
          <div className="gf-section-heading">
            <div><span className="gf-eyebrow">The GharFind edit</span><h2 id="featured-heading">Homes worth a closer look.</h2></div>
            <Link to="/listings?country=India" className="gf-text-link">View all homes <ArrowRight size={17} /></Link>
          </div>
          {loadingHomes ? <div className="gf-home-grid">{Array.from({ length: 3 }, (_, index) => <div key={index} className="gf-home-skeleton" />)}</div> : <div className="gf-home-grid">{featuredHomes.map((property) => <PropertyCard key={property._id || property.id} property={property} />)}</div>}
        </div>
      </section>

      <section className="gf-service-section container" aria-label="GharFind service">
        <div className="gf-service-lead"><span className="gf-eyebrow">A little more human</span><h2>Good property decisions start with good people.</h2><Link to="/listings?country=India" className="gf-dark-link">Start exploring <ArrowRight size={17} /></Link></div>
        <div className="gf-service-notes">{featureNotes.map(({ icon: Icon, title, description }, index) => <article key={title} className="gf-service-note"><span className="gf-note-number">0{index + 1}</span><Icon size={21} /><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </section>
    </div>
  );
}