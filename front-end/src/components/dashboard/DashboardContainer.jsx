import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import Dashboard from './Dashboard';
import Statistics from './Statistics';
import PatientManagement from './PatientManagement';

const DashboardContainer = () => {
  const [currentView, setCurrentView] = useState('patients');

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'statistics':
        return <Statistics />;
      case 'patients':
        return <PatientManagement />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout 
      currentView={currentView} 
      onViewChange={handleViewChange}
    >
      {renderCurrentView()}
    </DashboardLayout>
  );
};

export default DashboardContainer; 