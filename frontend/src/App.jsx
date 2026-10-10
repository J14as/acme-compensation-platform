import React, { useState } from 'react';
import Header from './components/Header';
import EmployeeDirectory from './components/EmployeeDirectory';
import AnalyticsView from './components/AnalyticsView';
import InsightsView from './components/InsightsView';
import SalaryModal from './components/SalaryModal';
import HistoryModal from './components/HistoryModal';
import NewEmployeeModal from './components/NewEmployeeModal';
import { Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('directory');
  const [salaryEmployee, setSalaryEmployee] = useState(null);
  const [historyEmployeeId, setHistoryEmployeeId] = useState(null);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSalaryUpdated = (updatedEmployee) => {
    showToast(`Salary for ${updatedEmployee.full_name} updated and recorded in audit log.`);
  };

  const handleEmployeeCreated = (newEmployee) => {
    showToast(`Employee ${newEmployee.full_name} (${newEmployee.employee_code}) added.`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '86px',
          right: '32px',
          zIndex: 9999,
          background: 'var(--obsidian)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Check size={18} color="var(--mint-light)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cohesive Nordic Obsidian & Emerald Mint Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEmployeeModal={() => setIsNewEmployeeOpen(true)}
      />

      {/* Main Content Area - Full screen width with comfortable padding */}
      <main style={{
        width: '100%',
        padding: '0 32px 60px',
        flex: 1,
        boxSizing: 'border-box',
      }}>
        {activeTab === 'directory' && (
          <EmployeeDirectory
            onOpenSalaryModal={(emp) => setSalaryEmployee(emp)}
            onOpenHistoryModal={(id) => setHistoryEmployeeId(id)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'insights' && (
          <InsightsView />
        )}
      </main>

      {/* Modals */}
      {salaryEmployee && (
        <SalaryModal
          employee={salaryEmployee}
          onClose={() => setSalaryEmployee(null)}
          onUpdated={handleSalaryUpdated}
        />
      )}

      {historyEmployeeId && (
        <HistoryModal
          employeeId={historyEmployeeId}
          onClose={() => setHistoryEmployeeId(null)}
        />
      )}

      {isNewEmployeeOpen && (
        <NewEmployeeModal
          onClose={() => setIsNewEmployeeOpen(false)}
          onCreated={handleEmployeeCreated}
        />
      )}

      {/* Cohesive Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-card)',
        padding: '24px 32px',
        fontSize: '13px',
        color: 'var(--text-muted)',
        background: '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>ACME Corporation</strong> • Global Workforce Salary Management Platform
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mint)' }} />
              Active Database: 10,000 Employees
            </span>
            <span>•</span>
            <span>SQLite Relational Engine (WAL)</span>
            <span>•</span>
            <span>Ruby on Rails 8 API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
