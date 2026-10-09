import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import CategoryBadge, { formatCategoryTitle } from '../components/CategoryBadge';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Factory, PackageCheck, Clock, CheckCircle2, ArrowRight, Activity, Recycle, Sparkles } from 'lucide-react';

export default function HubDashboardPage() {
  const { user } = useAuth();
  const [hub, setHub] = useState(null);
  const [incomingReports, setIncomingReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hubId = user?.hubId || 'hub-demo-2'; // Default to EcoPlast in Delhi

  useEffect(() => {
    fetchHubData();
  }, [hubId]);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      const hubRes = await api.get(`/hubs/${hubId}`);
      setHub(hubRes.data.hub);

      const reportsRes = await api.get(`/hubs/${hubId}/incoming`);
      setIncomingReports(reportsRes.data.reports || []);
    } catch (err) {
      console.error('Failed to load hub dashboard data:', err);
      setError('Could not load processing hub dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/waste/reports/${reportId}/status`, {
        status: newStatus,
        note: `Status updated by Hub Operator to ${newStatus}`,
      });
      fetchHubData();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredReports = statusFilter === 'All'
    ? incomingReports
    : incomingReports.filter((r) => r.status === statusFilter);

  const totalIncoming = incomingReports.length;
  const completedCount = incomingReports.filter((r) => r.status === 'Completed').length;
  const capacity = hub?.capacityKgPerDay || 1800;
  const currentStock = hub?.currentStockKg || 520;
  const availableCapacity = Math.max(0, capacity - currentStock);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Facility Header */}
      <RevealSection>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <div className="editorial-eyebrow">
            <Sparkles size={14} /> FACILITY OPERATIONS PORTAL
          </div>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
            {hub?.name || 'Processing Hub Operations'}
          </h1>
          <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
            Facility Location: {hub?.address || 'Delhi, India'} | Facility Operator: <strong>{user?.name}</strong>
          </p>
        </div>
      </RevealSection>

      {/* Industrial Overview Cards */}
      <RevealSection delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard
            number={capacity}
            unit="kg/day"
            label="DAILY PROCESSING CAPACITY"
            icon={Factory}
            color="#059669"
            description={`Available capacity: ${availableCapacity} kg/day`}
          />
          <StatCard
            number={currentStock}
            unit="kg"
            label="CURRENT UTILIZED STOCK"
            icon={Activity}
            color="#d97706"
            description="Active inventory stock in facility"
          />
          <StatCard
            number={totalIncoming}
            label="ASSIGNED SHIPMENTS"
            icon={PackageCheck}
            color="#0284c7"
            description="Total routed Delhi waste dispatches"
          />
          <StatCard
            number={completedCount}
            label="COMPLETED RECYCLED"
            icon={CheckCircle2}
            color="#059669"
            description="Verified recycled & diverted mass"
          />
        </div>
      </RevealSection>

      {/* Incoming Waste Shipments List */}
      <RevealSection delay={200}>
        <div className="apple-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                Incoming Waste Shipments
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Inspect delivered shipments and log recycling outcome statistics
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Accepted', 'Delivered', 'Processing', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn-apple ${statusFilter === st ? 'btn-apple-primary' : 'btn-apple-secondary'}`}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '3rem 0', textAlign: 'center' }}>Loading incoming shipments...</p>
          ) : error ? (
            <div style={{ color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
          ) : filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <PackageCheck size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.25rem' }}>No Shipments Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No waste reports match filter status '{statusFilter}'.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReports.map((r) => {
                const id = r._id || r.id;
                const genName = r.generatorId?.name || r.generator?.name || 'Waste Generator';
                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 300px' }}>
                      <CategoryBadge category={r.category} items={r.items} size={48} />
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                          {formatCategoryTitle(r.category, r.quantityKg)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Generator: {genName} • Pickup: {r.pickupLocation?.address}
                        </div>
                        {r.items && r.items.length > 1 && (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                            {r.items.map((it, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.725rem',
                                  fontWeight: 600,
                                  background: '#ffffff',
                                  border: '1px solid var(--border-light)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '20px',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {it.category}: <strong>{it.quantityKg} kg</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem', fontWeight: 600, background: '#ffffff' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Collected">Collected</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {r.status === 'Completed' ? (
                        <span style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={16} /> Processed
                        </span>
                      ) : (
                        <Link to={`/processing/${id}`} className="btn-apple btn-apple-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}>
                          <Recycle size={15} /> Process Waste
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RevealSection>
    </div>
  );
}
