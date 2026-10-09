import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import StatusBadge from '../components/StatusBadge';
import { formatCategoryTitle } from '../components/CategoryBadge';
import { Clock, Factory, MapPin, CheckCircle2, ArrowLeft, XCircle, FileText, AlertTriangle, Sparkles, ImageOff, User, Mail, Phone, Maximize2, X } from 'lucide-react';

const STATUS_STEPS = [
  'Report Created',
  'Hub Matched',
  'Collector Accepted',
  'Waste Collected',
  'Delivered to Hub',
  'Processing',
  'Completed'
];

export default function PickupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setImgError(false);
      const res = await api.get(`/waste/reports/${id}`);
      setReport(res.data.report);
    } catch (err) {
      console.error('Failed to load report details:', err);
      setError('Could not load waste report details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async () => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return;
    try {
      setUpdating(true);
      await api.patch(`/waste/reports/${id}/status`, {
        status: 'Cancelled',
        note: 'Pickup request cancelled by waste generator',
      });
      fetchReportDetails();
    } catch (err) {
      alert('Failed to cancel request: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const hub = typeof report?.assignedHubId === 'object' && report?.assignedHubId !== null
    ? report.assignedHubId
    : (typeof report?.assignedHub === 'object' && report?.assignedHub !== null ? report.assignedHub : null);

  const genObj = typeof report?.generatorId === 'object' && report?.generatorId !== null
    ? report.generatorId
    : (typeof report?.generator === 'object' && report?.generator !== null ? report.generator : null);

  const genName = genObj?.name || 'Waste Generator';
  const genEmail = genObj?.email || 'N/A';
  const genPhone = genObj?.phone || 'N/A';

  // Extract physical pickup address safely without falling back to email addresses
  const rawAddress = 
    (typeof report?.pickupLocation === 'object' && report?.pickupLocation !== null ? report.pickupLocation.address : report?.pickupLocation) ||
    report?.pickupAddress ||
    report?.address ||
    genObj?.address;

  const isEmailString = typeof rawAddress === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawAddress.trim());
  const displayPickupAddress = (!rawAddress || isEmailString) ? 'Address not provided' : rawAddress;

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    switch (status) {
      case 'Pending':
        return hub ? 1 : 0;
      case 'Accepted':
        return 2;
      case 'Collected':
        return 3;
      case 'Delivered':
        return 4;
      case 'Processing':
        return 5;
      case 'Completed':
        return 6;
      default:
        return 0;
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading report timeline...</div>;
  }

  if (error || !report) {
    return (
      <div className="apple-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertTriangle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.5rem' }}>Report Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'The requested pickup report could not be located.'}</p>
        <Link to="/pickup-requests" className="btn-apple btn-apple-secondary">
          <ArrowLeft size={16} /> Back to Requests
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(report.status);

  return (
    <div style={{ maxWidth: '960px', margin: '1rem auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <Link to="/pickup-requests" className="btn-apple btn-apple-ghost" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Requests
        </Link>
      </div>

      {/* Header Banner */}
      <RevealSection>
        <div className="apple-card" style={{ padding: '2.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div className="editorial-eyebrow">
                <Sparkles size={14} /> REPORT ID: {report._id || report.id}
              </div>
              <h1 className="editorial-title" style={{ fontSize: '2.25rem' }}>
                {formatCategoryTitle(report.category, report.quantityKg)}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Logged on {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <StatusBadge status={report.status} />
              {report.status === 'Pending' && (
                <button onClick={handleCancelReport} disabled={updating} className="btn-apple btn-apple-secondary" style={{ color: '#dc2626', borderColor: '#fecaca' }}>
                  <XCircle size={16} /> Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 7-Stage Responsive Progress Tracker */}
      <RevealSection delay={100}>
        <div className="apple-card">
          <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary-600)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> 7-STAGE RECOVERY TIMELINE TRACKER
          </div>

          {report.status === 'Cancelled' ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: '#991b1b', textAlign: 'center', fontWeight: 600 }}>
              This waste pickup request has been Cancelled.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUS_STEPS.length}, 1fr)`, gap: '0.35rem', position: 'relative' }}>
              {STATUS_STEPS.map((stepName, idx) => {
                const isDone = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={stepName} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDone ? 'var(--primary-600)' : 'var(--bg-subtle)',
                        color: isDone ? '#ffffff' : 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        boxShadow: isCurrent ? '0 0 0 4px var(--primary-100)' : 'none',
                        transition: 'all var(--transition-smooth)',
                      }}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : isDone ? 700 : 500, color: isCurrent ? 'var(--primary-700)' : isDone ? 'var(--text-primary)' : 'var(--text-light)', lineHeight: 1.2 }}>
                      {stepName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RevealSection>

      {/* Details Grid */}
      <RevealSection delay={200}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Waste Specifications Card */}
          <div className="apple-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--primary-600)" /> Waste Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Category & Waste Streams</span>
                <div style={{ fontWeight: 800, color: 'var(--forest-dark)' }}>{report.category}</div>
                {report.items && report.items.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {report.items.map((item, idx) => (
                      <span key={idx} style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--border-light)' }}>
                        {item.category}: {item.quantityKg} kg
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Total Weight</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontSize: '1.1rem' }}>{report.quantityKg} kg</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Description</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{report.description || 'No additional notes.'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Pickup Street Address</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <MapPin size={16} color="var(--primary-600)" />
                  <span>{displayPickupAddress}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Photo Proof (Amazon S3)</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {report.imageUrl && !imgError ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div
                        onClick={() => setShowImageModal(true)}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          maxHeight: '200px',
                          background: 'var(--bg-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={report.imageUrl}
                          alt="Waste Photo Proof"
                          onError={() => setImgError(true)}
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="btn-apple btn-apple-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Maximize2 size={13} /> View Full Photo Proof
                      </button>
                    </div>
                  ) : imgError ? (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageOff size={16} />
                      <span>Unable to load uploaded photo proof</span>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageOff size={16} />
                      <span>No photo proof uploaded for this report</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generator Information Card */}
          <div className="apple-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary-600)" /> Generator Contact Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Full Name</span>
                <div style={{ fontWeight: 800, color: 'var(--forest-dark)', fontSize: '1.05rem', marginTop: '0.1rem' }}>{genName}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Contact Email</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <Mail size={15} color="var(--primary-600)" />
                  <span>{genEmail}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Contact Phone</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <Phone size={15} color="var(--primary-600)" />
                  <span>{genPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Processing Facility Card */}
          <div className="apple-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Factory size={18} color="var(--primary-600)" /> Destination Processing Facility
            </h3>

            {hub ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Facility Name</span>
                  <div style={{ fontWeight: 800, color: 'var(--forest-dark)', fontSize: '1.05rem', marginTop: '0.1rem' }}>{hub.name}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Delhi Facility Address</span>
                  <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{hub.address}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Contact Phone</span>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.15rem' }}>{hub.contactPhone || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                No processing hub assigned yet
              </div>
            )}
          </div>
        </div>
      </RevealSection>

      {/* Full-Resolution Lightbox Modal */}
      {showImageModal && report?.imageUrl && (
        <div
          onClick={() => setShowImageModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest-dark)' }}>
                Full-Resolution Photo Proof • Report #{report._id || report.id}
              </span>
              <button
                onClick={() => setShowImageModal(false)}
                className="btn-apple btn-apple-ghost"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', background: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={report.imageUrl}
                alt="Full Resolution Waste Proof"
                style={{ maxWidth: '85vw', maxHeight: '75vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
