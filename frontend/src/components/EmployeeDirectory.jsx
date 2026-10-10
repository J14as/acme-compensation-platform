import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, ArrowUpDown, History, DollarSign, ChevronLeft, ChevronRight, AlertCircle, Edit2 } from 'lucide-react';
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

const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  INR: '₹',
  EUR: '€',
  CAD: 'CA$',
  SGD: 'SG$',
  AUD: 'AU$',
};

export default function EmployeeDirectory({
  onOpenSalaryModal,
  onOpenHistoryModal,
  refreshTrigger,
  lastUpdatedEmployee,
}) {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 25, total_pages: 1, total_count: 0 });
  const [filters, setFilters] = useState({ departments: [], countries: [], currencies: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Api.getEmployees({
        page,
        per_page: perPage,
        search,
        department,
        country,
        currency,
        status,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setEmployees(data.employees || []);
      setPagination(data.pagination || { current_page: 1, per_page: 25, total_pages: 1, total_count: 0 });
      if (data.filters) {
        setFilters(data.filters);
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, country, currency, status, sortBy, sortOrder]);

  // Initial and query-driven fetch with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Instant optimistic update when an employee is adjusted
  useEffect(() => {
    if (!lastUpdatedEmployee) return;
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === lastUpdatedEmployee.id
          ? {
              ...emp,
              ...lastUpdatedEmployee,
              full_name: lastUpdatedEmployee.full_name || `${lastUpdatedEmployee.first_name} ${lastUpdatedEmployee.last_name}`,
              base_salary: lastUpdatedEmployee.base_salary,
              bonus: lastUpdatedEmployee.bonus,
              total_compensation_usd: lastUpdatedEmployee.total_compensation_usd,
              effective_date: lastUpdatedEmployee.effective_date,
              job_title: lastUpdatedEmployee.job_title,
              department: lastUpdatedEmployee.department,
              status: lastUpdatedEmployee.status,
            }
          : emp
      )
    );
  }, [lastUpdatedEmployee]);

  // Server re-fetch when trigger changes (e.g. employee created or salary adjusted)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchEmployees();
    }
  }, [refreshTrigger, fetchEmployees]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setCountry('');
    setCurrency('');
    setStatus('');
    setSortBy('id');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const formatMoney = (amount, curr) => {
    const symbol = CURRENCY_SYMBOLS[curr] || curr;
    return `${symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ padding: '28px 0', width: '100%' }}>
      {/* Search and Filters Card */}
      <div className="theme-card" style={{ marginBottom: '24px', padding: '22px 28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end',
        }}>
          {/* Search Box */}
          <div className="form-group" style={{ gridColumn: 'span 2', minWidth: '320px', marginBottom: 0 }}>
            <label className="form-label">Search Workforce</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                placeholder="Search by employee name, code (e.g. ACM-00042), title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-input"
                style={{ width: '100%', paddingLeft: '44px', height: '44px', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Department</label>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              className="form-select"
              style={{ height: '44px', fontSize: '14px' }}
            >
              <option value="">All Departments</option>
              {filters.departments?.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Country / Region</label>
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="form-select"
              style={{ height: '44px', fontSize: '14px' }}
            >
              <option value="">All Countries</option>
              {filters.countries?.map((c) => (
                <option key={c} value={c}>{COUNTRY_NAMES[c] || c}</option>
              ))}
            </select>
          </div>

          {/* Currency Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Currency</label>
            <select
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); setPage(1); }}
              className="form-select"
              style={{ height: '44px', fontSize: '14px' }}
            >
              <option value="">All Currencies</option>
              {filters.currencies?.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Employment Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="form-select"
              style={{ height: '44px', fontSize: '14px' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="theme-btn-secondary"
            style={{ height: '44px', padding: '0 20px', fontSize: '14px' }}
            title="Clear all filters"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Directory Table Header Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--obsidian)', margin: 0, letterSpacing: '-0.3px' }}>
            Workforce Directory
          </h2>
          <span style={{
            fontSize: '13px',
            color: 'var(--mint)',
            background: 'var(--mint-bg)',
            border: '1px solid var(--mint-border)',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: '700',
          }}>
            {pagination.total_count.toLocaleString()} Employees
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Page Size:</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="form-select"
            style={{ padding: '4px 10px', fontSize: '13px', height: '36px' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--rose-bg)',
          border: '1px solid var(--rose-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--rose-text)',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Data View */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('employee_code')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Employee <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Department <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th>Region</th>
              <th onClick={() => handleSort('base_salary')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  Base Salary <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Annual Bonus</th>
              <th style={{ textAlign: 'right' }}>USD Converted (FX)</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Status <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th onClick={() => handleSort('effective_date')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Effective <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  Loading employee records across 10,000 workforce database...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600' }}>No employees match the selected filters</p>
                  <button onClick={handleResetFilters} className="theme-btn-secondary theme-btn-sm" style={{ marginTop: '12px' }}>
                    Reset Filters
                  </button>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  {/* Employee Name & Code */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-card)',
                        color: 'var(--obsidian)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                      }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--obsidian)' }}>
                          {emp.full_name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.employee_code}</span>
                          <span>•</span>
                          <span>{emp.job_title}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="theme-badge badge-department">
                      {emp.department}
                    </span>
                  </td>

                  {/* Location & Local Currency */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{COUNTRY_NAMES[emp.country] || emp.country}</span>
                      <span className="badge-currency-tag">{emp.currency}</span>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px' }} className="tabular-nums">
                    {formatMoney(emp.base_salary, emp.currency)}
                  </td>

                  {/* Bonus */}
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '14px' }} className="tabular-nums">
                    {formatMoney(emp.bonus, emp.currency)}
                  </td>

                  {/* Total in USD Benchmark */}
                  <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px', color: 'var(--mint)' }} className="tabular-nums">
                    ${Number(emp.total_compensation_usd).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`theme-badge badge-${emp.status}`}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: emp.status === 'active' ? '#10b981' : emp.status === 'on_leave' ? '#f59e0b' : '#ef4444',
                      }} />
                      {emp.status === 'on_leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </td>

                  {/* Effective Date */}
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {emp.effective_date}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onOpenSalaryModal(emp, 'salary')}
                        className="theme-btn-secondary theme-btn-sm"
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                        title="Adjust compensation (base salary & bonus)"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => onOpenSalaryModal(emp, 'details')}
                        className="theme-btn-secondary theme-btn-sm"
                        style={{ padding: '6px 10px', fontSize: '13px', color: 'var(--text-main)' }}
                        title="Edit profile & employment details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onOpenHistoryModal(emp.id)}
                        className="theme-btn-secondary theme-btn-sm"
                        style={{ padding: '6px 10px', fontSize: '13px', color: 'var(--text-muted)' }}
                        title="View immutable salary audit ledger"
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        padding: '0 4px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Showing {((pagination.current_page - 1) * pagination.per_page) + (employees.length > 0 ? 1 : 0)}–{Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of {pagination.total_count.toLocaleString()} employees
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={pagination.current_page <= 1 || loading}
            className="theme-btn-secondary theme-btn-sm"
            style={{ opacity: pagination.current_page <= 1 ? 0.4 : 1, padding: '7px 14px' }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--obsidian)', padding: '0 8px' }}>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
            disabled={pagination.current_page >= pagination.total_pages || loading}
            className="theme-btn-secondary theme-btn-sm"
            style={{ opacity: pagination.current_page >= pagination.total_pages ? 0.4 : 1, padding: '7px 14px' }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
