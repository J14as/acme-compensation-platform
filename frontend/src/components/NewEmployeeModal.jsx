import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Api } from '../services/api';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'Customer Success',
  'HR & People',
  'Finance & Legal',
  'Operations',
];

const COUNTRIES = [
  { code: 'US', currency: 'USD', name: '🇺🇸 United States' },
  { code: 'GB', currency: 'GBP', name: '🇬🇧 United Kingdom' },
  { code: 'IN', currency: 'INR', name: '🇮🇳 India' },
  { code: 'DE', currency: 'EUR', name: '🇩🇪 Germany' },
  { code: 'CA', currency: 'CAD', name: '🇨🇦 Canada' },
  { code: 'SG', currency: 'SGD', name: '🇸🇬 Singapore' },
  { code: 'AU', currency: 'AUD', name: '🇦🇺 Australia' },
];

export default function NewEmployeeModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    employee_code: `ACM-${Math.floor(10000 + Math.random() * 90000)}`,
    first_name: '',
    last_name: '',
    email: '',
    department: 'Engineering',
    job_title: '',
    country: 'US',
    currency: 'USD',
    base_salary: '',
    bonus: '0',
    effective_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCountryChange = (countryCode) => {
    const found = COUNTRIES.find((c) => c.code === countryCode);
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      currency: found ? found.currency : prev.currency,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.base_salary) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        base_salary: Number(formData.base_salary),
        bonus: Number(formData.bonus) || 0,
      };

      const res = await Api.createEmployee(payload);
      onCreated(res.employee);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
              Onboard New Employee
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              Instantiates employee record with starting compensation audit baseline
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid var(--rose)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fecdd3',
              marginBottom: '18px',
              fontSize: '13px',
            }}>
              <AlertCircle size={16} color="var(--rose)" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Employee Code *</label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="form-input"
                placeholder="e.g. Alex"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="form-input"
                placeholder="e.g. Mercer"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="alex.mercer@acme-corp.internal"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="form-input"
                placeholder="e.g. Senior Backend Engineer"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Country / Region *</label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="form-select"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Currency (Auto-mapped)</label>
              <input
                type="text"
                readOnly
                value={formData.currency}
                className="form-input"
                style={{ opacity: 0.8 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Starting Base Salary ({formData.currency}) *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                className="form-input"
                placeholder="e.g. 135000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Bonus ({formData.currency})</label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                className="form-input"
                placeholder="e.g. 15000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Effective Date *</label>
            <input
              type="date"
              required
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <UserPlus size={16} />
              {submitting ? 'Creating Employee...' : 'Create Employee Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
