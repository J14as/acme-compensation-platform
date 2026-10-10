import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp, DollarSign, UserCheck, ShieldCheck } from 'lucide-react';
import { Api } from '../services/api';

const CHANGE_REASONS = [
  'Annual Review',
  'Promotion',
  'Market Adjustment',
  'Equity Correction',
  'Merit Increase',
];

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

export default function SalaryModal({ employee, initialMode = 'salary', onClose, onUpdated }) {
  const [mode, setMode] = useState(initialMode); // 'salary' or 'details'

  // Salary fields
  const [newBase, setNewBase] = useState(employee?.base_salary || '');
  const [newBonus, setNewBonus] = useState(employee?.bonus || 0);
  const [reason, setReason] = useState('Annual Review');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [changedBy, setChangedBy] = useState('Sarah Jenkins (HR Operations Lead)');

  // Demographic / Details fields
  const [firstName, setFirstName] = useState(employee?.first_name || '');
  const [lastName, setLastName] = useState(employee?.last_name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [department, setDepartment] = useState(employee?.department || 'Engineering');
  const [jobTitle, setJobTitle] = useState(employee?.job_title || '');
  const [status, setStatus] = useState(employee?.status || 'active');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setNewBase(employee.base_salary || '');
      setNewBonus(employee.bonus || 0);
      setFirstName(employee.first_name || '');
      setLastName(employee.last_name || '');
      setEmail(employee.email || '');
      setDepartment(employee.department || 'Engineering');
      setJobTitle(employee.job_title || '');
      setStatus(employee.status || 'active');
    }
  }, [employee]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!employee) return null;

  const currentBase = Number(employee.base_salary) || 0;
  const targetBase = Number(newBase) || 0;
  const baseDiff = targetBase - currentBase;
  const pctChange = currentBase > 0 ? ((baseDiff / currentBase) * 100).toFixed(1) : 0;

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!newBase || targetBase <= 0) {
      setError('Please provide a valid base salary greater than 0.');
      return;
    }
    if (!reason) {
      setError('Please select a reason for the compensation adjustment.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await Api.updateSalary(employee.id, {
        new_base_salary: targetBase,
        new_bonus: Number(newBonus) || 0,
        change_reason: reason,
        effective_date: effectiveDate,
        notes,
        changed_by: changedBy,
      });

      onUpdated(response.employee);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update salary.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !jobTitle.trim()) {
      setError('All employee fields are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await Api.updateEmployee(employee.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        department,
        job_title: jobTitle.trim(),
        status,
      });

      onUpdated(response.employee);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update employee details.');
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
          borderBottom: '1px solid var(--border-card)',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--obsidian)', margin: 0 }}>
              {mode === 'salary' ? 'Adjust Compensation' : 'Edit Employee Details'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {mode === 'salary'
                ? 'Executes atomic salary revision and appends immutable audit ledger record'
                : 'Update workforce demographic profile and organizational alignment'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-card)',
          background: 'var(--bg-subtle)',
          padding: '0 24px',
        }}>
          <button
            type="button"
            onClick={() => { setMode('salary'); setError(null); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: mode === 'salary' ? '700' : '600',
              color: mode === 'salary' ? 'var(--obsidian)' : 'var(--text-muted)',
              borderBottom: mode === 'salary' ? '2px solid var(--obsidian)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            <DollarSign size={15} />
            <span>Adjust Compensation</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('details'); setError(null); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: mode === 'details' ? '700' : '600',
              color: mode === 'details' ? 'var(--obsidian)' : 'var(--text-muted)',
              borderBottom: mode === 'details' ? '2px solid var(--obsidian)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            <UserCheck size={15} />
            <span>Employee Profile Details</span>
          </button>
        </div>

        {/* Employee Summary Banner */}
        <div style={{
          background: '#ffffff',
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--obsidian)' }}>
              {employee.full_name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {employee.employee_code} • {employee.job_title} ({employee.department})
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Base</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--obsidian)' }} className="tabular-nums">
              {employee.currency} {Number(employee.base_salary).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Salary Form */}
        {mode === 'salary' && (
          <form onSubmit={handleSalarySubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{
                background: 'var(--rose-bg)',
                border: '1px solid var(--rose-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--rose-text)',
                marginBottom: '18px',
                fontSize: '13px',
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Salary Adjustment Delta Preview */}
            <div style={{
              background: 'var(--mint-bg)',
              border: '1px solid var(--mint-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="var(--mint)" />
                <span style={{ fontSize: '13px', color: 'var(--mint)', fontWeight: '700' }}>
                  Compensation Delta
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800' }} className="tabular-nums">
                {baseDiff >= 0 ? (
                  <span style={{ color: 'var(--mint)' }}>
                    +{employee.currency} {baseDiff.toLocaleString()} (+{pctChange}%)
                  </span>
                ) : (
                  <span style={{ color: 'var(--rose-text)' }}>
                    -{employee.currency} {Math.abs(baseDiff).toLocaleString()} ({pctChange}%)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">New Base Salary ({employee.currency}) *</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={newBase}
                  onChange={(e) => setNewBase(e.target.value)}
                  className="form-input"
                  placeholder="150000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Annual Bonus ({employee.currency})</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={newBonus}
                  onChange={(e) => setNewBonus(e.target.value)}
                  className="form-input"
                  placeholder="15000"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Adjustment Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-select"
                  required
                >
                  {CHANGE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Authorizing Official</label>
              <input
                type="text"
                value={changedBy}
                onChange={(e) => setChangedBy(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Justification / Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Approved during performance calibration cycle."
                className="form-textarea"
              />
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-card)',
            }}>
              <button
                type="button"
                onClick={onClose}
                className="theme-btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="theme-btn-mint"
                disabled={submitting}
              >
                <DollarSign size={16} />
                <span>{submitting ? 'Committing...' : 'Commit Salary Adjustment'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Details Form */}
        {mode === 'details' && (
          <form onSubmit={handleDetailsSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{
                background: 'var(--rose-bg)',
                border: '1px solid var(--rose-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--rose-text)',
                marginBottom: '18px',
                fontSize: '13px',
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Corporate Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-select"
                  required
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Employment Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Designation *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="form-input"
                placeholder="Senior Backend Engineer"
              />
            </div>

            {/* Note on salary separation */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <ShieldCheck size={16} color="var(--mint)" />
              <span>Base salary is protected by audit governance. Use the "Adjust Compensation" tab to revise salary.</span>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-card)',
            }}>
              <button
                type="button"
                onClick={onClose}
                className="theme-btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="theme-btn-primary"
                disabled={submitting}
              >
                <UserCheck size={16} />
                <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
