import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {RegisterData} from '../../interfaces/auth.interface';
import {authService} from '../../../../services/supabase';
import './RegisterForm.component.scss';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({onSwitchToLogin}) => {
  const {signUp, loading, error} = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    matrikelnummer: '',
    gamertag: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<RegisterData>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [gamertagChecking, setGamertagChecking] = useState(false);
  const [gamertagAvailable, setGamertagAvailable] = useState<boolean | null>(
    null,
  );
  const gamertagDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const slides = [
    '/register-slide-1.png',
    '/register-slide-2.png',
    '/register-slide-3.png',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Debounced gamertag availability check
  const checkGamertagAvailability = useCallback(async (tag: string) => {
    if (!tag || !/^[a-zA-Z0-9_]{3,20}$/.test(tag)) {
      setGamertagAvailable(null);
      setGamertagChecking(false);
      return;
    }
    setGamertagChecking(true);
    try {
      const available = await authService.checkGamertagAvailability(tag);
      setGamertagAvailable(available);
    } catch {
      setGamertagAvailable(null);
    } finally {
      setGamertagChecking(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (formErrors[name as keyof RegisterData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Debounced gamertag availability check
    if (name === 'gamertag') {
      setGamertagAvailable(null);
      if (gamertagDebounceRef.current)
        clearTimeout(gamertagDebounceRef.current);
      gamertagDebounceRef.current = setTimeout(() => {
        checkGamertagAvailability(value);
      }, 500);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegisterData> = {};

    if (!formData.displayName.trim()) {
      errors.displayName = 'Name ist erforderlich';
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = 'Name muss mindestens 2 Zeichen lang sein';
    }

    if (!formData.gamertag.trim()) {
      errors.gamertag = 'Gamertag ist erforderlich';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.gamertag)) {
      errors.gamertag =
        'Gamertag muss 3–20 Zeichen lang sein (Buchstaben, Zahlen, Unterstrich)';
    } else if (gamertagAvailable === false) {
      errors.gamertag = 'Dieser Gamertag ist bereits vergeben';
    }

    if (!formData.matrikelnummer.trim()) {
      errors.matrikelnummer = 'Matrikelnummer ist erforderlich';
    } else if (!/^\d{9}$/.test(formData.matrikelnummer)) {
      errors.matrikelnummer = 'Matrikelnummer muss genau 9 Ziffern haben';
    }

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Passwort bestätigen ist erforderlich';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwörter stimmen nicht überein';
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
      await signUp(
        formData.email,
        formData.password,
        formData.displayName,
        formData.matrikelnummer,
        formData.gamertag,
      );
      setShowSuccessMessage(true);
      // Don't call onSuccess immediately as user needs to verify email first
    } catch (error) {
      // Error is handled by the Auth context
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="register-form-overlay">
      <div className="register-form__slider">
        <div className="register-form__slide-frame">
          <img
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="register-form__slide-image"
          />
          <div className="register-form__dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`register-form__dot ${index === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-form__header">
          <h2 className="register-form__title">Registrieren</h2>
          <p className="register-form__subtitle">
            Erstelle ein Konto und lerne das Innere eines Computers kennen.
          </p>
        </div>

        {showSuccessMessage && (
          <div className="register-form__success" role="alert">
            <h3>Registrierung erfolgreich!</h3>
            <p>
              Eine Bestätigungs-E-Mail wurde an{' '}
              <strong>{formData.email}</strong> gesendet. Bitte überprüfe dein
              Postfach und klicken auf den Bestätigungslink, bevor du dich
              anmeldest.
            </p>
            <button
              type="button"
              className="register-form__switch-button"
              onClick={onSwitchToLogin}>
              Zur Anmeldung
            </button>
          </div>
        )}

        {!showSuccessMessage && (
          <>
            {error && (
              <div className="register-form__error" role="alert">
                {error}
              </div>
            )}

            <div className="register-form__fields">
              <div className="register-form__field">
                <label htmlFor="displayName" className="register-form__label">
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.displayName ? 'register-form__input--error' : ''}`}
                  placeholder="Max Mustermann"
                  autoComplete="name"
                  disabled={loading}
                />
                {formErrors.displayName && (
                  <span className="register-form__field-error">
                    {formErrors.displayName}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label htmlFor="gamertag" className="register-form__label">
                  Gamertag
                </label>
                <input
                  type="text"
                  id="gamertag"
                  name="gamertag"
                  value={formData.gamertag}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.gamertag ? 'register-form__input--error' : ''} ${gamertagAvailable === true && !formErrors.gamertag ? 'register-form__input--success' : ''}`}
                  placeholder="DragonSlayer99"
                  autoComplete="username"
                  disabled={loading}
                  maxLength={20}
                />
                <span className="register-form__gamertag-hint">
                  ℹ️ Dein Gamertag wird im Leaderboard für andere Nutzer
                  sichtbar sein.
                </span>
                {gamertagChecking && (
                  <span className="register-form__gamertag-status register-form__gamertag-status--checking">
                    Wird geprüft…
                  </span>
                )}
                {!gamertagChecking &&
                  gamertagAvailable === true &&
                  formData.gamertag.length >= 3 && (
                    <span className="register-form__gamertag-status register-form__gamertag-status--available">
                      ✓ Gamertag ist verfügbar
                    </span>
                  )}
                {!gamertagChecking && gamertagAvailable === false && (
                  <span className="register-form__gamertag-status register-form__gamertag-status--taken">
                    ✗ Dieser Gamertag ist bereits vergeben
                  </span>
                )}
                {formErrors.gamertag && (
                  <span className="register-form__field-error">
                    {formErrors.gamertag}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label
                  htmlFor="matrikelnummer"
                  className="register-form__label">
                  Matrikelnummer
                </label>
                <input
                  type="text"
                  id="matrikelnummer"
                  name="matrikelnummer"
                  value={formData.matrikelnummer}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.matrikelnummer ? 'register-form__input--error' : ''}`}
                  placeholder="123456789"
                  pattern="[0-9]{9}"
                  title="Matrikelnummer muss genau 9 Ziffern haben"
                  disabled={loading}
                />
                {formErrors.matrikelnummer && (
                  <span className="register-form__field-error">
                    {formErrors.matrikelnummer}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label htmlFor="email" className="register-form__label">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.email ? 'register-form__input--error' : ''}`}
                  placeholder="ihre@email.de"
                  autoComplete="email"
                  disabled={loading}
                />
                {formErrors.email && (
                  <span className="register-form__field-error">
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label htmlFor="password" className="register-form__label">
                  Passwort
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.password ? 'register-form__input--error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {formErrors.password && (
                  <span className="register-form__field-error">
                    {formErrors.password}
                  </span>
                )}
              </div>

              <div className="register-form__field">
                <label
                  htmlFor="confirmPassword"
                  className="register-form__label">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`register-form__input ${formErrors.confirmPassword ? 'register-form__input--error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {formErrors.confirmPassword && (
                  <span className="register-form__field-error">
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="register-form__actions">
              <button
                type="submit"
                className="register-form__submit"
                disabled={loading}>
                {loading ? 'Registrieren...' : 'Konto erstellen'}
              </button>
            </div>

            <div className="register-form__footer">
              <p className="register-form__switch">
                Bereits ein Konto?{' '}
                <a
                  type="button"
                  className="register-form__switch-button"
                  onClick={onSwitchToLogin}>
                  Anmelden
                </a>
              </p>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
