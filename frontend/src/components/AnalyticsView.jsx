import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Award, TrendingUp, RefreshCw } from 'lucide-react';
import { Api } from '../services/api';

const COUNTRY_FLAGS = {
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
    <div style={{ padding: '24px 0', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>
            Compensation Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-currency financial aggregates normalized to Corporate USD Standard Rates
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ height: '40px', fontSize: '14px' }}
        >
          <RefreshCw size={15} />
          {refreshing ? 'Updating...' : 'Refresh KPIs'}
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
        <div className="card">
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Total Annual Payroll (USD)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }} className="tabular-nums">
            ${overview?.total_compensation_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Base: ${overview?.total_payroll_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })} • Bonus: ${overview?.total_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Active Headcount Card */}
        <div className="card">
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Active Headcount
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }} className="tabular-nums">
            {overview?.active_employees?.toLocaleString()}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Of {overview?.total_employees?.toLocaleString()} total ({overview?.on_leave_employees} on leave, {overview?.terminated_employees} terminated)
          </div>
        </div>

        {/* Average Base Salary */}
        <div className="card">
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Average Base Salary (USD)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }} className="tabular-nums">
            ${overview?.average_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Average incentive bonus: ${overview?.average_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Median Benchmark Salary */}
        <div className="card">
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Median Base Benchmark (USD)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }} className="tabular-nums">
            ${overview?.median_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Calculated across all 10,000 employees globally
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
        <div className="card">
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px' }}>
            Payroll Expenditure by Department
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departments.map((dept) => {
              const pct = ((dept.total_compensation_usd / maxDeptSpend) * 100).toFixed(0);
              return (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{dept.department}</span>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '13px' }} className="tabular-nums">
                      <span style={{ color: 'var(--text-muted)' }}>{dept.headcount} employees</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
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
                      background: 'var(--primary)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary Bands */}
        <div className="card">
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px' }}>
            Salary Bands Distribution (USD Converted)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {salaryBands.map((band) => {
              const pct = ((band.count / maxBandCount) * 100).toFixed(0);
              const share = overview?.active_employees > 0
                ? ((band.count / overview.active_employees) * 100).toFixed(1)
                : 0;

              return (
                <div key={band.band}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{band.band}</span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }} className="tabular-nums">
                      <span style={{ color: 'var(--text-muted)' }}>{band.count.toLocaleString()} emps</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{share}%</span>
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
                      background: '#4b5563',
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
      <div className="card">
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px' }}>
          Geographic Compensation & Currency Parity
        </h2>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Currency</th>
                <th style={{ textAlign: 'right' }}>Active Headcount</th>
                <th style={{ textAlign: 'right' }}>Local Nominal Spend</th>
                <th style={{ textAlign: 'right' }}>Exchange Rate (FX)</th>
                <th style={{ textAlign: 'right' }}>Total (USD Converted)</th>
                <th style={{ textAlign: 'right' }}>Average (USD)</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.country}>
                  <td style={{ fontWeight: '600', fontSize: '15px' }}>
                    {COUNTRY_FLAGS[c.country] || c.country}
                  </td>
                  <td>
                    <span className="badge badge-currency">{c.currency}</span>
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
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--emerald-text)', fontSize: '15px' }} className="tabular-nums">
                    ${Number(c.total_compensation_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '14px', fontWeight: '500' }} className="tabular-nums">
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
