import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../Button';
import Input from '../Input';
import { useToast } from '../ui/Toast';
import { UploadCloud, X } from 'lucide-react';
import { uploadProductImage } from '../../api/products';

const PRODUCT_UNITS = ['Bag', 'Kg', 'Gram', 'Litre', 'Piece', 'Box', 'Pack', 'Bottle'];

const emptyValues = () => ({
  productName: '',
  brand: '',
  category: '',
  units: [],
  price: '',
  gst: '18',
  status: 'ACTIVE',
  imageUrl: '',
});

const ProductFormModal = ({ open, onClose, onConfirm, busy = false, initial = null, categories = [] }) => {
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
              productName: initial.productName || '',
              brand: initial.brand || '',
              category: initial.category || '',
              units:
                Array.isArray(initial.units) && initial.units.length
                  ? initial.units
                  : initial.unit
                    ? String(initial.unit).split(',').map((u) => u.trim()).filter(Boolean)
                    : [],
              price: initial.price != null ? String(initial.price) : '',
              gst: initial.gst != null ? String(initial.gst) : '18',
              status: initial.status || 'ACTIVE',
              imageUrl: initial.imageUrl || '',
            }
          : emptyValues()
      );
      setErrors({});
      setPreview(initial?.imageUrl || '');
    }
  }, [open, initial]);

  const unitOptions = useMemo(() => {
    const options = [...PRODUCT_UNITS];
    (Array.isArray(initial?.units) ? initial.units : initial?.unit ? [initial.unit] : []).forEach((u) => {
      if (u && !options.includes(u)) options.push(u);
    });
    return options;
  }, [initial]);

  const categoryOptions = useMemo(() => {
    const options = [...categories];
    if (initial?.category && !options.includes(initial.category)) options.push(initial.category);
    return options;
  }, [categories, initial]);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const toggleUnit = (unit) =>
    setValues((v) => ({
      ...v,
      units: v.units.includes(unit) ? v.units.filter((u) => u !== unit) : [...v.units, unit],
    }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const res = await uploadProductImage(file);
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
    if (!String(values.productName || '').trim()) errs.productName = 'Required';
    if (!String(values.category || '').trim()) errs.category = 'Required';
    if (!values.units.length) errs.units = 'Select at least one unit';
    if (values.price === '' || Number(values.price) <= 0) errs.price = 'Must be greater than zero';
    if (values.gst === '' || Number(values.gst) < 0 || Number(values.gst) > 100) errs.gst = 'Between 0 and 100';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onConfirm({
      productName: values.productName.trim(),
      brand: values.brand.trim() || null,
      category: values.category.trim(),
      units: values.units.map((u) => u.trim()).filter(Boolean),
      price: Number(values.price),
      gst: Number(values.gst),
      status: values.status || 'ACTIVE',
      imageUrl: values.imageUrl || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Product' : 'Add Product'}
      width={640}
      footer={
        <>
          <Button variant="outline" onClick={onClose} style={{ width: 'auto' }} disabled={uploadBusy}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" isLoading={busy} disabled={uploadBusy} style={{ width: 'auto' }}>
            {initial ? 'Save Changes' : 'Add Product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="action-form">
        <div className="form-note">
          Products are visible to retailers in the order catalog. Inactive products are hidden from retailers.
        </div>

        <div className="product-form-image">
          {preview ? (
            <div className="product-form-image-preview">
              <img src={preview} alt="Product preview" />
              <button type="button" className="product-form-image-remove" onClick={removeImage} aria-label="Remove image">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="product-form-image-upload"
              onClick={() => fileRef.current?.click()}
              disabled={uploadBusy}
            >
              <UploadCloud size={22} />
              <span>{uploadBusy ? 'Uploading...' : 'Upload product image'}</span>
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
            label="Product Name"
            id="product-name"
            placeholder="e.g. UltraTech OPC 53 Grade Cement"
            value={values.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
            error={errors.productName}
            style={{ gridColumn: 'span 2' }}
          />
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="product-brand">Brand</label>
            <input
              id="product-brand"
              className="input-field"
              placeholder="e.g. UltraTech"
              value={values.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="product-category">Category</label>
            <select
              id="product-category"
              className={`input-field ${errors.category ? 'error' : ''}`}
              value={values.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-error">{errors.category}</p>}
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <span className="input-label">Units</span>
            <div className={`product-unit-picker ${errors.units ? 'error' : ''}`}>
              {unitOptions.map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`product-unit-chip ${values.units.includes(u) ? 'selected' : ''}`}
                  onClick={() => toggleUnit(u)}
                  aria-pressed={values.units.includes(u)}
                >
                  {u}
                </button>
              ))}
            </div>
            {errors.units && <p className="text-error">{errors.units}</p>}
            <p className="input-hint">Select one or more units. Customers will choose one unit per product when ordering.</p>
          </div>
          <Input
            label="Price (₹)"
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
            error={errors.price}
          />
          <Input
            label="GST (%)"
            id="product-gst"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={values.gst}
            onChange={(e) => handleChange('gst', e.target.value)}
            error={errors.gst}
          />
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label className="input-label" htmlFor="product-status">Product Status</label>
            <select
              id="product-status"
              className="input-field"
              value={values.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
