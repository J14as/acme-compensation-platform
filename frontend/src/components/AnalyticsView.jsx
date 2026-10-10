import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Award, TrendingUp, Globe, Building2, Layers, RefreshCw } from 'lucide-react';
import { Api } from '../services/api';

const COUNTRY_FLAGS = {
  US: '🇺🇸 United States',
  GB: '🇬🇧 United Kingdom',
  IN: '🇮🇳 India',
  DE: '🇩🇪 Germany',
  CA: '🇨🇦 Canada',
  SG: '🇸🇬 Singapore',
  AU: '🇦🇺 Australia',
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
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '15px' }}>Aggregating 10,000 compensation records across global nodes...</p>
      </div>
    );
  }

  const maxDeptSpend = Math.max(...departments.map((d) => d.total_compensation_usd || 0), 1);
  const maxCountrySpend = Math.max(...countries.map((c) => c.total_compensation_usd || 0), 1);
  const maxBandCount = Math.max(...salaryBands.map((b) => b.count || 0), 1);

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      {/* Analytics Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>
            Compensation Intelligence Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Multi-currency financial aggregates benchmarked to Corporate USD Standard Rates
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Updating Aggregates...' : 'Refresh KPIs'}
        </button>
      </div>

      {/* Macro KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {/* Total Compensation Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(21, 29, 47, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Compensation (USD)
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)' }}>
              <DollarSign size={18} color="var(--primary-light)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '10px 0 4px', fontFamily: 'var(--font-mono)' }}>
            ${overview?.total_compensation_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Base: ${overview?.total_payroll_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })} • Bonus: ${overview?.total_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Active Headcount Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Headcount
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)' }}>
              <Users size={18} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '10px 0 4px', fontFamily: 'var(--font-mono)' }}>
            {overview?.active_employees?.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Of {overview?.total_employees?.toLocaleString()} total ({overview?.on_leave_employees} on leave, {overview?.terminated_employees} terminated)
          </div>
        </div>

        {/* Average Base Salary */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average Base Salary
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)' }}>
              <TrendingUp size={18} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '10px 0 4px', fontFamily: 'var(--font-mono)' }}>
            ${overview?.average_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Avg Bonus: ${overview?.average_bonus_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
        </div>

        {/* Median Benchmark Salary */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Median Base Benchmark
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)' }}>
              <Award size={18} color="var(--amber)" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '10px 0 4px', fontFamily: 'var(--font-mono)' }}>
            ${overview?.median_salary_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Calculated across all 10,000 global salaries
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Department Breakdown & Salary Bands */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '24px',
        marginBottom: '28px',
      }}>
        {/* Department Spend Distribution */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Building2 size={18} color="var(--primary-light)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              Payroll Expenditure by Department
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {departments.map((dept) => {
              const pct = ((dept.total_compensation_usd / maxDeptSpend) * 100).toFixed(0);
              return (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: '600', color: '#fff' }}>{dept.department}</span>
                    <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{dept.headcount} Emps</span>
                      <span style={{ color: 'var(--emerald)', fontWeight: '600' }}>
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
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Salary Bands Distribution */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Layers size={18} color="var(--cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              Compensation Band Distribution (USD Converted)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {salaryBands.map((band) => {
              const pct = ((band.count / maxBandCount) * 100).toFixed(0);
              const shareOfActive = overview?.active_employees > 0
                ? ((band.count / overview.active_employees) * 100).toFixed(1)
                : 0;

              return (
                <div key={band.band}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: '600', color: '#fff' }}>{band.band}</span>
                    <div style={{ display: 'flex', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{band.count.toLocaleString()} emps</span>
                      <span style={{ color: 'var(--primary-light)', fontWeight: '600' }}>{shareOfActive}%</span>
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
                      background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Country Breakdown Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Globe size={18} color="var(--emerald)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
            Geographic Payroll Allocation & Conversion Transparency
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Currency</th>
                <th style={{ textAlign: 'right' }}>Active Headcount</th>
                <th style={{ textAlign: 'right' }}>Local Nominal Spend</th>
                <th style={{ textAlign: 'right' }}>Benchmark Rate (FX)</th>
                <th style={{ textAlign: 'right' }}>Total Converted USD</th>
                <th style={{ textAlign: 'right' }}>Avg Salary (USD)</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.country}>
                  <td style={{ fontWeight: '600', color: '#fff' }}>
                    {COUNTRY_FLAGS[c.country] || c.country}
                  </td>
                  <td>
                    <span className="badge badge-currency">{c.currency}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {c.headcount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {Number(c.local_total_base).toLocaleString(undefined, { maximumFractionDigits: 0 })} {c.currency}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '12px' }}>
                    1 {c.currency} = ${c.fx_rate_to_usd}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--emerald)' }}>
                    ${Number(c.total_compensation_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
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
