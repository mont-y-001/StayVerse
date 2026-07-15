import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyRequestsApi } from '../api/client';
import Loader from '../components/Loader';
import Error from '../components/Error';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Villa', 'Apartment', 'Cottage', 'Premium', 'Penthouse'];
const STEPS = ['Basic Info', 'Details', 'Photos', 'Review'];

const initialForm = {
  name: '',
  type: 'Standard',
  description: '',
  maxcount: '',
  rentperday: '',
  phonenumber: '',
  imageurls: [''],
};

export default function ListPropertyScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    const fetchRequests = async () => {
      try {
        const data = await propertyRequestsApi.listMine();
        if (!cancelled) setRequests(data || []);
      } catch (err) {
        console.error('Failed to load property requests:', err);
        if (!cancelled) setError(err.message || 'Failed to load property submissions.');
      } finally {
        if (!cancelled) setLoadingRequests(false);
      }
    };

    fetchRequests();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateImageUrl = useCallback((index, value) => {
    setForm(prev => {
      const urls = [...prev.imageurls];
      urls[index] = value;
      return { ...prev, imageurls: urls };
    });
  }, []);

  const addImageField = useCallback(() => {
    setForm(prev => ({ ...prev, imageurls: [...prev.imageurls, ''] }));
  }, []);

  const removeImageField = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      imageurls: prev.imageurls.filter((_, i) => i !== index),
    }));
  }, []);

  const canProceed = useCallback(() => {
    if (step === 0) return form.name.trim() && form.description.trim().length >= 20;
    if (step === 1) return form.maxcount > 0 && form.rentperday > 0 && form.phonenumber.trim();
    if (step === 2) return form.imageurls.some(url => url.trim());
    return true;
  }, [step, form]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const imageurls = form.imageurls.filter(url => url.trim());

      const data = await propertyRequestsApi.create({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        maxcount: parseInt(form.maxcount, 10),
        rentperday: parseFloat(form.rentperday),
        phonenumber: form.phonenumber.trim(),
        imageurls,
      });

      setRequests(prev => [data, ...prev]);
      setSuccess(true);
      setForm(initialForm);
      setStep(0);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <Loader />;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="page-screen">
      <section className="page-hero text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">
            List Your <span className="accent">Property</span>
          </h1>
          <p className="lead">
            Share your space with travelers worldwide. Submit your listing and our team will review it within 48 hours.
          </p>
        </div>
      </section>

      <section className="page-content">
        <div className="container" style={{ maxWidth: 760 }}>
          {success && (
            <div className="alert alert-success fade-in-up">
              <i className="fa fa-check-circle me-2"></i>
              Your property has been submitted! We'll notify you once it's approved.
            </div>
          )}
          {error && <Error message={error} />}

          <div className="glass-card-static mb-4">
            <div className="progress-step-bar">
              <div className="fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="d-flex justify-content-between mb-4 flex-wrap">
              {STEPS.map((label, idx) => (
                <div key={label} className="text-center mb-2" style={{ flex: '1 1 120px' }}>
                  <div className={`step-dot mx-auto mb-1 ${idx === step ? 'active' : idx < step ? 'completed' : ''}`}></div>
                  <small className={idx === step ? 'fw-bold' : 'text-muted'}>{label}</small>
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="fade-in-up">
                <h4 className="mb-3"><i className="fa fa-home me-2"></i> Basic Information</h4>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Property Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sunset Beach Villa"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Property Type</label>
                  <select
                    className="form-control"
                    value={form.type}
                    onChange={(e) => updateField('type', e.target.value)}
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="Describe your property — amenities, location highlights, what makes it special..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                  <small className="text-muted">{form.description.length}/20 min characters</small>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="fade-in-up">
                <h4 className="mb-3"><i className="fa fa-sliders me-2"></i> Property Details</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Max Guests</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="4"
                      value={form.maxcount}
                      onChange={(e) => updateField('maxcount', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Rent per Day (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="2500"
                      value={form.rentperday}
                      onChange={(e) => updateField('rentperday', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={form.phonenumber}
                    onChange={(e) => updateField('phonenumber', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in-up">
                <h4 className="mb-3"><i className="fa fa-image me-2"></i> Property Photos</h4>
                <p className="text-muted small mb-3">Add image URLs for your property. At least one is required.</p>
                {form.imageurls.map((url, idx) => (
                  <div className="d-flex gap-2 mb-2" key={idx}>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/photo.jpg"
                      value={url}
                      onChange={(e) => updateImageUrl(idx, e.target.value)}
                    />
                    {form.imageurls.length > 1 && (
                      <button className="btn btn-outline-danger" onClick={() => removeImageField(idx)}>
                        <i className="fa fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn btn-outline-dark btn-sm mt-2" onClick={addImageField}>
                  <i className="fa fa-plus me-1"></i> Add Another Photo
                </button>
                {form.imageurls.some(u => u.trim()) && (
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    {form.imageurls.filter(u => u.trim()).map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="rounded"
                        style={{ width: 80, height: 60, objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="fade-in-up">
                <h4 className="mb-3"><i className="fa fa-check-square-o me-2"></i> Review Your Listing</h4>
                <div className="bg-light rounded p-4">
                  <div className="row">
                    <div className="col-md-8">
                      <h5>{form.name}</h5>
                      <span className="badge bg-dark me-2">{form.type}</span>
                      <span className="badge bg-success">₹{form.rentperday}/day</span>
                      <p className="text-muted mt-2 small">{form.description}</p>
                      <p className="small mb-0">
                        <i className="fa fa-users me-1"></i> Max {form.maxcount} guests &nbsp;
                        <i className="fa fa-phone me-1"></i> {form.phonenumber}
                      </p>
                    </div>
                    <div className="col-md-4">
                      {form.imageurls.filter(u => u.trim())[0] && (
                        <img
                          src={form.imageurls.filter(u => u.trim())[0]}
                          alt="Preview"
                          className="w-100 rounded"
                          style={{ height: 120, objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
              >
                <i className="fa fa-arrow-left me-1"></i> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  className="btn btn-dark"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                >
                  Next <i className="fa fa-arrow-right ms-1"></i>
                </button>
              ) : (
                <button
                  className="btn btn-dark"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><i className="fa fa-spinner fa-spin me-1"></i> Submitting...</>
                  ) : (
                    <><i className="fa fa-paper-plane me-1"></i> Submit Listing</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <h4 className="section-title"><i className="fa fa-list me-2"></i> Your Submissions</h4>
            <p className="section-subtitle">Track the status of your property listings</p>

            {loadingRequests ? (
              <Loader />
            ) : requests.length === 0 ? (
              <div className="empty-state glass-card-static">
                <i className="fa fa-building-o"></i>
                <h5 className="text-muted">No submissions yet</h5>
                <p className="text-muted">Complete the form above to list your first property.</p>
              </div>
            ) : (
              <div className="row g-3">
                {requests.map(req => (
                  <div className="col-md-6" key={req.id}>
                    <div className="glass-card h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{req.name}</h6>
                        <span className={`badge-status ${
                          req.status === 'approved' ? 'bg-success text-white' :
                          req.status === 'rejected' ? 'bg-danger text-white' :
                          'bg-warning text-dark'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-muted small mb-1">{req.type} · ₹{req.rentperday}/day</p>
                      <p className="text-muted small mb-0">
                        Submitted {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}