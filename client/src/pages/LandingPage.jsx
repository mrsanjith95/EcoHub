import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import StatCard from '../components/StatCard';
import { Leaf, ArrowRight, ShieldCheck, MapPin, Factory, Truck, Award, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalProcessedKg: 30,
    totalLandfillDivertedKg: 30,
    activeHubs: 4,
    nearestMatchKm: 7.9,
  });

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      const res = await api.get('/impact/stats');
      if (res.data) {
        setStats((prev) => ({
          ...prev,
          totalProcessedKg: res.data.totalProcessedKg || 30,
          totalLandfillDivertedKg: res.data.totalLandfillDivertedKg || 30,
        }));
      }
    } catch (err) {
      console.log('Impact stats load fallback:', err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', overflow: 'hidden' }}>
      {/* SECTION 1 — HERO */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '2rem 1rem 3rem' }}>
        {/* Subtle Ambient Glow Effect */}
        <div
          className="ambient-glow-circle"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
            top: '-50px',
            left: 'calc(50% - 250px)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <RevealSection delay={100}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(5, 150, 105, 0.08)',
                color: 'var(--primary-700)',
                padding: '0.4rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '2rem',
                border: '1px solid rgba(5, 150, 105, 0.15)',
              }}
            >
              <Sparkles size={14} /> WE MAKE DEVS × ENVIRONMENTAL HACKS 2026
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.75rem)', marginBottom: '1.75rem' }}>
              LOCAL WASTE.<br />
              <span style={{ color: 'var(--primary-600)' }}>PROCESSED LOCALLY.</span>
            </h1>
          </RevealSection>

          <RevealSection delay={300}>
            <p className="editorial-subtitle" style={{ margin: '0 auto 2.5rem', fontSize: '1.25rem' }}>
              EcoHub connects waste generators with nearby specialized processing hubs, reducing unnecessary transportation emissions and keeping recyclable mass out of landfills.
            </p>
          </RevealSection>

          <RevealSection delay={400}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/report-waste" className="btn-apple btn-apple-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Report Waste <ArrowRight size={18} />
              </Link>
              <Link to="/nearby-hubs" className="btn-apple btn-apple-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Explore EcoHub Network
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* SECTION 2 — SCROLL PRODUCT STORY */}
      <RevealSection>
        <section style={{ maxWidth: '1050px', margin: '0 auto', textAlign: 'center' }}>
          <div className="editorial-eyebrow" style={{ justifyContent: 'center' }}>
            <RefreshCw size={14} /> THE PROBLEM & SOLUTION
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--forest-dark)', marginBottom: '1.5rem' }}>
            "Waste shouldn't travel farther than it needs to."
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Traditional collection routes haul mixed waste tens of kilometers across cities without considering local recycling capability. EcoHub creates localized circular links.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {[
              { num: '01', title: 'Report', desc: 'Generator logs category, weight in kg, and Delhi location.' },
              { num: '02', title: 'Match', desc: 'Haversine algorithm matches the closest active Delhi hub.' },
              { num: '03', title: 'Collect', desc: 'Dispatch collector accepts pickup and delivers to hub.' },
              { num: '04', title: 'Process', desc: 'Hub records Recycling, Composting, or Recovery.' },
              { num: '05', title: 'Measure', desc: 'Verifiable landfill diversion stats feed real impact.' },
            ].map((step, idx) => (
              <div key={step.num} className="apple-card" style={{ background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: '0.75rem' }}>
                  STEP {step.num}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* SECTION 3 — ECOHUB NETWORK SECTION */}
      <RevealSection>
        <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="editorial-eyebrow" style={{ justifyContent: 'center' }}>
              <Layers size={14} /> CATEGORY MATRIX
            </div>
            <h2 className="editorial-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
              YOUR WASTE.<br />
              <span style={{ color: 'var(--primary-600)' }}>THE RIGHT PLACE. THE RIGHT PROCESS.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: 'Organic',
                hub: 'GreenCycle Organic Composting',
                location: 'Okhla, Delhi',
                badge: 'Composting & Fertilizer',
                color: '#059669',
              },
              {
                title: 'Plastic',
                hub: 'EcoPlast Polymer Recycling',
                location: 'Naraina, Delhi',
                badge: 'PET Granulation & Pellets',
                color: '#0284c7',
              },
              {
                title: 'E-Waste',
                hub: 'CircuitSafe Tech Recovery',
                location: 'Wazirpur, Delhi',
                badge: 'Component & Precious Metal',
                color: '#d97706',
              },
              {
                title: 'Glass & Metal',
                hub: 'ClearGlass Material Recovery',
                location: 'Mayapuri, Delhi',
                badge: 'Cullet Melting & Scrap Recovery',
                color: '#7e22ce',
              },
            ].map((cat) => (
              <div key={cat.title} className="apple-card apple-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontWeight: 800, marginBottom: '1.25rem' }}>
                    <Factory size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.4rem' }}>
                    {cat.title}
                  </h3>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {cat.hub}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {cat.location}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-medium)' }}>
                  <span className="badge-pill" style={{ background: `${cat.color}10`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                    {cat.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* SECTION 4 — IMPACT METRICS SECTION */}
      <RevealSection>
        <section style={{ background: 'var(--forest-dark)', color: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="editorial-eyebrow" style={{ color: 'var(--primary-400)', justifyContent: 'center' }}>
                <Award size={14} /> VERIFIABLE LANDFILL DIVERSION
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                MEASURED ENVIRONMENTAL IMPACT
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {stats.totalProcessedKg} <span style={{ fontSize: '1.5rem', color: 'var(--primary-400)' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  WASTE PROCESSED
                </div>
              </div>

              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-400)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {stats.totalLandfillDivertedKg} <span style={{ fontSize: '1.5rem', color: '#ffffff' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  LANDFILL DIVERTED
                </div>
              </div>

              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {stats.activeHubs}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  DELHI PROCESSING HUBS
                </div>
              </div>

              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {stats.nearestMatchKm} <span style={{ fontSize: '1.5rem', color: 'var(--primary-400)' }}>km</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  NEAREST MATCH DISTANCE
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
