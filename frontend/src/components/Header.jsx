import React from 'react';
import { Users, BarChart3, HelpCircle, UserPlus } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenNewEmployeeModal }) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 32px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Brand & Organization Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '16px',
            letterSpacing: '-0.5px',
          }}>
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                ACME
              </span>
              <span style={{ color: 'var(--border-strong)', fontSize: '15px' }}>/</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Salary Management
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              10,000 Employees • Multi-Currency Intelligence
            </div>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <nav style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
        }}>
          <button
            onClick={() => setActiveTab('directory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: activeTab === 'directory' ? '700' : '500',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'directory' ? '#ffffff' : 'transparent',
              color: activeTab === 'directory' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'directory' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} />
            Employee Directory
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: activeTab === 'analytics' ? '700' : '500',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'analytics' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <BarChart3 size={16} />
            Compensation Analytics
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: activeTab === 'insights' ? '700' : '500',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'insights' ? '#ffffff' : 'transparent',
              color: activeTab === 'insights' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'insights' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <HelpCircle size={16} />
            Compensation Q&A
          </button>
        </nav>

        {/* User Persona & Add Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onOpenNewEmployeeModal}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <UserPlus size={15} />
            Add Employee
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--border-light)',
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
            }}>
              SJ
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                Sarah Jenkins
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                HR Manager (Global)
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
