import React, { useState, useEffect } from 'react';
import { X, History, Shield, Calendar, UserCheck, ArrowRight, FileText } from 'lucide-react';
import { Api } from '../services/api';

export default function HistoryModal({ employeeId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await Api.getEmployee(employeeId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load salary history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [employeeId]);

  if (!employeeId) return null;

  const emp = data?.employee;
  const historyList = data?.salary_history || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History size={18} color="var(--primary-light)" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                Immutable Salary Audit History
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Complete chronological audit log of all compensation revisions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Employee Header */}
        {emp && (
          <div style={{
            background: 'var(--bg-surface)',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                {emp.full_name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {emp.employee_code} • {emp.job_title} ({emp.department})
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              color: 'var(--emerald)',
            }}>
              <Shield size={14} />
              <span>Immutable Ledger</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ marginTop: '12px', fontSize: '14px' }}>Retrieving audit ledger...</p>
            </div>
          ) : error ? (
            <div style={{ color: 'var(--rose)', textAlign: 'center', padding: '20px 0' }}>{error}</div>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              No previous audit records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {historyList.map((item, index) => {
                const prev = item.previous_base_salary ? Number(item.previous_base_salary) : null;
                const next = Number(item.new_base_salary);
                const hasDelta = prev !== null;
                const diff = hasDelta ? next - prev : 0;
                const pct = (hasDelta && prev > 0) ? ((diff / prev) * 100).toFixed(1) : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      position: 'relative',
                    }}
                  >
                    {/* Top Row: Reason Badge and Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge" style={{
                        background: item.change_reason === 'Promotion' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: item.change_reason === 'Promotion' ? 'var(--primary-light)' : 'var(--emerald)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        {item.change_reason}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                        <Calendar size={13} />
                        <span>Effective: {item.effective_date}</span>
                      </div>
                    </div>

                    {/* Salary Revision Comparison */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'var(--bg-primary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '10px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {hasDelta ? (
                        <>
                          <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                            {item.currency} {prev.toLocaleString()}
                          </span>
                          <ArrowRight size={14} color="var(--text-dim)" />
                          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                            {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: diff >= 0 ? 'var(--emerald)' : 'var(--rose)',
                          }}>
                            {diff >= 0 ? `+${diff.toLocaleString()} (+${pct}%)` : `-${Math.abs(diff).toLocaleString()} (${pct}%)`}
                          </span>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                            Initial Base: {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Baseline Onboarding</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata: Bonus, Author, Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Annual Bonus: {item.currency} {Number(item.new_bonus).toLocaleString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <UserCheck size={13} />
                          <span>Recorded by: {item.created_by}</span>
                        </div>
                      </div>

                      {item.notes && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          marginTop: '4px',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                        }}>
                          <FileText size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>"{item.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
