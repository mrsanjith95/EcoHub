import React from 'react';
import { Recycle } from 'lucide-react';

/**
 * Format category title safely without duplicating the word "Waste"
 * Examples:
 *   formatCategoryTitle("Mixed Waste", 10) => "Mixed Waste (10 kg)"
 *   formatCategoryTitle("Plastic", 25) => "Plastic Waste (25 kg)"
 *   formatCategoryTitle("Organic", 20) => "Organic Waste (20 kg)"
 *   formatCategoryTitle("E-Waste", 30) => "E-Waste (30 kg)"
 *   formatCategoryTitle("Plastic, Paper", 25) => "Plastic, Paper Waste (25 kg)"
 */
export function formatCategoryTitle(category, quantityKg) {
  if (!category) {
    return quantityKg !== undefined && quantityKg !== null && quantityKg !== ''
      ? `Waste (${quantityKg} kg)`
      : 'Waste';
  }

  const cat = String(category).trim();
  let baseTitle = cat;
  if (!/waste$/i.test(cat)) {
    baseTitle = `${cat} Waste`;
  }

  if (quantityKg !== undefined && quantityKg !== null && quantityKg !== '') {
    return `${baseTitle} (${quantityKg} kg)`;
  }
  return baseTitle;
}

/**
 * Classify shipment based on report category and items data
 * Returns:
 *   { type: 'mixed', label: 'Mixed-waste shipment' }
 *   { type: 'multi', label: 'Multi-category shipment' }
 *   { type: 'single', label: 'Single-category shipment' }
 */
export function getShipmentClassification(category, items) {
  const cat = String(category || '').trim();
  const itemsArr = Array.isArray(items) ? items : [];

  const isMixed = cat === 'Mixed Waste' || itemsArr.some((i) => i.category === 'Mixed Waste');
  if (isMixed) {
    return {
      type: 'mixed',
      label: 'Mixed-waste shipment',
      badgeText: 'MIX',
      isMixed: true,
      isMulti: false,
    };
  }

  const isMulti = itemsArr.length > 1 || cat.includes(',');
  if (isMulti) {
    return {
      type: 'multi',
      label: 'Multi-category shipment',
      badgeText: 'MIX',
      isMixed: false,
      isMulti: true,
    };
  }

  return {
    type: 'single',
    label: 'Single-category shipment',
    badgeText: cat.substring(0, 3).toUpperCase(),
    isMixed: false,
    isMulti: false,
  };
}

export function getCategoryInfo(category, items) {
  const classification = getShipmentClassification(category, items);
  const catStr = (category || 'Waste').trim();

  let code = catStr.substring(0, 3).toUpperCase();
  if (catStr === 'Organic') code = 'ORG';
  if (catStr === 'Plastic') code = 'PLA';
  if (catStr === 'Paper') code = 'PAP';
  if (catStr === 'Glass') code = 'GLA';
  if (catStr === 'Metal') code = 'MET';
  if (catStr === 'E-Waste') code = 'EWA';
  if (catStr === 'Mixed Waste') code = 'MIX';

  return {
    code,
    label: catStr,
    isMulti: classification.isMulti,
    isMixed: classification.isMixed,
    classification,
  };
}

export default function CategoryBadge({ category, items, size = 48 }) {
  const info = getCategoryInfo(category, items);

  if (info.isMulti || info.isMixed) {
    return (
      <div
        title={`${info.classification.label}: ${info.label}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '14px',
          background: 'var(--primary-50, #f0fdf4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-600)',
          fontWeight: 800,
          border: '1px solid var(--primary-200, #bbf7d0)',
          flexShrink: 0,
        }}
      >
        <Recycle size={Math.round(size * 0.48)} color="var(--primary-600)" />
      </div>
    );
  }

  return (
    <div
      title={formatCategoryTitle(info.label)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '14px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary-700)',
        fontWeight: 800,
        fontSize: size > 40 ? '0.9rem' : '0.75rem',
        border: '1px solid var(--border-light)',
        flexShrink: 0,
      }}
    >
      {info.code}
    </div>
  );
}
