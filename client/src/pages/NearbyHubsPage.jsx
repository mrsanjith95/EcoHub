import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import { Factory, MapPin, Phone, Filter, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

const CATEGORIES = ['All', 'Organic', 'Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste', 'Mixed Waste'];

export default function NearbyHubsPage() {
  const [hubs, setHubs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userLat, setUserLat] = useState('28.6289'); // Delhi
  const [userLng, setUserLng] = useState('77.2185'); // Delhi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHubs();
  }, [categoryFilter, userLat, userLng]);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const categoryParam = categoryFilter !== 'All' ? categoryFilter : '';
      const res = await api.get(`/hubs/nearby?lat=${userLat}&lng=${userLng}&category=${categoryParam}`);
      setHubs(res.data.hubs || []);
    } catch (err) {
      console.error('Failed to fetch nearby hubs:', err);
      setError('Could not load processing hubs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Header */}
      <RevealSection>
        <div style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: '2rem' }}>
          <div className="editorial-eyebrow">
            <Sparkles size={14} /> DELHI FACILITY NETWORK
          </div>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
            Processing Facilities
          </h1>
          <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
            Verified recycling and recovery centers matched dynamically by Haversine distance and capacity.
          </p>
        </div>
      </RevealSection>

      {/* Category Filter Pills */}
      <RevealSection delay={100}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Filter Category:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn-apple ${categoryFilter === cat ? 'btn-apple-primary' : 'btn-apple-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.825rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Facilities Network Cards */}
      <RevealSection delay={200}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Searching nearby Delhi processing hubs...</p>
        ) : error ? (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
        ) : hubs.length === 0 ? (
          <div className="apple-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <ShieldAlert size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.25rem' }}>No Hubs Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active processing hubs accepting category '{categoryFilter}' were found nearby.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {hubs.map((hub, idx) => {
              const isNearest = idx === 0;
              return (
                <div
                  key={hub._id || hub.id}
                  className="apple-card apple-card-hover"
                  style={{
                    border: isNearest ? '1px solid var(--border-emerald)' : '1px solid var(--border-medium)',
                    background: isNearest ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.4) 0%, #ffffff 100%)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                  }}
                >
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-dark)' }}>{hub.name}</h3>
                      {isNearest && (
                        <span className="badge-pill badge-pill-completed" style={{ fontSize: '0.72rem' }}>
                          ★ NEAREST MATCH
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      <MapPin size={16} />
                      <span>{hub.distanceKm !== undefined ? `${hub.distanceKm} km from Connaught Place` : 'Nearby Delhi'}</span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {hub.address}
                    </p>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {hub.acceptedCategories?.map((c) => (
                        <span key={c} className="badge-pill badge-pill-accepted" style={{ fontSize: '0.75rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Capacity</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-dark)' }}>{hub.capacityKgPerDay} kg/day</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Phone size={15} color="var(--primary-600)" />
                      <span>Phone: <strong>{hub.contactPhone || 'N/A'}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RevealSection>
    </div>
  );
}
