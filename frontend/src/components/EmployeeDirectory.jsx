import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, ArrowUpDown, History, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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

const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  INR: '₹',
  EUR: '€',
  CAD: 'CA$',
  SGD: 'SG$',
  AUD: 'AU$',
};

export default function EmployeeDirectory({ onOpenSalaryModal, onOpenHistoryModal }) {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

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
    <div style={{ padding: '24px 0', width: '100%' }}>
      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end',
        }}>
          {/* Search Box */}
          <div className="form-group" style={{ gridColumn: 'span 2', minWidth: '300px', marginBottom: 0 }}>
            <label className="form-label">Search Employee</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                placeholder="Search by name, employee code (e.g. ACM-00042), or title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px', height: '44px', fontSize: '14px' }}
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
                <option key={c} value={c}>{COUNTRY_FLAGS[c] || c}</option>
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
            <label className="form-label">Status</label>
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
            className="btn btn-secondary"
            style={{ height: '44px', padding: '0 18px', fontSize: '14px' }}
            title="Clear all filters"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      {/* Directory Table Meta Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
        padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Employee Records
          </h2>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            background: 'var(--bg-subtle)',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: '600',
          }}>
            {pagination.total_count.toLocaleString()} Total
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="form-select"
            style={{ padding: '4px 10px', fontSize: '13px', height: '34px' }}
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
              <th>Location</th>
              <th onClick={() => handleSort('base_salary')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                  Base Salary <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Bonus</th>
              <th style={{ textAlign: 'right' }}>USD Benchmark</th>
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
                  Loading employee records...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600' }}>No employees match the selected criteria</p>
                  <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
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
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                      }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                          {emp.full_name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '500' }}>{emp.employee_code}</span>
                          <span>•</span>
                          <span>{emp.job_title}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="badge badge-dept" style={{ fontSize: '13px', padding: '4px 10px' }}>
                      {emp.department}
                    </span>
                  </td>

                  {/* Location & Local Currency */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{COUNTRY_FLAGS[emp.country] || emp.country}</span>
                      <span className="badge badge-currency">{emp.currency}</span>
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
                  <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px', color: 'var(--emerald-text)' }} className="tabular-nums">
                    ${Number(emp.total_compensation_usd).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge badge-${emp.status}`}>
                      {emp.status === 'on_leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </td>

                  {/* Effective Date */}
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {emp.effective_date}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => onOpenSalaryModal(emp)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => onOpenHistoryModal(emp.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}
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
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
          Showing {((pagination.current_page - 1) * pagination.per_page) + (employees.length > 0 ? 1 : 0)}–{Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of {pagination.total_count.toLocaleString()} employees
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={pagination.current_page <= 1 || loading}
            className="btn btn-secondary btn-sm"
            style={{ opacity: pagination.current_page <= 1 ? 0.4 : 1, padding: '7px 14px' }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', padding: '0 8px' }}>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
            disabled={pagination.current_page >= pagination.total_pages || loading}
            className="btn btn-secondary btn-sm"
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
