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
    showToast(`Salary for ${updatedEmployee.full_name} updated successfully.`);
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
          top: '80px',
          right: '32px',
          zIndex: 9999,
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEmployeeModal={() => setIsNewEmployeeOpen(true)}
      />

      {/* Content Area - Full Screen Width with comfortable edge padding */}
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

      {/* Enterprise Full-Width Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
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
          <div>
            10,000 Employees • SQLite Relational Engine (WAL Mode) • Rails 8 API • React
          </div>
        </div>
      </footer>
    </div>
  );
}
