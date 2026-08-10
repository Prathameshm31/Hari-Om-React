import React, { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import AdminLayout from '../components/AdminLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { fetchMyRetailer, updateMyRetailer } from '../api/self';

const emptyForm = () => ({
  fullName: '',
  companyName: '',
  shopName: '',
  email: '',
  mobileNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  panNumber: '',
});

const toForm = (p) => ({
  fullName: p?.name || p?.fullName || '',
  companyName: p?.companyName || '',
  shopName: p?.shopName || '',
  email: p?.email || '',
  mobileNumber: p?.mobileNumber || '',
  address: p?.address || '',
  city: p?.city || '',
  state: p?.state || '',
  pincode: p?.pincode || '',
  gstNumber: p?.gstNumber || '',
  panNumber: p?.panNumber || '',
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^\d{10,15}$/;
const PINCODE_RE = /^\d{6}$/;
const GST_RE = /^[0-9A-Za-z]{15}$/;
const PAN_RE = /^[A-Za-z0-9]{10}$/;

const validate = (values) => {
  const errs = {};
  if (!values.fullName.trim()) errs.fullName = 'Full name is required.';
  if (!values.shopName.trim()) errs.shopName = 'Shop name is required.';
  if (!values.email.trim()) errs.email = 'Email is required.';
  else if (!EMAIL_RE.test(values.email.trim())) errs.email = 'Enter a valid email address.';
  if (!values.mobileNumber.trim()) errs.mobileNumber = 'Mobile number is required.';
  else if (!MOBILE_RE.test(values.mobileNumber.trim())) errs.mobileNumber = 'Mobile number must be 10 to 15 digits.';
  if (values.pincode.trim() && !PINCODE_RE.test(values.pincode.trim())) errs.pincode = 'Pincode must be 6 digits.';
  if (values.gstNumber.trim() && !GST_RE.test(values.gstNumber.trim())) errs.gstNumber = 'GST number must be 15 characters.';
  if (values.panNumber.trim() && !PAN_RE.test(values.panNumber.trim())) errs.panNumber = 'PAN number must be 10 characters.';
  return errs;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyRetailer();
      setProfile(data);
      setValues(toForm(data));
      setErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        fullName: values.fullName.trim(),
        companyName: values.companyName.trim() || null,
        shopName: values.shopName.trim(),
        email: values.email.trim(),
        mobileNumber: values.mobileNumber.trim(),
        address: values.address.trim() || null,
        city: values.city.trim() || null,
        state: values.state.trim() || null,
        pincode: values.pincode.trim() || null,
        gstNumber: values.gstNumber.trim() || null,
        panNumber: values.panNumber.trim() || null,
      };
      const updated = await updateMyRetailer(payload);
      setProfile(updated);
      setValues(toForm(updated));
      setErrors({});
      toast('Profile updated successfully.', 'success');
    } catch (err) {
      const data = err.response?.data || {};
      const fieldErrors = data.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
      }
      setError(data.message || 'Failed to update profile.');
      toast(data.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Layout = user?.role === 'ADMIN' ? AdminLayout : UserLayout;

  return (
    <Layout title="My Profile" subtitle="View and edit your personal details" activeKey="profile">
      {loading ? (
        <CardSkeleton />
      ) : error && !profile ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="profile-card-wrap">
            <div className="profile-card">
              <div className="profile-avatar">{values.shopName?.charAt(0).toUpperCase() || values.fullName?.charAt(0).toUpperCase() || 'P'}</div>
              <div className="profile-info">
                <h2>{values.fullName || profile?.name}</h2>
                <p className="profile-company">
                  <Building2 size={14} /> {values.shopName || profile?.shopName}
                </p>
                <span className={`tier-chip tier-${(profile?.tier || 'BRONZE').toLowerCase()}`}>{profile?.tier || 'BRONZE'}</span>
              </div>
            </div>
          </div>

          <div className="rd-panel animate-fade-in" style={{ marginTop: '1.5rem' }}>
            <div className="section-heading" style={{ marginBottom: '0.75rem' }}>
              <div>
                <h3>Edit Profile</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Update your personal and business details below.</p>
              </div>
            </div>

            {error && profile && (
              <div className="text-error" style={{ marginBottom: '1rem', background: '#fef2f2', padding: '0.6rem 1rem', borderRadius: '0.375rem' }}>
                {error}
              </div>
            )}

            <form id="profile-form" onSubmit={handleSubmit} className="action-form">
              <div className="form-grid">
                <Input
                  label="Full Name *"
                  id="profile-fullname"
                  placeholder="e.g. Ramesh Kumar"
                  value={values.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Shop Name *"
                  id="profile-shopname"
                  placeholder="e.g. Om Sai Building Materials"
                  value={values.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  error={errors.shopName}
                />
                <Input
                  label="Company Name"
                  id="profile-company"
                  placeholder="e.g. Om Sai Trading Co."
                  value={values.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  error={errors.companyName}
                />
                <Input
                  label="Email *"
                  id="profile-email"
                  type="email"
                  placeholder="e.g. you@example.com"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Mobile Number *"
                  id="profile-mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={values.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  error={errors.mobileNumber}
                />
                <Input
                  label="City"
                  id="profile-city"
                  placeholder="e.g. Mumbai"
                  value={values.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                />
                <Input
                  label="State"
                  id="profile-state"
                  placeholder="e.g. Maharashtra"
                  value={values.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  error={errors.state}
                />
                <Input
                  label="Pincode"
                  id="profile-pincode"
                  placeholder="e.g. 400001"
                  value={values.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  error={errors.pincode}
                />
                <Input
                  label="GST Number"
                  id="profile-gst"
                  placeholder="e.g. 27AABCU9603R1ZM"
                  value={values.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                  error={errors.gstNumber}
                />
                <Input
                  label="PAN Number"
                  id="profile-pan"
                  placeholder="e.g. ABCDE1234F"
                  value={values.panNumber}
                  onChange={(e) => handleChange('panNumber', e.target.value)}
                  error={errors.panNumber}
                />
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label" htmlFor="profile-address">Address</label>
                  <textarea
                    id="profile-address"
                    className="input-field"
                    rows={3}
                    placeholder="Enter the full business address"
                    value={values.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                  {errors.address && <p className="text-error">{errors.address}</p>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  isLoading={saving}
                  disabled={saving}
                  style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Profile;
