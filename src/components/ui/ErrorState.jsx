import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="error-state animate-fade-in">
    <div className="error-state-icon">
      <AlertTriangle size={28} />
    </div>
    <h3>Oops!</h3>
    <p>{message}</p>
    {onRetry && (
      <button className="btn btn-outline" onClick={onRetry} style={{ gap: '0.5rem', width: 'auto' }}>
        <RefreshCw size={16} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;
