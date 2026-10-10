import React from 'react';
import { Users, BarChart3, HelpCircle, UserPlus, Hexagon, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenNewEmployeeModal }) {
  const tabs = [
    { id: 'directory', label: 'Employee Directory', icon: Users },
    { id: 'analytics', label: 'Salary Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Compensation Q&A', icon: HelpCircle },
  ];

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-card)',
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
        height: '72px',
      }}>
        {/* Brand & Logo on Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            boxShadow: '0 2px 8px rgba(9, 13, 22, 0.15)',
          }}>
            <Hexagon size={22} strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--obsidian)', letterSpacing: '-0.4px' }}>
                ACME <span style={{ color: 'var(--mint)' }}>PAY</span>
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'var(--mint-bg)',
                color: 'var(--mint)',
                border: '1px solid var(--mint-border)',
                letterSpacing: '0.4px',
              }}>
                10,000 EMPLOYEES
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
              Multi-Currency Compensation & Workforce Governance
            </div>
          </div>
        </div>

        {/* Center Cohesive Navigation Tabs */}
        <nav style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)',
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? 'var(--obsidian)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 1px 3px rgba(9, 13, 22, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--mint)' : 'var(--text-muted)'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Add Employee & HR Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onOpenNewEmployeeModal}
            className="theme-btn-primary"
            style={{ padding: '9px 18px', fontSize: '14px' }}
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--border-card)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)',
            }}>
              SJ
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--obsidian)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Sarah Jenkins
                <ShieldCheck size={14} color="var(--mint)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                HR Operations Lead
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
