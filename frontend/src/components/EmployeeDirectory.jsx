import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown, History, DollarSign, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Api } from '../services/api';

const COUNTRY_FLAGS = {
  US: '🇺🇸 US',
  GB: '🇬🇧 UK',
  IN: '🇮🇳 India',
  DE: '🇩🇪 Germany',
  CA: '🇨🇦 Canada',
  SG: '🇸🇬 Singapore',
  AU: '🇦🇺 Australia',
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
    <div className="fade-in" style={{ padding: '24px 0' }}>
      {/* Top Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          alignItems: 'end',
        }}>
          {/* Search Box */}
          <div className="form-group" style={{ gridColumn: 'span 2', minWidth: '280px', marginBottom: 0 }}>
            <label className="form-label">Search Directory</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search by name, code (e.g. ACM-00042), email, or title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
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
            style={{ height: '42px' }}
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
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
            Employee Roster
          </h2>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            background: 'var(--bg-subtle)',
            padding: '2px 8px',
            borderRadius: '999px',
          }}>
            {pagination.total_count.toLocaleString()} Total Records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="form-select"
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Data View */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid var(--rose)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fecdd3',
          marginBottom: '16px',
        }}>
          <AlertCircle size={20} color="var(--rose)" />
          <span>{error}</span>
        </div>
      )}

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
              <th style={{ textAlign: 'right' }}>Total (USD Benchmark)</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Status <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th onClick={() => handleSort('effective_date')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Effective Date <ArrowUpDown size={13} color="var(--text-dim)" />
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading organizational compensation records...</p>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>No employees found</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Try broadening your search query or reset your filters.</p>
                  <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '14px' }}>
                    Reset All Filters
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
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                      }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{emp.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.employee_code}</span>
                          <span>•</span>
                          <span>{emp.job_title}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="badge badge-dept">{emp.department}</span>
                  </td>

                  {/* Location & Local Currency */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{COUNTRY_FLAGS[emp.country] || emp.country}</span>
                      <span className="badge badge-currency">{emp.currency}</span>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td style={{ textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(emp.base_salary, emp.currency)}
                  </td>

                  {/* Bonus */}
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(emp.bonus, emp.currency)}
                  </td>

                  {/* Total Compensation in USD Benchmark */}
                  <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
                    ${Number(emp.total_compensation_usd).toLocaleString()}
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: '4px' }}>USD</span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge badge-${emp.status}`}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: emp.status === 'active' ? '#10b981' : emp.status === 'on_leave' ? '#f59e0b' : '#f43f5e',
                      }} />
                      {emp.status === 'on_leave' ? 'On Leave' : emp.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Effective Date */}
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {emp.effective_date}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onOpenSalaryModal(emp)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        title="Adjust Salary & Log Audit"
                      >
                        <DollarSign size={13} />
                        Adjust
                      </button>
                      <button
                        onClick={() => onOpenHistoryModal(emp.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        title="View Immutable Audit Trail"
                      >
                        <History size={13} />
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
        marginTop: '18px',
        padding: '0 4px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          Showing {((pagination.current_page - 1) * pagination.per_page) + (employees.length > 0 ? 1 : 0)} to{' '}
          {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{' '}
          {pagination.total_count.toLocaleString()} employees
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={pagination.current_page <= 1 || loading}
            className="btn btn-secondary btn-sm"
            style={{ opacity: pagination.current_page <= 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', padding: '0 8px' }}>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
            disabled={pagination.current_page >= pagination.total_pages || loading}
            className="btn btn-secondary btn-sm"
            style={{ opacity: pagination.current_page >= pagination.total_pages ? 0.4 : 1 }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
