import React, { useState } from 'react';
import Header from './components/Header';
import EmployeeDirectory from './components/EmployeeDirectory';
import AnalyticsView from './components/AnalyticsView';
import InsightsView from './components/InsightsView';
import SalaryModal from './components/SalaryModal';
import HistoryModal from './components/HistoryModal';
import NewEmployeeModal from './components/NewEmployeeModal';
import { CheckCircle2 } from 'lucide-react';

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
    showToast(`Employee ${newEmployee.full_name} (${newEmployee.employee_code}) successfully onboarded.`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEmployeeModal={() => setIsNewEmployeeOpen(true)}
      />

      {/* Content Area */}
      <main style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '0 24px 60px',
        flex: 1,
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

      {/* Enterprise Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-dim)',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            ACME Corporation • Global Compensation & Workforce Intelligence Platform
          </div>
          <div>
            Relational DB Engine: SQLite (WAL Mode) • Backend: Ruby on Rails 8 API • Client: React 18
          </div>
        </div>
      </footer>
    </div>
  );
}
