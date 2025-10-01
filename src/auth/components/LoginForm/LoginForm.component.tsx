import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../../types/auth.types';
import EmailVerificationModal from '../EmailVerificationModal/EmailVerificationModal.component';
import './LoginForm.component.scss';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onForgotPassword, 
  onSuccess 
}) => {
  const { signIn, loading, error, emailVerificationRequired, clearEmailVerificationRequired } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (formErrors[name as keyof LoginCredentials]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!formData.email.trim()) {
      errors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.password) {
      errors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      errors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      onSuccess?.();
    } catch (error: unknown) {
      // Check if it's an email verification error
      if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
        // The AuthContext will automatically handle this and set emailVerificationRequired
      }
      // Other errors are handled by the Auth context
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <h2 className="login-form__title">Anmelden</h2>
        <p className="login-form__subtitle">
          Melden Sie sich an, um Ihren Fortschritt zu speichern
        </p>
      </div>

      {error && (
        <div className="login-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="login-form__fields">
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`login-form__input ${formErrors.email ? 'login-form__input--error' : ''}`}
            placeholder="ihre@email.de"
            autoComplete="email"
            disabled={loading}
          />
          {formErrors.email && (
            <span className="login-form__field-error">{formErrors.email}</span>
          )}
        </div>

        <div className="login-form__field">
          <label htmlFor="password" className="login-form__label">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`login-form__input ${formErrors.password ? 'login-form__input--error' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
          {formErrors.password && (
            <span className="login-form__field-error">{formErrors.password}</span>
          )}
        </div>
      </div>

      <div className="login-form__actions">
        <button
          type="submit"
          className="login-form__submit"
          disabled={loading}
        >
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>

        <button
          type="button"
          className="login-form__forgot-password"
          onClick={onForgotPassword}
          disabled={loading}
        >
          Passwort vergessen?
        </button>
      </div>

      <div className="login-form__footer">
        <p className="login-form__switch">
          Noch kein Konto?{' '}
          <button
            type="button"
            className="login-form__switch-button"
            onClick={onSwitchToRegister}
            disabled={loading}
          >
            Registrieren
          </button>
        </p>
      </div>
    </form>

    <EmailVerificationModal
      email={emailVerificationRequired || ''}
      isOpen={!!emailVerificationRequired}
      onClose={clearEmailVerificationRequired}
      onSwitchToLogin={clearEmailVerificationRequired}
    />
  </>
  );
};

export default LoginForm;