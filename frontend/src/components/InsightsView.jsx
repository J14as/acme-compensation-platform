import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, Trophy, Search, ChevronRight, CheckCircle2, DollarSign } from 'lucide-react';
import { Api } from '../services/api';

const QUICK_PROMPTS = [
  'All Questions',
  'Overall Budget',
  'Department Drivers',
  'Regional Offices',
  'Median Benchmark',
  'Audit Activity',
];

export default function InsightsView() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Questions');

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await Api.getInsights();
        setInsights(res);
      } catch (err) {
        console.error('Failed to load insights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const keyAnswers = insights?.key_answers || [];
  const topEarners = insights?.top_earners || [];

  const filteredAnswers = keyAnswers.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);

    if (activeFilter === 'Overall Budget') return item.question.includes('overall') && matchesSearch;
    if (activeFilter === 'Department Drivers') return item.question.includes('department') && matchesSearch;
    if (activeFilter === 'Regional Offices') return item.question.includes('geographic') && matchesSearch;
    if (activeFilter === 'Median Benchmark') return item.question.includes('median') && matchesSearch;
    if (activeFilter === 'Audit Activity') return item.question.includes('audit') && matchesSearch;

    return matchesSearch;
  });

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-light)', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
              <Sparkles size={14} />
              EXECUTIVE COMPENSATION INTELLIGENCE
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0 }}>
              How Does ACME Pay People?
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '750px' }}>
              Instant clarity on organization-wide compensation distribution, departmental cost drivers, regional spend parity, and top compensation outliers.
            </p>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => { setActiveFilter(prompt); setSearchQuery(''); }}
              style={{
                background: activeFilter === prompt ? 'var(--primary)' : 'var(--bg-card)',
                color: activeFilter === prompt ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Executive Q&A Cards */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          Compensation Governance Answers
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '12px', fontSize: '14px' }}>Formulating executive intelligence answers...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredAnswers.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-light)',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>
                    Q
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>
                    {item.question}
                  </h3>
                </div>

                <div style={{
                  paddingLeft: '36px',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                }}>
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 10 Earners Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Trophy size={18} color="var(--amber)" />
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
            Top 10 Compensation Outliers (USD Benchmark)
          </h2>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Employee</th>
                <th>Department & Title</th>
                <th>Region</th>
                <th style={{ textAlign: 'right' }}>Nominal Base</th>
                <th style={{ textAlign: 'right' }}>Total Compensation (USD)</th>
              </tr>
            </thead>
            <tbody>
              {topEarners.map((emp, index) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: '700', color: index < 3 ? 'var(--amber)' : 'var(--text-dim)', width: '60px' }}>
                    #{index + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{emp.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {emp.employee_code}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-main)' }}>{emp.job_title}</div>
                    <span className="badge badge-dept" style={{ marginTop: '2px' }}>{emp.department}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{emp.country}</span>
                      <span className="badge badge-currency">{emp.currency}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {emp.currency} {Number(emp.base_salary).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
                    ${Number(emp.total_compensation_usd).toLocaleString()} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
