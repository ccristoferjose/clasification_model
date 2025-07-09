import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  Activity, 
  Home, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  Users,
  FileText,
  BarChart3,
  Map,
  TrendingUp
} from 'lucide-react';

const DashboardLayout = ({ children, currentView, onViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-white" />
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg leading-tight">
                  Sistema de Clasificación
                </h1>
                <p className="text-blue-100 text-xs">
                  de Patologías
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-blue-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Description */}
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-semibold">Apoyo diagnóstico</span> usando modelos entrenados con datos hospitalarios de Guatemala
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-4">
              {/* Sección principal */}
              <div className="space-y-2">
                <button
                  onClick={() => onViewChange('patients')}
                  className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    currentView === 'patients'
                      ? 'text-blue-600 bg-blue-50 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <Users className={`mr-3 h-5 w-5 ${
                    currentView === 'patients' ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">Gestión de Pacientes</div>
                    <div className={`text-xs ${
                      currentView === 'patients' ? 'text-blue-500' : 'text-gray-400'
                    }`}>Perfiles, clasificación y patologías</div>
                  </div>
                </button>

                <button
                  onClick={() => onViewChange('statistics')}
                  className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    currentView === 'statistics'
                      ? 'text-blue-600 bg-blue-50 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <BarChart3 className={`mr-3 h-5 w-5 ${
                    currentView === 'statistics' ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">Estadísticas y Reportes</div>
                    <div className={`text-xs ${
                      currentView === 'statistics' ? 'text-blue-500' : 'text-gray-400'
                    }`}>Análisis de casos y mapas regionales</div>
                  </div>
                </button>
              </div>

              {/* Opción de acceso directo al formulario independiente (opcional) */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-blue-600 bg-blue-50 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <FileText className={`mr-3 h-5 w-5 ${
                    currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">Clasificación Rápida</div>
                    <div className={`text-xs ${
                      currentView === 'dashboard' ? 'text-blue-500' : 'text-gray-400'
                    }`}>Formulario independiente</div>
                  </div>
                </button>
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-gray-500">Médico</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search bar */}
              <div className="ml-4 flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar pacientes, diagnósticos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User menu */}
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="ml-2 text-xs text-gray-600">
                © 2024 Sistema de Clasificación de Patologías - Guatemala
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Versión 1.0.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout; 