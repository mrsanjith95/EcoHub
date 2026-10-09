import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import CategoryBadge, { formatCategoryTitle, getShipmentClassification } from '../components/CategoryBadge';
import { Recycle, ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Layers } from 'lucide-react';

const PROCESSING_METHODS = ['Recycled', 'Composted', 'Recovered', 'Sent for further treatment'];

export default function ProcessingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState('Organic');
  const [inputQuantityKg, setInputQuantityKg] = useState('');
  const [processedQuantityKg, setProcessedQuantityKg] = useState('');
  const [processingMethod, setProcessingMethod] = useState('Recycled');
  const [recycledQuantityKg, setRecycledQuantityKg] = useState('0');
  const [compostedQuantityKg, setCompostedQuantityKg] = useState('0');
  const [recoveredQuantityKg, setRecoveredQuantityKg] = useState('0');
  const [landfillDivertedKg, setLandfillDivertedKg] = useState('0');
  const [notes, setNotes] = useState('');

  const userHubId = user?.hubId || 'hub-demo-2';

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/waste/reports/${id}`);
      const r = res.data.report;
      setReport(r);

      const totalWeight = r.quantityKg ? String(r.quantityKg) : '10';
      setCategory(r.category || 'Organic');
      setInputQuantityKg(totalWeight);
      setProcessedQuantityKg(totalWeight);
      setLandfillDivertedKg(totalWeight);

      // Category-based method initialization
      const isMulti = (r.items && r.items.length > 1) || (r.category && r.category.includes(','));
      if (isMulti) {
        setProcessingMethod('Recycled');
        setRecycledQuantityKg(totalWeight);
      } else if (r.category === 'Organic') {
        setProcessingMethod('Composted');
        setCompostedQuantityKg(totalWeight);
      } else if (r.category === 'E-Waste' || r.category === 'Metal') {
        setProcessingMethod('Recovered');
        setRecoveredQuantityKg(totalWeight);
      } else {
        setProcessingMethod('Recycled');
        setRecycledQuantityKg(totalWeight);
      }
    } catch (err) {
      console.error('Failed to load report for processing:', err);
      setErrorMsg('Could not load waste report details');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    setProcessingMethod(method);
    const pKg = parseFloat(processedQuantityKg) || 0;
    if (method === 'Recycled') {
      setRecycledQuantityKg(String(pKg));
      setCompostedQuantityKg('0');
      setRecoveredQuantityKg('0');
    } else if (method === 'Composted') {
      setRecycledQuantityKg('0');
      setCompostedQuantityKg(String(pKg));
      setRecoveredQuantityKg('0');
    } else if (method === 'Recovered') {
      setRecycledQuantityKg('0');
      setCompostedQuantityKg('0');
      setRecoveredQuantityKg(String(pKg));
    } else {
      setRecycledQuantityKg('0');
      setCompostedQuantityKg('0');
      setRecoveredQuantityKg('0');
    }
    setLandfillDivertedKg(String(pKg));
  };

  const assignedHubObj = typeof report?.assignedHubId === 'object' && report?.assignedHubId !== null ? report.assignedHubId : null;
  const assignedHubId = assignedHubObj ? (assignedHubObj._id || assignedHubObj.id) : report?.assignedHubId;
  const assignedHubName = assignedHubObj?.name || 'Assigned Processing Hub';

  const isWrongHub = user?.role === 'hub_operator' && assignedHubId && String(assignedHubId) !== String(userHubId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isWrongHub) {
      setErrorMsg(`Unauthorized: This report is assigned to ${assignedHubName}. Your account belongs to ${userHubId}.`);
      return;
    }

    const inputKg = parseFloat(inputQuantityKg);
    const processedKg = parseFloat(processedQuantityKg);
    const recycledKg = parseFloat(recycledQuantityKg) || 0;
    const compostedKg = parseFloat(compostedQuantityKg) || 0;
    const recoveredKg = parseFloat(recoveredQuantityKg) || 0;
    const divertedKg = parseFloat(landfillDivertedKg) || 0;

    if (isNaN(inputKg) || isNaN(processedKg) || inputKg <= 0 || processedKg < 0) {
      setErrorMsg('Please enter valid positive quantities');
      return;
    }

    if (recycledKg < 0 || compostedKg < 0 || recoveredKg < 0 || divertedKg < 0) {
      setErrorMsg('Quantities cannot be negative numbers');
      return;
    }

    if (processedKg > inputKg) {
      setErrorMsg(`Processed quantity (${processedKg} kg) cannot exceed Input quantity (${inputKg} kg)`);
      return;
    }

    if (recycledKg + compostedKg + recoveredKg > inputKg) {
      setErrorMsg(`Sum of recycled, composted, and recovered output (${recycledKg + compostedKg + recoveredKg} kg) cannot exceed input weight (${inputKg} kg)`);
      return;
    }

    if (divertedKg > inputKg) {
      setErrorMsg(`Landfill diverted quantity (${divertedKg} kg) cannot exceed input weight (${inputKg} kg)`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const targetHubId = assignedHubId || userHubId;
      await api.post(`/hubs/${targetHubId}/process`, {
        wasteReportId: id,
        category,
        inputQuantityKg: inputKg,
        processedQuantityKg: processedKg,
        processingMethod,
        recycledQuantityKg: recycledKg,
        compostedQuantityKg: compostedKg,
        recoveredQuantityKg: recoveredKg,
        landfillDivertedKg: divertedKg,
        notes,
      });

      alert('Waste shipment processed successfully!');
      navigate('/hub-dashboard');
    } catch (err) {
      console.error('Processing submission error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit waste processing record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading processing details...</div>;
  }

  const classification = getShipmentClassification(report?.category, report?.items);

  return (
    <div style={{ maxWidth: '780px', margin: '1rem auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link to="/hub-dashboard" className="btn-apple btn-apple-ghost" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Operations Dashboard
        </Link>
      </div>

      <RevealSection>
        <div className="apple-card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="editorial-eyebrow">
              <Sparkles size={14} /> FACILITY OPERATIONS TOOL
            </div>
            <h1 className="editorial-title" style={{ fontSize: '2.25rem' }}>
              Record Processing Outcome
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Log actual output mass and verifiable landfill diversion metrics for this shipment.
            </p>
          </div>

          {/* Shipment Summary Box */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <CategoryBadge category={report?.category} items={report?.items} size={52} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {classification.label.toUpperCase()}
                </span>
                <div style={{ fontWeight: 800, color: 'var(--forest-dark)', fontSize: '1.15rem', marginTop: '0.1rem' }}>
                  {formatCategoryTitle(report?.category)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Generator: <strong>{report?.generatorId?.name || report?.generator?.name || 'Waste Generator'}</strong> • Destination Hub: <strong>{assignedHubName}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TOTAL WEIGHT</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontSize: '1.25rem', marginTop: '0.1rem' }}>
                  {report?.quantityKg} kg
                </div>
              </div>
            </div>

            {/* Itemized breakdown for multi-category reports */}
            {classification.isMulti && report?.items && report.items.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} color="var(--primary-600)" /> Category-wise Mass Breakdown
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {report.items.map((it, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: 'var(--primary-50, #f0fdf4)',
                        border: '1px solid var(--primary-200, #bbf7d0)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        color: 'var(--primary-800)',
                      }}
                    >
                      {it.category}: <strong>{it.quantityKg} kg</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mixed waste breakdown notification */}
            {classification.isMixed && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-dark)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} color="var(--primary-600)" /> Mixed Waste Stream Specifications
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total Input Mass: <strong>{report?.quantityKg} kg</strong> (Unsorted Solid Waste Stream)
                </div>
              </div>
            )}
          </div>

          {/* Warning Banner for Wrong Hub Assignment */}
          {isWrongHub && (
            <div style={{ background: '#fffbebf0', color: '#92400e', border: '1px solid #fcd34d', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>
                <ShieldAlert size={20} color="#b45309" /> Processing Restricted to Assigned Hub
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                This waste report is assigned to <strong>{assignedHubName}</strong> ({assignedHubId}).
                You are currently signed in as an operator for <strong>{userHubId}</strong>.
                Processing reports assigned to other facilities is strictly prohibited.
              </p>
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Input Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  disabled={isWrongHub}
                  value={inputQuantityKg}
                  onChange={(e) => setInputQuantityKg(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Processed Quantity (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  disabled={isWrongHub}
                  value={processedQuantityKg}
                  onChange={(e) => setProcessedQuantityKg(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Shipment-wide Processing Method *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {PROCESSING_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isWrongHub}
                    onClick={() => handleMethodSelect(m)}
                    className={`btn-apple ${processingMethod === m ? 'btn-apple-primary' : 'btn-apple-secondary'}`}
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest-dark)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Output Mass Distribution (kg)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recycled (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isWrongHub}
                    value={recycledQuantityKg}
                    onChange={(e) => setRecycledQuantityKg(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Composted (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isWrongHub}
                    value={compostedQuantityKg}
                    onChange={(e) => setCompostedQuantityKg(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recovered (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isWrongHub}
                    value={recoveredQuantityKg}
                    onChange={(e) => setRecoveredQuantityKg(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700 }}>Diverted (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isWrongHub}
                    value={landfillDivertedKg}
                    onChange={(e) => setLandfillDivertedKg(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-600)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-700)' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Processing Audit Notes
              </label>
              <textarea
                rows="3"
                disabled={isWrongHub}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Granulated into PET plastic pellets and organic compost for agricultural reuse..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" disabled={submitting || isWrongHub} className="btn-apple btn-apple-primary" style={{ padding: '0.85rem' }}>
              <Recycle size={18} /> {submitting ? 'Recording Outcome...' : isWrongHub ? 'Processing Restricted' : 'Complete Waste Processing'}
            </button>
          </form>
        </div>
      </RevealSection>
    </div>
  );
}
