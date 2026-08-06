import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';
import Input from '../Input';
import { useToast } from '../ui/Toast';
import { UploadCloud, X } from 'lucide-react';
import { uploadRewardImage } from '../../api/rewards';

const emptyValues = () => ({
  rewardName: '',
  description: '',
  requiredPoints: '',
  rewardValue: '',
  category: '',
  terms: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
  imageUrl: '',
});

const RewardFormModal = ({ open, onClose, onConfirm, busy = false, initial = null }) => {
  const { toast } = useToast();
  const [values, setValues] = useState(emptyValues());
  const [errors, setErrors] = useState({});
  const [uploadBusy, setUploadBusy] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValues(
        initial
          ? {
              rewardName: initial.rewardName || '',
              description: initial.description || '',
              requiredPoints: initial.requiredPoints ?? '',
              rewardValue: initial.rewardValue != null ? String(initial.rewardValue) : '',
              category: initial.category || '',
              terms: initial.terms || '',
              startDate: initial.startDate || '',
              endDate: initial.endDate || '',
              status: initial.status || 'ACTIVE',
              imageUrl: initial.imageUrl || '',
            }
          : emptyValues()
      );
      setErrors({});
      setPreview(initial?.imageUrl || '');
    }
  }, [open, initial]);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const res = await uploadRewardImage(file);
      setValues((v) => ({ ...v, imageUrl: res.path }));
      toast('Image uploaded successfully.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to upload image.', 'error');
      setPreview(initial?.imageUrl || '');
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = () => {
    setPreview('');
    setValues((v) => ({ ...v, imageUrl: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!String(values.rewardName || '').trim()) errs.rewardName = 'Required';
    if (values.requiredPoints === '' || Number(values.requiredPoints) < 1) errs.requiredPoints = 'Minimum 1';
    if (values.endDate && values.startDate && values.endDate < values.startDate) {
      errs.endDate = 'Must be after start date';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onConfirm({
      rewardName: values.rewardName.trim(),
      description: values.description || null,
      requiredPoints: Number(values.requiredPoints),
      rewardValue: values.rewardValue !== '' ? Number(values.rewardValue) : null,
      category: values.category || null,
      imageUrl: values.imageUrl || null,
      terms: values.terms || null,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
      status: values.status || 'ACTIVE',
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Reward' : 'Add Reward'}
      width={640}
      footer={
        <>
          <Button variant="outline" onClick={onClose} style={{ width: 'auto' }} disabled={uploadBusy}>
            Cancel
          </Button>
          <Button type="submit" form="reward-form" isLoading={busy} disabled={uploadBusy} style={{ width: 'auto' }}>
            {initial ? 'Save Changes' : 'Create Reward'}
          </Button>
        </>
      }
    >
      <form id="reward-form" onSubmit={handleSubmit} className="action-form">
        <div className="form-note">
          Rewards are visible to retailers in the "My Rewards" catalog. Set required points and validity dates to control eligibility.
        </div>

        <div className="reward-form-image">
          {preview ? (
            <div className="reward-form-image-preview">
              <img src={preview} alt="Reward preview" />
              <button type="button" className="reward-form-image-remove" onClick={removeImage} aria-label="Remove image">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="reward-form-image-upload"
              onClick={() => fileRef.current?.click()}
              disabled={uploadBusy}
            >
              <UploadCloud size={22} />
              <span>{uploadBusy ? 'Uploading...' : 'Upload reward image'}</span>
              <small>JPG, PNG or WEBP · max 5 MB</small>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-grid">
          <Input
            label="Reward Name"
            id="reward-name"
            value={values.rewardName}
            onChange={(e) => handleChange('rewardName', e.target.value)}
            error={errors.rewardName}
            style={{ gridColumn: 'span 2' }}
          />
          <Input
            label="Category"
            id="reward-category"
            placeholder="e.g. Voucher, Merchandise"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
            style={{ gridColumn: 'span 2' }}
          />
          <Input
            label="Required Points"
            id="reward-points"
            type="number"
            min="1"
            value={values.requiredPoints}
            onChange={(e) => handleChange('requiredPoints', e.target.value)}
            error={errors.requiredPoints}
          />
          <Input
            label="Reward Value (₹)"
            id="reward-value"
            type="number"
            min="0"
            value={values.rewardValue}
            onChange={(e) => handleChange('rewardValue', e.target.value)}
          />
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label className="input-label" htmlFor="reward-start">Start Date</label>
            <input
              id="reward-start"
              className="input-field"
              type="date"
              value={values.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label className="input-label" htmlFor="reward-end">End Date</label>
            <input
              id="reward-end"
              className={`input-field ${errors.endDate ? 'error' : ''}`}
              type="date"
              value={values.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
            {errors.endDate && <p className="text-error">{errors.endDate}</p>}
          </div>
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label className="input-label" htmlFor="reward-status">Status</label>
            <select
              id="reward-status"
              className="input-field"
              value={values.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="reward-desc">Description</label>
            <textarea
              id="reward-desc"
              className="input-field"
              rows={3}
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="reward-terms">Terms &amp; Conditions</label>
            <textarea
              id="reward-terms"
              className="input-field"
              rows={3}
              value={values.terms}
              onChange={(e) => handleChange('terms', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RewardFormModal;
