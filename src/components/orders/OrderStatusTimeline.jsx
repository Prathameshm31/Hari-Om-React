import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, Ban } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Placed', icon: Clock },
  { key: 'APPROVED', label: 'Approved', icon: Check },
  { key: 'REJECTED', label: 'Rejected', icon: Ban },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const ORDER = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderStatusTimeline = ({ status }) => {
  const current = ORDER.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div className={`status-timeline ${isCancelled ? 'cancelled' : ''}`}>
      {STEPS.map((step) => {
        const Icon = step.icon;
        const stepIndex = ORDER.indexOf(step.key);
        const reached = !isCancelled && current >= stepIndex;
        const isRejectedReached = status === 'REJECTED' && step.key === 'REJECTED';
        const done = reached || isRejectedReached;
        const dimmed = status === 'REJECTED' && step.key !== 'REJECTED';
        return (
          <div key={step.key} className={`timeline-step ${done ? 'done' : ''} ${dimmed ? 'dimmed' : ''}`}>
            <div className={`timeline-step-icon ${isRejectedReached ? 'rejected' : ''}`}>
              <Icon size={15} />
            </div>
            <span className="timeline-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;
