import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';
import Input from '../Input';

const FIELDS = {
  edit: [
    { name: 'fullName', label: 'Retailer Name', type: 'text', col: 2 },
    { name: 'mobileNumber', label: 'Mobile Number', type: 'text', col: 2 },
    { name: 'shopName', label: 'Shop Name', type: 'text', col: 2 },
    { name: 'companyName', label: 'Company Name', type: 'text', col: 2 },
    { name: 'email', label: 'Email', type: 'email', col: 2 },
    { name: 'gstNumber', label: 'GST Number', type: 'text', col: 2 },
    { name: 'panNumber', label: 'PAN Number', type: 'text', col: 2 },
    { name: 'city', label: 'City', type: 'text', col: 1 },
    { name: 'state', label: 'State', type: 'text', col: 1 },
    { name: 'pincode', label: 'Pincode', type: 'text', col: 2 },
    { name: 'address', label: 'Address', type: 'textarea', col: 2 },
    { name: 'profileImageUrl', label: 'Profile Image URL', type: 'text', col: 2 },
  ],
  tier: [
    { name: 'tier', label: 'New Tier', type: 'select', col: 2, options: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] },
    { name: 'reason', label: 'Reason', type: 'textarea', col: 2 },
  ],
  bonus: [
    { name: 'points', label: 'Points to Add', type: 'number', col: 2 },
    { name: 'remarks', label: 'Remarks', type: 'textarea', col: 2 },
  ],
  deduct: [
    { name: 'points', label: 'Points to Deduct', type: 'number', col: 2 },
    { name: 'remarks', label: 'Remarks', type: 'textarea', col: 2 },
  ],
  reset: [{ name: 'newPassword', label: 'New Password', type: 'password', col: 2 }],
};

const TITLES = {
  edit: 'Edit Retailer',
  tier: 'Change Tier',
  bonus: 'Add Bonus Points',
  deduct: 'Deduct Points',
  reset: 'Reset Password',
};

const initialValue = (fields, prefill = {}) => {
  const obj = {};
  fields.forEach((f) => {
    obj[f.name] = prefill[f.name] !== undefined && prefill[f.name] !== null ? prefill[f.name] : '';
  });
  return obj;
};

const AdminActionModal = ({ action, open, onClose, onConfirm, prefill = {}, busy = false }) => {
  const fields = FIELDS[action] || [];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValue(fields, prefill));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, action]);

  const handleChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => {
      if ((f.type === 'number' && values[f.name] !== '' && values[f.name] !== undefined) === false && f.name === 'points') {
        if (values[f.name] === '' || Number(values[f.name]) < 1) errs[f.name] = 'Required';
      }
      if (f.name === 'newPassword' && values[f.name]?.length < 6) errs[f.name] = 'At least 6 characters';
      if (f.name === 'mobileNumber' && values[f.name] && values[f.name].length < 10) errs[f.name] = 'Invalid number';
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onConfirm(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[action]}
      footer={
        <>
          <Button variant="outline" onClick={onClose} style={{ width: 'auto' }}>Cancel</Button>
          <Button type="submit" form="admin-action-form" isLoading={busy} style={{ width: 'auto' }}>
            {action === 'bonus' ? 'Add Points' : action === 'deduct' ? 'Deduct Points' : 'Save'}
          </Button>
        </>
      }
    >
      <form id="admin-action-form" onSubmit={handleSubmit} className="action-form">
        {action === 'reset' && (
          <div className="form-note">
            The retailer will be able to log in with the new password you set.
          </div>
        )}
        <div className="form-grid">
          {fields.map((f) =>
            f.type === 'select' ? (
              <div className="input-group" key={f.name} style={{ gridColumn: `span ${f.col}` }}>
                <label className="input-label">{f.label}</label>
                <select
                  className="input-field"
                  value={values[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ) : f.type === 'textarea' ? (
              <div className="input-group" key={f.name} style={{ gridColumn: `span ${f.col}` }}>
                <label className="input-label">{f.label}</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={values[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              </div>
            ) : (
              <Input
                key={f.name}
                label={f.label}
                id={`af-${f.name}`}
                type={f.type}
                value={values[f.name] || ''}
                onChange={(e) => handleChange(f.name, e.target.value)}
                error={errors[f.name]}
                style={{ gridColumn: `span ${f.col}` }}
              />
            )
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AdminActionModal;
