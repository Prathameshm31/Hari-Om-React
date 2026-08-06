import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = 'Nothing to display here yet.', action }) => (
  <div className="empty-state animate-fade-in">
    <div className="empty-state-icon">
      <Inbox size={32} />
    </div>
    <h3>{title}</h3>
    <p>{message}</p>
    {action}
  </div>
);

export default EmptyState;
