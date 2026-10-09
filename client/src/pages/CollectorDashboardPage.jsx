import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import CategoryBadge, { formatCategoryTitle } from '../components/CategoryBadge';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Truck, CheckCircle2, Clock, MapPin, Factory, ArrowRight, Sparkles, PackageCheck } from 'lucide-react';

export default function CollectorDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCollectorJobs();
  }, []);

  const fetchCollectorJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/collector/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load collector jobs:', err);
      setError('Could not load pickup jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus, note) => {
    try {
      setUpdatingId(reportId);
      await api.patch(`/waste/reports/${reportId}/status`, {
        status: newStatus,
        note: note || `Status updated by Collector to ${newStatus}`,
      });
      fetchCollectorJobs();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredJobs = statusFilter === 'All'
    ? jobs
    : jobs.filter((j) => j.status === statusFilter);

  const pendingCount = jobs.filter((j) => j.status === 'Pending').length;
  const acceptedCount = jobs.filter((j) => j.status === 'Accepted').length;
  const collectedCount = jobs.filter((j) => j.status === 'Collected').length;
  const deliveredCount = jobs.filter((j) => j.status === 'Delivered').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Header */}
      <RevealSection>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <div className="editorial-eyebrow">
            <Sparkles size={14} /> DISPATCH PORTAL
          </div>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
            "Your next pickup is ready."
          </h1>
          <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
            Logged in as <strong>{user?.name || 'Collector'}</strong>. Manage waste pickup dispatches in Delhi.
          </p>
        </div>
      </RevealSection>

      {/* Summary Cards */}
      <RevealSection delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard
            number={pendingCount}
            label="AVAILABLE OPEN PICKUPS"
            icon={Clock}
            color="#d97706"
            description="Open requests in Delhi needing assignment"
          />
          <StatCard
            number={acceptedCount}
            label="ACCEPTED JOBS"
            icon={Truck}
            color="#0284c7"
            description="Jobs accepted & queued for pickup"
          />
          <StatCard
            number={collectedCount}
            label="COLLECTED IN TRANSIT"
            icon={PackageCheck}
            color="#059669"
            description="Picked up & in transit to hub"
          />
          <StatCard
            number={deliveredCount}
            label="DELIVERED TO HUB"
            icon={CheckCircle2}
            color="#059669"
            description="Delivered to destination facility"
          />
        </div>
      </RevealSection>

      {/* Jobs Dispatch List */}
      <RevealSection delay={200}>
        <div className="apple-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                Pickup Dispatch Queue
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Accept open jobs, collect waste, and deliver to assigned processing hubs
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Accepted', 'Collected', 'Delivered'].map((st) => (
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
            <p style={{ color: 'var(--text-muted)', padding: '3rem 0', textAlign: 'center' }}>Loading pickup jobs queue...</p>
          ) : error ? (
            <div style={{ color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.25rem' }}>No Jobs Available</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pickup jobs match filter status '{statusFilter}'.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredJobs.map((j) => {
                const id = j._id || j.id;
                const hubName = j.assignedHubId?.name || j.assignedHub?.name || 'Unassigned';
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 320px' }}>
                      <CategoryBadge category={j.category} items={j.items} size={48} />
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                          {formatCategoryTitle(j.category, j.quantityKg)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <MapPin size={14} color="var(--primary-600)" />
                          <span>{j.pickupLocation?.address}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                          <Factory size={13} color="#0284c7" />
                          <span>Destination: {hubName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <StatusBadge status={j.status} />

                      {/* Prominent Action Buttons */}
                      {j.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(id, 'Accepted', 'Collector accepted pickup job')}
                          disabled={updatingId === id}
                          className="btn-apple btn-apple-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          Accept Pickup
                        </button>
                      )}

                      {j.status === 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(id, 'Collected', 'Waste collected from generator address')}
                          disabled={updatingId === id}
                          className="btn-apple btn-apple-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#0284c7' }}
                        >
                          Mark Collected
                        </button>
                      )}

                      {j.status === 'Collected' && (
                        <button
                          onClick={() => handleUpdateStatus(id, 'Delivered', 'Waste delivered to assigned processing hub')}
                          disabled={updatingId === id}
                          className="btn-apple btn-apple-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'var(--primary-700)' }}
                        >
                          Mark Delivered
                        </button>
                      )}

                      <Link to={`/pickup-details/${id}`} className="btn-apple btn-apple-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                        Details
                      </Link>
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
