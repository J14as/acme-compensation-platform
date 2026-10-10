import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Award, TrendingUp, RefreshCw, Globe, Building2, Layers } from 'lucide-react';
import { Api } from '../services/api';

const COUNTRY_NAMES = {
  US: 'United States',
  GB: 'United Kingdom',
  IN: 'India',
  DE: 'Germany',
  CA: 'Canada',
  SG: 'Singapore',
  AU: 'Australia',
};

export default function AnalyticsView() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [salaryBands, setSalaryBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ovData, deptData, countryData, bandsData] = await Promise.all([
        Api.getOverview(),
        Api.getByDepartment(),
        Api.getByCountry(),
        Api.getSalaryBands(),
      ]);
      setOverview(ovData);
      setDepartments(deptData);
      setCountries(countryData);
      setSalaryBands(bandsData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading && !overview) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '16px' }}>Aggregating compensation metrics across 10,000 global employee records...</p>
      </div>
    );
  }

  const maxDeptSpend = Math.max(...departments.map((d) => d.total_compensation_usd || 0), 1);
  const maxBandCount = Math.max(...salaryBands.map((b) => b.count || 0), 1);

  return (
    <div style={{ padding: '28px 0', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--obsidian)', margin: 0, letterSpacing: '-0.4px' }}>
            Salary & Compensation Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-currency financial aggregates benchmarked to Corporate Planning Rates (USD Base)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="theme-btn-secondary"
          disabled={refreshing}
          style={{ height: '42px', fontSize: '14px' }}
        >
          <RefreshCw size={15} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh KPIs'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        {/* Total Compensation Card */}
        <div className="theme-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Total Annual Payroll (USD)
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--mint-bg)',
              color: 'var(--mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--obsidian)' }} className="tabular-nums">
            ${overview?.total_compensation_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Base: ${overview?.total_payroll_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })} • Bonus: ${overview?.total_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Active Headcount Card */}
        <div className="theme-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Active Headcount
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--indigo-bg)',
              color: 'var(--indigo-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--obsidian)' }} className="tabular-nums">
            {overview?.active_employees?.toLocaleString()}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Of {overview?.total_employees?.toLocaleString()} total ({overview?.on_leave_employees} on leave, {overview?.terminated_employees} terminated)
          </div>
        </div>

        {/* Average Base Salary */}
        <div className="theme-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Average Base Salary (USD)
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--mint-bg)',
              color: 'var(--mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--obsidian)' }} className="tabular-nums">
            ${overview?.average_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Average incentive bonus: ${overview?.average_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Median Benchmark Salary */}
        <div className="theme-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Median Base Benchmark (USD)
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--amber-bg)',
              color: 'var(--amber-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--obsidian)' }} className="tabular-nums">
            ${overview?.median_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Exact statistical median across 10,000 employee records
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Department & Salary Bands */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '24px',
        marginBottom: '28px',
      }}>
        {/* Department Spend */}
        <div className="theme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Building2 size={18} color="var(--mint)" />
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--obsidian)', margin: 0 }}>
              Payroll Expenditure by Department
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departments.map((dept) => {
              const pct = ((dept.total_compensation_usd / maxDeptSpend) * 100).toFixed(0);
              return (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--obsidian)' }}>{dept.department}</span>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '13px' }} className="tabular-nums">
                      <span style={{ color: 'var(--text-muted)' }}>{dept.headcount} employees</span>
                      <span style={{ fontWeight: '700', color: 'var(--obsidian)' }}>
                        ${dept.total_compensation_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary Bands */}
        <div className="theme-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={18} color="var(--mint)" />
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--obsidian)', margin: 0 }}>
              Salary Bands Distribution (USD Converted)
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {salaryBands.map((band) => {
              const pct = ((band.count / maxBandCount) * 100).toFixed(0);
              const share = overview?.active_employees > 0
                ? ((band.count / overview.active_employees) * 100).toFixed(1)
                : 0;

              return (
                <div key={band.band}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--obsidian)' }}>{band.band}</span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }} className="tabular-nums">
                      <span style={{ color: 'var(--text-muted)' }}>{band.count.toLocaleString()} emps</span>
                      <span style={{ fontWeight: '700', color: 'var(--mint)' }}>{share}%</span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'var(--obsidian)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Country Breakdown */}
      <div className="theme-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Globe size={18} color="var(--mint)" />
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--obsidian)', margin: 0 }}>
            Geographic Payroll Allocation & Currency Parity
          </h2>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Contract Currency</th>
                <th style={{ textAlign: 'right' }}>Active Headcount</th>
                <th style={{ textAlign: 'right' }}>Local Nominal Spend</th>
                <th style={{ textAlign: 'right' }}>Corporate FX Rate</th>
                <th style={{ textAlign: 'right' }}>Total (USD Converted)</th>
                <th style={{ textAlign: 'right' }}>Average (USD)</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.country}>
                  <td style={{ fontWeight: '700', fontSize: '15px', color: 'var(--obsidian)' }}>
                    {COUNTRY_NAMES[c.country] || c.country}
                  </td>
                  <td>
                    <span className="badge-currency-tag">{c.currency}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px' }} className="tabular-nums">
                    {c.headcount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '14px' }} className="tabular-nums">
                    {Number(c.local_total_base).toLocaleString(undefined, { maximumFractionDigits: 0 })} {c.currency}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '13px' }} className="tabular-nums">
                    1 {c.currency} = ${c.fx_rate_to_usd}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--mint)', fontSize: '15px' }} className="tabular-nums">
                    ${Number(c.total_compensation_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontWeight: '600' }} className="tabular-nums">
                    ${Number(c.average_salary_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
