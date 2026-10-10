import React, { useState, useEffect } from 'react';
import { HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { Api } from '../services/api';

const QUICK_PROMPTS = [
  'All Questions',
  'Overall Budget',
  'Department Drivers',
  'Regional Parity',
  'Median Benchmark',
  'Audit Activity',
];

export default function InsightsView() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (activeFilter === 'Overall Budget') return item.question.includes('overall');
    if (activeFilter === 'Department Drivers') return item.question.includes('department');
    if (activeFilter === 'Regional Parity') return item.question.includes('geographic');
    if (activeFilter === 'Median Benchmark') return item.question.includes('median');
    if (activeFilter === 'Audit Activity') return item.question.includes('audit');
    return true;
  });

  return (
    <div style={{ padding: '28px 0', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: 'var(--mint-bg)', color: 'var(--mint)', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
          <Sparkles size={14} />
          <span>ORGANIZATIONAL COMPENSATION INTELLIGENCE</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--obsidian)', margin: 0, letterSpacing: '-0.4px' }}>
          How Does ACME Pay People?
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Actionable answers to executive compensation distribution, departmental cost drivers, and geographical parity.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setActiveFilter(prompt)}
              style={{
                background: activeFilter === prompt ? 'var(--obsidian)' : '#ffffff',
                color: activeFilter === prompt ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid ' + (activeFilter === prompt ? 'var(--obsidian)' : 'var(--border-card)'),
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Q&A Cards */}
      <div style={{ marginBottom: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Loading organizational compensation answers...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAnswers.map((item, idx) => (
              <div key={idx} className="theme-card" style={{ padding: '22px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: 'var(--mint)',
                    background: 'var(--mint-bg)',
                    border: '1px solid var(--mint-border)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}>
                    Q{idx + 1}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--obsidian)', margin: 0 }}>
                    {item.question}
                  </h3>
                </div>
                <div style={{
                  paddingLeft: '38px',
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                }}>
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 10 Compensation Outliers */}
      <div className="theme-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Trophy size={18} color="var(--amber-text)" />
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--obsidian)', margin: 0 }}>
            Top 10 Compensation Outliers (USD Benchmark)
          </h2>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Employee</th>
                <th>Role & Department</th>
                <th>Region</th>
                <th style={{ textAlign: 'right' }}>Nominal Base</th>
                <th style={{ textAlign: 'right' }}>Total Compensation (USD)</th>
              </tr>
            </thead>
            <tbody>
              {topEarners.map((emp, index) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: '800', color: index < 3 ? 'var(--amber-text)' : 'var(--text-muted)', fontSize: '15px' }}>
                    #{index + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--obsidian)', fontSize: '15px' }}>{emp.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {emp.employee_code}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--obsidian)', fontSize: '14px', fontWeight: '500' }}>{emp.job_title}</div>
                    <span className="theme-badge badge-department" style={{ marginTop: '4px' }}>{emp.department}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{emp.country}</span>
                      <span className="badge-currency-tag">{emp.currency}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '15px', fontWeight: '700' }} className="tabular-nums">
                    {emp.currency} {Number(emp.base_salary).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--mint)', fontSize: '15px' }} className="tabular-nums">
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
