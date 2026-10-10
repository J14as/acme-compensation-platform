import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              Salary History & Audit Trail
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Immutable record of compensation changes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Employee Header */}
        {emp && (
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                {emp.full_name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {emp.employee_code} • {emp.job_title} ({emp.department})
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading audit records...
            </div>
          ) : error ? (
            <div style={{ color: 'var(--rose-text)', textAlign: 'center', padding: '20px 0', fontSize: '13px' }}>{error}</div>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
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
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                    }}
                  >
                    {/* Reason and Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-dept">
                        {item.change_reason}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Effective {item.effective_date}
                      </span>
                    </div>

                    {/* Salary Figures */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      margin: '8px 0',
                    }}>
                      {hasDelta ? (
                        <>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {item.currency} {prev.toLocaleString()}
                          </span>
                          <ArrowRight size={13} color="var(--text-muted)" />
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: diff >= 0 ? 'var(--emerald-text)' : 'var(--rose-text)',
                          }}>
                            {diff >= 0 ? `+${diff.toLocaleString()} (+${pct}%)` : `-${Math.abs(diff).toLocaleString()} (${pct}%)`}
                          </span>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            Initial Base: {item.currency} {next.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Baseline</span>
                        </div>
                      )}
                    </div>

                    {/* Subtext */}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span>Bonus: {item.currency} {Number(item.new_bonus).toLocaleString()}</span>
                      <span>Recorded by {item.created_by}</span>
                    </div>

                    {item.notes && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
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
          justifyContent: 'flex-end',
          padding: '14px 24px',
          borderTop: '1px solid var(--border-light)',
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
