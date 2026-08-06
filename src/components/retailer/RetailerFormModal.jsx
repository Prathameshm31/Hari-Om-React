import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';
import Input from '../Input';

const FIELDS = [
  { name: 'fullName', label: 'Retailer Name', type: 'text', col: 2, required: true },
  { name: 'mobileNumber', label: 'Mobile Number', type: 'text', col: 2, required: true },
  { name: 'email', label: 'Email', type: 'email', col: 2, required: true },
  { name: 'password', label: 'Password', type: 'password', col: 2, required: true },
  { name: 'shopName', label: 'Shop Name', type: 'text', col: 2 },
  { name: 'companyName', label: 'Company Name', type: 'text', col: 2 },
  { name: 'gstNumber', label: 'GST Number', type: 'text', col: 2 },
  { name: 'panNumber', label: 'PAN Number', type: 'text', col: 2 },
  { name: 'city', label: 'City', type: 'text', col: 1 },
  { name: 'state', label: 'State', type: 'text', col: 1 },
  { name: 'pincode', label: 'Pincode', type: 'text', col: 2 },
  { name: 'address', label: 'Address', type: 'textarea', col: 2 },
  { name: 'profileImageUrl', label: 'Profile Image URL', type: 'text', col: 2 },
];

const emptyValues = () => Object.fromEntries(FIELDS.map((f) => [f.name, '']));

const RetailerFormModal = ({ open, onClose, onConfirm, busy = false }) => {
  const [values, setValues] = useState(emptyValues());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(emptyValues());
      setErrors({});
    }
  }, [open]);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    FIELDS.forEach((f) => {
      if (f.required && !String(values[f.name] || '').trim()) {
        errs[f.name] = 'Required';
      }
    });
    const mobile = String(values.mobileNumber || '');
    if (mobile && !/^\d{10}$/.test(mobile)) errs.mobileNumber = '10 digits required';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Invalid email';
    if (values.password && values.password.length < 8) errs.password = 'Min 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onConfirm(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Retailer"
      width={620}
      footer={
        <>
          <Button variant="outline" onClick={onClose} style={{ width: 'auto' }}>Cancel</Button>
          <Button type="submit" form="add-retailer-form" isLoading={busy} style={{ width: 'auto' }}>
            Create Retailer
          </Button>
        </>
      }
    >
      <form id="add-retailer-form" onSubmit={handleSubmit} className="action-form">
        <div className="form-note">
          Creates a new retailer account with the USER role. The retailer can log in with the email and password provided.
        </div>
        <div className="form-grid">
          {FIELDS.map((f) =>
            f.type === 'textarea' ? (
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
                id={`add-${f.name}`}
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

export default RetailerFormModal;
