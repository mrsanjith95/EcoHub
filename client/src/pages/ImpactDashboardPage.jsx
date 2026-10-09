import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import StatCard from '../components/StatCard';
import { Leaf, BarChart3, Recycle, CheckCircle2, Award, Sparkles, ShieldAlert, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#059669', '#0284c7', '#d97706', '#7e22ce', '#ec4899', '#f59e0b', '#64748b'];

export default function ImpactDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/impact/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch impact stats:', err);
      setError('Could not load environmental impact metrics');
    } finally {
      setLoading(false);
    }
  };

  const hasData = stats && (stats.totalProcessedKg > 0 || stats.totalCollectedKg > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Header */}
      <RevealSection>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <div className="editorial-eyebrow">
            <Sparkles size={14} /> CLIMATE ANALYTICS
          </div>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>
            "Every kilogram has an impact."
          </h1>
          <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
            Verifiable environmental impact statistics calculated directly from database records.
          </p>
        </div>
      </RevealSection>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>Calculating network environmental impact statistics...</p>
      ) : error ? (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
      ) : !hasData ? (
        <div className="apple-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <BarChart3 size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.25rem' }}>No Impact Data Logged Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Metrics are updated dynamically as local hubs record processed shipments.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <RevealSection delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <StatCard
                number={stats.totalCollectedKg}
                unit="kg"
                label="TOTAL COLLECTED"
                icon={Leaf}
                color="#059669"
                description="Total waste mass collected from generators"
              />
              <StatCard
                number={stats.totalProcessedKg}
                unit="kg"
                label="TOTAL PROCESSED"
                icon={Recycle}
                color="#0284c7"
                description="Verified processed mass by facilities"
              />
              <StatCard
                number={stats.totalRecycledKg}
                unit="kg"
                label="RECYCLED MASS"
                icon={CheckCircle2}
                color="#059669"
                description="Reprocessed into new raw materials"
              />
              <StatCard
                number={stats.totalCompostedKg}
                unit="kg"
                label="COMPOSTED ORGANICS"
                icon={Award}
                color="#d97706"
                description="Converted into organic compost soil"
              />
              <StatCard
                number={stats.totalRecoveredKg}
                unit="kg"
                label="RECOVERED MASS"
                icon={Layers}
                color="#7e22ce"
                description="Recovered materials & components"
              />
              <StatCard
                number={stats.totalLandfillDivertedKg}
                unit="kg"
                label="LANDFILL DIVERTED"
                icon={CheckCircle2}
                color="#059669"
                description="Total mass prevented from landfill dumping"
              />
            </div>
          </RevealSection>

          {/* Minimal Elegant Recharts */}
          <RevealSection delay={200}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {/* Category Breakdown Bar Chart */}
              <div className="apple-card">
                <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary-600)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarChart3 size={16} /> WASTE CATEGORY MASS BREAKDOWN (KG)
                </div>
                {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.categoryBreakdown}>
                        <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip formatter={(value) => [`${value} kg`, 'Mass']} />
                        <Bar dataKey="quantityKg" fill="var(--primary-600)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No category breakdown available.</p>
                )}
              </div>

              {/* Processing Method Outcomes Pie Chart */}
              <div className="apple-card">
                <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0284c7', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Recycle size={16} /> RECOVERY METHOD DISTRIBUTION (KG)
                </div>
                {stats.processingBreakdown && stats.processingBreakdown.length > 0 ? (
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.processingBreakdown}
                          dataKey="quantityKg"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={4}
                          label={({ method, quantityKg }) => `${method}: ${quantityKg}kg`}
                        >
                          {stats.processingBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} kg`, 'Mass']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No method outcomes recorded.</p>
                )}
              </div>
            </div>
          </RevealSection>
        </>
      )}
    </div>
  );
}
