import React from 'react';
import Modal from './Modal';
import Button from '../Button';

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  variant = 'danger',
  busy = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    width={440}
    footer={
      <>
        <Button variant="outline" onClick={onClose} style={{ width: 'auto' }} disabled={busy}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={busy} style={{ width: 'auto' }}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

export default ConfirmModal;
