import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Api } from '../services/api';

const CHANGE_REASONS = [
  'Annual Review',
  'Promotion',
  'Market Adjustment',
  'Equity Correction',
  'Merit Increase',
];

export default function SalaryModal({ employee, onClose, onUpdated }) {
  const [newBase, setNewBase] = useState(employee?.base_salary || '');
  const [newBonus, setNewBonus] = useState(employee?.bonus || 0);
  const [reason, setReason] = useState('Annual Review');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [changedBy, setChangedBy] = useState('Sarah Jenkins (HR Manager)');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!employee) return null;

  const currentBase = Number(employee.base_salary) || 0;
  const targetBase = Number(newBase) || 0;
  const baseDiff = targetBase - currentBase;
  const pctChange = currentBase > 0 ? ((baseDiff / currentBase) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              Adjust Compensation & Audit Log
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              Changes will be permanently tracked in the immutable audit history.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Employee Summary Banner */}
        <div style={{
          background: 'var(--bg-surface)',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              {employee.full_name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              {employee.employee_code} • {employee.job_title} ({employee.department})
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Current Base</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {employee.currency} {Number(employee.base_salary).toLocaleString()}
            </div>
          </div>
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

          {/* Salary Adjustment Delta Preview */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--primary-light)" />
              <span style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: '600' }}>
                Adjustment Impact
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700' }}>
              {baseDiff >= 0 ? (
                <span style={{ color: 'var(--emerald)' }}>
                  +{employee.currency} {baseDiff.toLocaleString()} (+{pctChange}%)
                </span>
              ) : (
                <span style={{ color: 'var(--rose)' }}>
                  -{employee.currency} {Math.abs(baseDiff).toLocaleString()} ({pctChange}%)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* New Base Salary */}
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
                placeholder="e.g. 150000"
              />
            </div>

            {/* New Bonus */}
            <div className="form-group">
              <label className="form-label">New Annual Bonus ({employee.currency})</label>
              <input
                type="number"
                step="any"
                min="0"
                value={newBonus}
                onChange={(e) => setNewBonus(e.target.value)}
                className="form-input"
                placeholder="e.g. 15000"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Change Reason */}
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

            {/* Effective Date */}
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

          {/* Changed By */}
          <div className="form-group">
            <label className="form-label">Authorizing Official</label>
            <input
              type="text"
              value={changedBy}
              onChange={(e) => setChangedBy(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Adjustment Justification / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Exceptional leadership during Q2 migrations. Approved by Global Comp Board."
              className="form-textarea"
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
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
              className="btn btn-success"
              disabled={submitting}
            >
              <DollarSign size={16} />
              {submitting ? 'Committing...' : 'Commit Salary Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
