import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './ForgotPasswordModal.component.scss';

interface ForgotPasswordModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
	isOpen, 
	onClose 
}) => {
	const { resetPassword, loading } = useAuth();
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState('');
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
    
		// Validate email
		if (!email.trim()) {
			setEmailError('E-Mail ist erforderlich');
			return;
		}
    
		if (!/\S+@\S+\.\S+/.test(email)) {
			setEmailError('Ungültige E-Mail-Adresse');
			return;
		}

		try {
			setError('');
			setEmailError('');
			await resetPassword(email);
			setSuccess(true);
		} catch {
			setError('Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.');
		}
	};

	const handleClose = () => {
		setEmail('');
		setEmailError('');
		setSuccess(false);
		setError('');
		onClose();
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		if (emailError) {
			setEmailError('');
		}
	};

	if (!isOpen) return null;

	return (
		<div className="forgot-password-modal" onClick={handleClose}>
			<div 
				className="forgot-password-modal__content" 
				onClick={e => e.stopPropagation()}
			>
				<div className="forgot-password-modal__header">
					<h2 className="forgot-password-modal__title">
						Passwort zurücksetzen
					</h2>
					<button
						className="forgot-password-modal__close"
						onClick={handleClose}
						aria-label="Schließen"
					>
						✕
					</button>
				</div>

				{success ? (
					<div className="forgot-password-modal__success">
						<div className="forgot-password-modal__success-icon">
							✓
						</div>
						<h3>E-Mail gesendet!</h3>
						<p>
							Wir haben Ihnen eine E-Mail mit Anweisungen zum Zurücksetzen 
							Ihres Passworts an <strong>{email}</strong> gesendet.
						</p>
						<p>
							Bitte überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen 
							in der E-Mail.
						</p>
						<button
							className="forgot-password-modal__close-button"
							onClick={handleClose}
						>
							Verstanden
						</button>
					</div>
				) : (
					<form onSubmit={handleSubmit}>
						<div className="forgot-password-modal__body">
							<p className="forgot-password-modal__description">
								Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen 
								einen Link zum Zurücksetzen Ihres Passworts.
							</p>

							{error && (
								<div className="forgot-password-modal__error" role="alert">
									{error}
								</div>
							)}

							<div className="forgot-password-modal__field">
								<label htmlFor="reset-email" className="forgot-password-modal__label">
									E-Mail-Adresse
								</label>
								<input
									type="email"
									id="reset-email"
									value={email}
									onChange={handleEmailChange}
									className={`forgot-password-modal__input ${emailError ? 'forgot-password-modal__input--error' : ''}`}
									placeholder="ihre@email.de"
									autoComplete="email"
									disabled={loading}
									autoFocus
								/>
								{emailError && (
									<span className="forgot-password-modal__field-error">
										{emailError}
									</span>
								)}
							</div>
						</div>

						<div className="forgot-password-modal__footer">
							<button
								type="button"
								className="forgot-password-modal__cancel"
								onClick={handleClose}
								disabled={loading}
							>
								Abbrechen
							</button>
							<button
								type="submit"
								className="forgot-password-modal__submit"
								disabled={loading || !email.trim()}
							>
								{loading ? 'Senden...' : 'E-Mail senden'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default ForgotPasswordModal;
