import React from 'react';
import { BarChart3, Users, HelpCircle, UserPlus, ShieldCheck, Globe } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenNewEmployeeModal }) {
  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Brand & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}>
              <Globe size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
                  ACME <span style={{ color: 'var(--primary-light)' }}>Comp</span>
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--primary-light)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}>
                  ENTERPRISE
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0, textAlign: 'left' }}>
                10,000 Global Workforce • 7 Regions
              </p>
            </div>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-primary)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => setActiveTab('directory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'directory' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'directory' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
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
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
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
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'insights' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'insights' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <HelpCircle size={16} />
            Ask Org Pay
          </button>
        </nav>

        {/* Right Section: Add Employee & HR Persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onOpenNewEmployeeModal}
            className="btn btn-primary btn-sm"
          >
            <UserPlus size={16} />
            Add Employee
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '14px',
            borderLeft: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
            }}>
              SJ
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Sarah Jenkins
                <ShieldCheck size={13} color="#10b981" />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                HR Manager (Global)
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
