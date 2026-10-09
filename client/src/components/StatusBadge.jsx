import React from 'react';
import { Clock, CheckCircle2, Truck, Factory, ShieldCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getBadgeProps = () => {
    switch (status) {
      case 'Pending':
        return {
          className: 'badge-pill badge-pill-pending',
          icon: Clock,
          label: 'Pending Pickup',
        };
      case 'Accepted':
        return {
          className: 'badge-pill badge-pill-accepted',
          icon: ShieldCheck,
          label: 'Collector Assigned',
        };
      case 'Collected':
        return {
          className: 'badge-pill badge-pill-collected',
          icon: Truck,
          label: 'In Transit',
        };
      case 'Delivered':
        return {
          className: 'badge-pill badge-pill-accepted',
          icon: Factory,
          label: 'Delivered to Hub',
        };
      case 'Processing':
        return {
          className: 'badge-pill badge-pill-accepted',
          icon: Factory,
          label: 'Under Processing',
        };
      case 'Completed':
        return {
          className: 'badge-pill badge-pill-completed',
          icon: CheckCircle2,
          label: 'Completed & Diverted',
        };
      case 'Cancelled':
        return {
          className: 'badge-pill badge-pill-pending',
          icon: XCircle,
          label: 'Cancelled',
        };
      default:
        return {
          className: 'badge-pill badge-pill-pending',
          icon: Clock,
          label: status || 'Pending',
        };
    }
  };

  const { className, icon: Icon, label } = getBadgeProps();

  return (
    <span className={className}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
}
