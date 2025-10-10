import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm, RegisterForm, ForgotPasswordModal } from './components';
import './auth.page.scss';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleAuthSuccess = () => {
    // Redirect zur ursprünglich angeforderten Seite oder Dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-page__container">
          <div className="auth-page__header">
            <div className="auth-page__logo-container">
            <img
              src="/favicon.svg"
              alt="CompQuest Logo"
              className="auth-page__logo-icon"
            />
            <h1 className="auth-page__logo">CompQuest</h1></div>
            <p className="auth-page__tagline">
              Übernimm die Rolle eines Informatikers, stelle dich den Grundlagen der Technischen Informatik 
            </p>
          </div>

          <div className="auth-page__form">
            {mode === 'login' ? (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onForgotPassword={handleForgotPassword}
                onSuccess={handleAuthSuccess}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={handleSwitchToLogin}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>

         
        </div>

        <div className="auth-page__background">
          <div className="auth-page__pattern"></div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleCloseForgotPassword}
      />
    </>
  );
};

export default AuthPage;