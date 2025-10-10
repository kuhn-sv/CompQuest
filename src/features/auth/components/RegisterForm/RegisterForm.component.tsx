import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData } from '../../interfaces/auth.interface';
import './RegisterForm.component.scss';

interface RegisterFormProps {
	onSwitchToLogin: () => void;
	onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
	onSwitchToLogin
}) => {
	const { signUp, loading, error } = useAuth();
	const [formData, setFormData] = useState<RegisterData>({
		email: '',
		password: '',
		confirmPassword: '',
		displayName: '',
		matrikelnummer: ''
	});
	const [formErrors, setFormErrors] = useState<Partial<RegisterData>>({});
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	const slides = [
    '/register-slide-1.png',
    '/register-slide-2.png',
    '/register-slide-3.png',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
    
		// Clear specific error when user starts typing
		if (formErrors[name as keyof RegisterData]) {
			setFormErrors(prev => ({
				...prev,
				[name]: undefined
			}));
		}
	};

	const validateForm = (): boolean => {
		const errors: Partial<RegisterData> = {};

		if (!formData.displayName.trim()) {
			errors.displayName = 'Name ist erforderlich';
		} else if (formData.displayName.trim().length < 2) {
			errors.displayName = 'Name muss mindestens 2 Zeichen lang sein';
		}

		if (!formData.matrikelnummer.trim()) {
			errors.matrikelnummer = 'Matrikelnummer ist erforderlich';
		} else if (!/^\d{7}$/.test(formData.matrikelnummer)) {
			errors.matrikelnummer = 'Matrikelnummer muss genau 7 Ziffern haben';
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
			await signUp(formData.email, formData.password, formData.displayName, formData.matrikelnummer);
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
						Eine Bestätigungs-E-Mail wurde an <strong>{formData.email}</strong> gesendet.
						Bitte überprüfe dein Postfach und klicken auf den Bestätigungslink,
						bevor du dich anmeldest.
					</p>
					<button
						type="button"
						className="register-form__switch-button"
						onClick={onSwitchToLogin}
					>
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
						<span className="register-form__field-error">{formErrors.displayName}</span>
					)}
				</div>

				<div className="register-form__field">
					<label htmlFor="matrikelnummer" className="register-form__label">
						Matrikelnummer
					</label>
					<input
						type="text"
						id="matrikelnummer"
						name="matrikelnummer"
						value={formData.matrikelnummer}
						onChange={handleInputChange}
						className={`register-form__input ${formErrors.matrikelnummer ? 'register-form__input--error' : ''}`}
						placeholder="1234567"
						pattern="[0-9]{7}"
						title="Matrikelnummer muss genau 7 Ziffern haben"
						disabled={loading}
					/>
					{formErrors.matrikelnummer && (
						<span className="register-form__field-error">{formErrors.matrikelnummer}</span>
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
						<span className="register-form__field-error">{formErrors.email}</span>
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
						<span className="register-form__field-error">{formErrors.password}</span>
					)}
				</div>

				<div className="register-form__field">
					<label htmlFor="confirmPassword" className="register-form__label">
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
						<span className="register-form__field-error">{formErrors.confirmPassword}</span>
					)}
				</div>
			</div>

			<div className="register-form__actions">
				<button
					type="submit"
					className="register-form__submit"
					disabled={loading}
				>
					{loading ? 'Registrieren...' : 'Konto erstellen'}
				</button>
			</div>

			<div className="register-form__footer">
				<p className="register-form__switch">
					Bereits ein Konto?{' '}
					<button
						type="button"
						className="register-form__switch-button"
						onClick={onSwitchToLogin}
						disabled={loading}
					>
						Anmelden
					</button>
				</p>
			</div>
				</>
			)}
		</form>
	</div>
	);
};

export default RegisterForm;
