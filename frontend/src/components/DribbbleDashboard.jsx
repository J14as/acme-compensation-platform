import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calendar, Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import BonusGauge from './BonusGauge';
import { Api } from '../services/api';

const AVATAR_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'
];

export default function DribbbleDashboard({ onOpenSalaryModal, onOpenHistoryModal, onOpenNewEmployeeModal, onViewAllEmployees }) {
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ovData, empData] = await Promise.all([
          Api.getOverview(),
          Api.getEmployees({ page, per_page: 5, search }),
        ]);
        setOverview(ovData);
        setEmployees(empData.employees || []);
        setPagination(empData.pagination || { current_page: 1, total_pages: 1, total_count: 0 });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadData, 200);
    return () => clearTimeout(timer);
  }, [page, search]);

  const totalPayroll = overview?.total_compensation_usd || 1916445;
  const totalEmployees = overview?.total_employees || 10000;
  const totalCountries = overview?.countries_count || 7;
  const totalDepartments = overview?.departments_count || 9;
  const totalBonusPool = overview?.total_bonus_usd || 12000;

  return (
    <div style={{ padding: '28px 32px 48px', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Subheader with Title & Date / Action Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Welcome, Sarah! Your dashboard is ready.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Date Range Pill */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: '9999px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <span>1 Oct, 2026 - 15 Oct, 2026</span>
            <Calendar size={15} color="var(--text-muted)" />
          </div>

          {/* + Add Employee Button */}
          <button
            onClick={onOpenNewEmployeeModal}
            className="btn-navy"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Four Top KPI Cards (First is Gradient Blue Card) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '28px',
      }}>
        {/* Card 1: Featured Blue Gradient Card */}
        <div style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
          color: '#ffffff',
          borderRadius: 'var(--card-radius)',
          padding: '24px',
          boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', opacity: 0.95 }}>
              Total Departments
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1.1 }} className="tabular-nums">
            {totalDepartments}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Overlapping Avatar Stack */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['SJ', 'MW', 'LS'].map((initials, i) => (
                <div
                  key={i}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: AVATAR_COLORS[i],
                    border: '2px solid #ffffff',
                    marginLeft: i > 0 ? '-8px' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#ffffff',
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              5% Increase this month
            </div>
          </div>
        </div>

        {/* Card 2: Total Countries */}
        <div className="dribbble-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }}>
              Total Countries
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
            }}>
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: 1.1 }} className="tabular-nums">
            {totalCountries}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#0284c7',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              6% Increase this month
            </span>
          </div>
        </div>

        {/* Card 3: Total Employee */}
        <div className="dribbble-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }}>
              Total Employee
            </span>
          </div>

          <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: 1.1 }} className="tabular-nums">
            {totalEmployees.toLocaleString()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#0284c7',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              92% Active Headcount
            </span>
          </div>
        </div>

        {/* Card 4: Total Payrolls */}
        <div className="dribbble-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }}>
              Total Payrolls
            </span>
          </div>

          <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: 1.1 }} className="tabular-nums">
            ${Number(totalPayroll).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#0284c7',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              6% Increase this month
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lower Section: Bonuses & Incentives (Left) and Our Employees Table (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gap: '24px',
        alignItems: 'stretch',
      }}>
        {/* Left Column: Concentric Arc Gauge */}
        <BonusGauge
          totalBonus={totalBonusPool}
          bonusPortion={totalBonusPool * 0.65}
          incentivePortion={totalBonusPool * 0.35}
        />

        {/* Right Column: Our Employees Table */}
        <div className="dribbble-card" style={{ padding: '24px 28px' }}>
          {/* Card Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>
                Our Employees
              </h3>
              <button
                onClick={onViewAllEmployees}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                View All
              </button>
            </div>

            {/* Pill Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <input
                type="text"
                placeholder="Search Employee"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-card)',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '10px' }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>
                  <th style={{ padding: '12px 14px' }}>Name</th>
                  <th style={{ padding: '12px 14px' }}>Email</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Country</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Pay Avg</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      Loading employee records...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Name with Circular Avatar */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: AVATAR_COLORS[index % AVATAR_COLORS.length],
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '12px',
                          }}>
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                            {emp.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {emp.email}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px', color: 'var(--text-dark)', fontWeight: '500' }}>
                        {emp.department}
                      </td>

                      {/* Country */}
                      <td style={{ padding: '14px', color: 'var(--text-dark)', fontWeight: '500' }}>
                        {emp.country}
                      </td>

                      {/* Pay Avg / Converted USD */}
                      <td style={{ padding: '14px', textAlign: 'right', fontWeight: '700' }} className="tabular-nums">
                        ${Number(emp.total_compensation_usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>

                      {/* Status Pill Badge */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span className={`pill-badge pill-${emp.status === 'active' ? 'active' : emp.status === 'on_leave' ? 'onleave' : 'inactive'}`}>
                          {emp.status === 'active' ? 'Active' : emp.status === 'on_leave' ? 'On Leave' : 'In Active'}
                        </span>
                      </td>

                      {/* Action Icons: Eye, Pencil, Trash */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => onOpenHistoryModal(emp.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="View History"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onOpenSalaryModal(emp)}
                            style={{ background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '4px' }}
                            title="Adjust Salary"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Audit Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '18px',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}>
            <div>
              Showing {((pagination.current_page - 1) * 5) + (employees.length > 0 ? 1 : 0)}-{Math.min(pagination.current_page * 5, pagination.total_count)} of {pagination.total_count.toLocaleString()} entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.current_page <= 1}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: pagination.current_page <= 1 ? 'var(--text-light)' : 'var(--text-dark)',
                  cursor: pagination.current_page <= 1 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                <ChevronLeft size={15} /> Previous
              </button>

              <span style={{
                background: '#0284c7',
                color: '#ffffff',
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
              }}>
                {String(pagination.current_page).padStart(2, '0')}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
                disabled={pagination.current_page >= pagination.total_pages}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: pagination.current_page >= pagination.total_pages ? 'var(--text-light)' : 'var(--text-dark)',
                  cursor: pagination.current_page >= pagination.total_pages ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
