import React, { useState, useEffect } from 'react';

export default function StatCard({ number, unit = '', label, icon: Icon, color = '#16845B', description = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numeric = parseFloat(number);
    if (isNaN(numeric)) {
      setDisplayValue(number);
      return;
    }

    let start = 0;
    const duration = 1000;
    const increment = numeric / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numeric) {
        setDisplayValue(numeric);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start * 10) / 10);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <div className="apple-card apple-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          {Icon && (
            <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Icon size={22} />
            </div>
          )}
        </div>

        <div className="big-stat-number" style={{ color: 'var(--text-primary)' }}>
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          {unit && <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>{unit}</span>}
        </div>

        <div className="big-stat-label">{label}</div>
      </div>

      {description && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-medium)', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      )}
    </div>
  );
}
