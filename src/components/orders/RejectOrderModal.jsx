import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';

const QUICK_REASONS = [
  'Product Out of Stock',
  'Invalid Quantity',
  'Incorrect Delivery Address',
  'Payment Issue',
  'Other',
];

const RejectOrderModal = ({ open, onClose, onConfirm, orderNumber, busy = false }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject Order"
      footer={
        <>
          <Button variant="outline" onClick={onClose} style={{ width: 'auto' }}>Cancel</Button>
          <Button variant="danger" type="submit" form="reject-order-form" isLoading={busy} style={{ width: 'auto' }}>
            Reject Order
          </Button>
        </>
      }
    >
      <form id="reject-order-form" onSubmit={handleSubmit}>
        {orderNumber && (
          <div className="form-note">
            You are rejecting order <strong>{orderNumber}</strong>. The retailer will be notified by email with the reason below.
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Reason for Rejection *</label>
          <div className="quick-reasons">
            {QUICK_REASONS.map((r) => (
              <button
                type="button"
                key={r}
                className={`quick-reason ${reason === r ? 'active' : ''}`}
                onClick={() => {
                  setReason(r);
                  setError('');
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Describe the rejection reason clearly..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
          />
          {error && <p className="text-error">{error}</p>}
        </div>
      </form>
    </Modal>
  );
};

export default RejectOrderModal;
