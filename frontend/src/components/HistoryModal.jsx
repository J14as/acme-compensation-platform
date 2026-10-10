import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ShieldCheck, Calendar, UserCheck, DollarSign, RotateCcw } from 'lucide-react';
import { Api } from '../services/api';

export default function HistoryModal({ employeeId, onClose, refreshTrigger, onOpenSalaryModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await Api.getEmployee(employeeId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load salary history.');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  if (!employeeId) return null;

  const emp = data?.employee;
  const historyList = data?.salary_history || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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
              Immutable Salary Audit Ledger
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Cryptographically verified history of all compensation revisions
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Employee Header */}
        {emp && (
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--obsidian)' }}>
                {emp.full_name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {emp.employee_code} • {emp.job_title} ({emp.department})
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {onOpenSalaryModal && (
                <button
                  onClick={() => onOpenSalaryModal(emp, 'salary')}
                  className="theme-btn-secondary theme-btn-sm"
                  style={{ fontSize: '12px', padding: '5px 12px', background: '#ffffff' }}
                >
                  <DollarSign size={13} color="var(--mint)" />
                  <span>Adjust Salary</span>
                </button>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--mint-bg)',
                border: '1px solid var(--mint-border)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--mint)',
              }}>
                <ShieldCheck size={14} />
                <span>Immutable</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px', maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Retrieving verified audit records...
            </div>
          ) : error ? (
            <div style={{ color: 'var(--rose-text)', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>{error}</div>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No previous audit records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {historyList.map((item) => {
                const prev = item.previous_base_salary ? Number(item.previous_base_salary) : null;
                const next = Number(item.new_base_salary);
                const hasDelta = prev !== null;
                const diff = hasDelta ? next - prev : 0;
                const pct = (hasDelta && prev > 0) ? ((diff / prev) * 100).toFixed(1) : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Reason and Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="theme-badge badge-department">
                        {item.change_reason}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Calendar size={13} />
                        <span>Effective {item.effective_date}</span>
                      </div>
                    </div>

                    {/* Salary Figures */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      margin: '10px 0',
                    }} className="tabular-nums">
                      {hasDelta ? (
                        <>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {item.currency} {prev.toLocaleString()}
                          </span>
                          <ArrowRight size={14} color="var(--text-muted)" />
                          <span style={{ fontWeight: '700', color: 'var(--obsidian)' }}>
                            {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: diff >= 0 ? 'var(--mint)' : 'var(--rose-text)',
                          }}>
                            {diff >= 0 ? `+${diff.toLocaleString()} (+${pct}%)` : `-${Math.abs(diff).toLocaleString()} (${pct}%)`}
                          </span>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ fontWeight: '700', color: 'var(--obsidian)' }}>
                            Initial Base: {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Baseline Onboarding</span>
                        </div>
                      )}
                    </div>

                    {/* Subtext */}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span>Annual Bonus: {item.currency} {Number(item.new_bonus).toLocaleString()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={13} />
                        <span>Authorized by {item.created_by}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '6px' }}>
                        "{item.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-card)',
        }}>
          <button
            onClick={fetchHistory}
            className="theme-btn-secondary theme-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={13} />
            <span>Refresh Ledger</span>
          </button>
          <button onClick={onClose} className="theme-btn-secondary theme-btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
