import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { currentUser, sendVerificationEmail, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  async function handleResendEmail() {
    try {
      setError('');
      setMessage('');
      setResendLoading(true);
      await sendVerificationEmail(currentUser);
      setMessage('¡Email de verificación enviado! Por favor revise su bandeja de entrada.');
    } catch (error) {
      setError('Error al enviar email: ' + error.message);
    }
    setResendLoading(false);
  }

  async function handleRefresh() {
    setLoading(true);
    await currentUser.reload();
    if (currentUser.emailVerified) {
      navigate('/dashboard');
    } else {
      setError('Email aún no verificado. Por favor revise su bandeja de entrada y haga clic en el enlace de verificación.');
    }
    setLoading(false);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Error al cerrar sesión');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Verifique su Email</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de verificación a {currentUser?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600 text-center">
              <p>Por favor revise su email y haga clic en el enlace de verificación para continuar.</p>
              <p className="mt-2">Después de hacer clic en el enlace, actualice esta página.</p>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              disabled={loading} 
              className="w-full"
              variant="default"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Verificando...' : 'Ya verifiqué mi email'}
            </Button>
            
            <Button 
              onClick={handleResendEmail} 
              disabled={resendLoading} 
              className="w-full"
              variant="outline"
            >
              {resendLoading ? 'Enviando...' : 'Reenviar email de verificación'}
            </Button>
            
            <Button 
              onClick={handleLogout} 
              className="w-full"
              variant="ghost"
            >
              Cerrar sesión y usar diferente email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification; 