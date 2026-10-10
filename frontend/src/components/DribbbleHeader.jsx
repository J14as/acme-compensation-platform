import React from 'react';
import { Search, Settings, Bell } from 'lucide-react';

export default function DribbbleHeader({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'employees', label: 'Employees' },
    { id: 'departments', label: 'Departments' },
    { id: 'formula', label: 'Formula' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header style={{
      background: 'var(--nav-blue)',
      color: '#ffffff',
      padding: '0 32px',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
    }}>
      {/* Brand on Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '16px',
        }}>
          ✦
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '17px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            ACME<span style={{ fontWeight: '400', opacity: 0.9 }}>Comp</span>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.85, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Accounting | Payroll | Planning
          </div>
        </div>
      </div>

      {/* Center Nav Items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'var(--nav-active-tab)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '9px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right Icons & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.9 }}>
          <Search size={19} />
        </button>
        <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.9 }}>
          <Settings size={19} />
        </button>
        <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.9 }}>
          <Bell size={19} />
        </button>
        
        {/* User Circular Avatar */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#854d0e',
          fontWeight: '700',
          fontSize: '14px',
          cursor: 'pointer',
        }} title="Sarah Jenkins (HR Manager)">
          SJ
        </div>
      </div>
    </header>
  );
}
