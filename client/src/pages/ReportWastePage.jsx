import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import { Leaf, PlusCircle, MapPin, Factory, AlertTriangle, CheckCircle2, Upload, Navigation, ArrowRight, ShieldCheck, Sparkles, Scale, Check, Info } from 'lucide-react';

const CATEGORIES = [
  { id: 'Organic', desc: 'Food waste, compostable organics', icon: '🌱' },
  { id: 'Plastic', desc: 'PET bottles, rigid containers, scrap', icon: '🥤' },
  { id: 'Paper', desc: 'Cardboard, packaging, paper scrap', icon: '📦' },
  { id: 'Glass', desc: 'Glass bottles, intact glassware', icon: '🍾' },
  { id: 'Metal', desc: 'Aluminum cans, scrap metal, tins', icon: '🥫' },
  { id: 'E-Waste', desc: 'Electronics, batteries, computer scrap', icon: '💻' },
  { id: 'Mixed Waste', desc: 'Unsegregated multi-material stream', icon: '♻️' },
];

export default function ReportWastePage() {
  const { user } = useAuth();

  // Selected categories state: map of categoryId => quantity string (e.g. { Plastic: '10.0', Paper: '5.0' })
  const [selectedQuantities, setSelectedQuantities] = useState({ Plastic: '15.0' });
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('28.6289');
  const [longitude, setLongitude] = useState('77.2185');
  const [imageFile, setImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  // Pre-fill location from logged-in user profile on mount
  useEffect(() => {
    if (user) {
      if (user.address && !address) {
        setAddress(user.address);
      } else if (!address) {
        setAddress('Connaught Place, Central Delhi, New Delhi 110001, India');
      }

      if (user.location?.latitude && user.location?.longitude) {
        setLatitude(String(user.location.latitude));
        setLongitude(String(user.location.longitude));
      }
    } else if (!address) {
      setAddress('Connaught Place, Central Delhi, New Delhi 110001, India');
    }
  }, [user]);

  // Handle category card toggle
  const toggleCategory = (catId) => {
    setErrorMsg(null);
    setSelectedQuantities((prev) => {
      const next = { ...prev };
      if (catId === 'Mixed Waste') {
        // Mixed Waste is mutually exclusive with individual categories
        if (next['Mixed Waste']) {
          delete next['Mixed Waste'];
        } else {
          return { 'Mixed Waste': '10.0' };
        }
      } else {
        // Individual category selected: remove Mixed Waste if present
        delete next['Mixed Waste'];
        if (next[catId] !== undefined) {
          delete next[catId];
        } else {
          next[catId] = '10.0'; // Default initial quantity
        }
      }
      return next;
    });
  };

  // Keyboard accessibility for tile toggle
  const handleKeyDownTile = (e, catId) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleCategory(catId);
    }
  };

  // Handle category quantity change
  const handleQuantityChange = (catId, val) => {
    setErrorMsg(null);
    setSelectedQuantities((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  // Compute total quantity in kg
  const totalQuantityKg = Object.values(selectedQuantities).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) || num < 0 ? 0 : num);
  }, 0);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not access location. Saved coordinates retained.');
      }
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const activeCatIds = Object.keys(selectedQuantities);

    // Validation 1: At least 1 category required
    if (activeCatIds.length === 0) {
      setErrorMsg('Please select at least one waste category.');
      return;
    }

    // Validation 2: Quantity validation for each category
    const items = [];
    for (const catId of activeCatIds) {
      const weight = parseFloat(selectedQuantities[catId]);
      if (isNaN(weight) || weight <= 0) {
        setErrorMsg(`Please enter a valid weight in kg for category '${catId}' (must be greater than 0).`);
        return;
      }
      items.push({ category: catId, quantityKg: weight });
    }

    // Validation 3: Address & Coordinates required
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!address || isNaN(lat) || isNaN(lng)) {
      setErrorMsg('Please enter a valid pickup address and location coordinates.');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('address', address);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/waste/reports', formData);
      setResult(response.data);
    } catch (err) {
      console.error('Report submission error:', err);
      const msg = err.response?.data?.error || 'Failed to submit waste report';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '1rem auto' }}>
      <RevealSection>
        {result ? (
          /* Post-submission Confirmation View */
          <div className="apple-card" style={{ padding: '2.5rem 2rem', border: '1.5px solid var(--border-emerald)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <div className="editorial-eyebrow" style={{ justifyContent: 'center' }}>
                <ShieldCheck size={14} /> REPORT CONFIRMED
              </div>
              <h2 className="editorial-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
                "Your waste has a destination."
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', maxWidth: '540px', margin: '0 auto' }}>
                {result.message}
              </p>
            </div>

            {/* Summary Details Grid */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2rem', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-medium)' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Report ID</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {result.report?._id || result.report?.id}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Mass</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.25rem' }}>
                    {result.report?.quantityKg} kg Total
                  </div>
                </div>
              </div>

              {/* Categories Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Selected Waste Streams
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(result.report?.items || []).map((item, idx) => (
                    <span key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-medium)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.category}: <span style={{ color: 'var(--primary-600)' }}>{item.quantityKg} kg</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Hub Info */}
              {result.matchedHub ? (
                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--primary-600)', marginBottom: '0.75rem' }}>
                    <Factory size={15} /> MATCHED PROCESSING HUB
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {result.matchedHub.name} ({result.distanceKm} km away)
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {result.matchedHub.address}
                  </div>
                </div>
              ) : (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-medium)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Assigned to Delhi Regional Processing Network (Hub assignment in progress)
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/pickup-details/${result.report._id || result.report.id}`} className="btn-apple btn-apple-primary" style={{ flex: 1, padding: '0.85rem', textAlign: 'center' }}>
                Track Pickup Progress <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedQuantities({ Plastic: '15.0' });
                  setImageFile(null);
                }}
                className="btn-apple btn-apple-secondary"
                style={{ padding: '0.85rem 1.5rem' }}
              >
                Report More Waste
              </button>
            </div>
          </div>
        ) : (
          /* Apple Store–Inspired Compact Form View */
          <div className="apple-card" style={{ padding: '2.25rem 2rem' }}>
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1.25rem' }}>
              <div className="editorial-eyebrow">
                <Sparkles size={14} /> DIRECTORY DISPATCH
              </div>
              <h2 className="editorial-title" style={{ fontSize: '2.25rem' }}>
                Report Local Waste
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Select categories, enter estimated weights, and match nearby Delhi processing hubs.
              </p>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* SECTION 1: Select Waste Categories & Quantities */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    1. Select Waste Categories & Quantities (kg) *
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-emerald)' }}>
                    Total Mass: {totalQuantityKg.toFixed(1)} kg
                  </span>
                </div>

                {/* Premium Selectable Tile Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedQuantities[cat.id] !== undefined;
                    return (
                      <div
                        key={cat.id}
                        role="button"
                        tabIndex={0}
                        aria-checked={isSelected}
                        onClick={() => toggleCategory(cat.id)}
                        onKeyDown={(e) => handleKeyDownTile(e, cat.id)}
                        className={`category-tile ${isSelected ? 'selected' : ''}`}
                      >
                        <div>
                          <div className="category-tile-header">
                            <div className="category-icon-wrapper">{cat.icon}</div>
                            <div className="category-badge-check">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            {cat.id}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.25 }}>
                            {cat.desc}
                          </div>
                        </div>

                        {/* Inline Quantity Input when tile selected */}
                        {isSelected && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-medium)' }}
                          >
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '0.25rem' }}>
                              Quantity (kg):
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={selectedQuantities[cat.id]}
                              onChange={(e) => handleQuantityChange(cat.id, e.target.value)}
                              placeholder="e.g. 10.0"
                              required
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-medium)',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                background: '#ffffff',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Pickup Location & Address */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    2. Pickup Location & Address *
                  </label>
                  <button type="button" onClick={handleUseMyLocation} className="btn-apple btn-apple-ghost" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}>
                    <Navigation size={13} /> Use My Location
                  </button>
                </div>

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address in Delhi NCR"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.925rem', marginBottom: '0.75rem' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latitude (Geocode)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Longitude (Geocode)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Optional Photo Proof & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Notes / Access Details <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Gate entry instructions, bagged scrap..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Photo Proof (AWS S3) <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
                  </label>
                  <div
                    style={{
                      border: '1.5px dashed var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      textAlign: 'center',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <Upload size={22} color="var(--primary-600)" style={{ margin: '0 auto 0.35rem' }} />
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {imageFile ? imageFile.name : 'Choose optional photo proof'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0] || null)}
                      style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Dispatch Action */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-apple btn-apple-primary"
                style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 800, marginTop: '0.5rem' }}
              >
                {submitting ? 'Matching Nearest Processing Hub...' : 'SUBMIT REPORT & MATCH HUB →'}
              </button>
            </form>
          </div>
        )}
      </RevealSection>
    </div>
  );
}
