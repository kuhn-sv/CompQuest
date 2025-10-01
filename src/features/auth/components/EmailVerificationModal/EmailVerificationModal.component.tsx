import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './EmailVerificationModal.component.scss';

interface EmailVerificationModalProps {
	email: string;
	isOpen: boolean;
	onClose: () => void;
	onSwitchToLogin: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
	email,
	isOpen,
	onClose,
	onSwitchToLogin
}) => {
	const { resendEmailVerification, loading, error } = useAuth();
	const [showResendForm, setShowResendForm] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState<string | null>(null);

	const handleResendVerification = async (e: React.FormEvent) => {
		e.preventDefault();
    
		try {
			setResendError(null);
			await resendEmailVerification(email);
			setResendSuccess(true);
			setShowResendForm(false);
		} catch (error) {
			console.error('Failed to resend verification:', error);
			const message = (error && typeof error === 'object' && 'message' in error)
				? (error as { message: string }).message
				: 'Fehler beim erneuten Senden der E-Mail.';
			setResendError(message);
		}
	};

	const handleClose = () => {
		setShowResendForm(false);
		setResendSuccess(false);
		setResendError(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="email-verification-modal">
			<div className="email-verification-modal__backdrop" onClick={handleClose} />
			<div className="email-verification-modal__content">
				<div className="email-verification-modal__header">
					<h2 className="email-verification-modal__title">
						E-Mail-Bestätigung erforderlich
					</h2>
					<button
						className="email-verification-modal__close"
						onClick={handleClose}
						aria-label="Schließen"
					>
						✕
					</button>
				</div>

				<div className="email-verification-modal__body">
					<div className="email-verification-modal__icon">
						📧
					</div>
          
					<p className="email-verification-modal__message">
						Bitte bestätigen Sie Ihre E-Mail-Adresse <strong>{email}</strong>, 
						bevor Sie sich anmelden können.
					</p>

					<p className="email-verification-modal__instructions">
						Überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink 
						in der E-Mail, die wir Ihnen gesendet haben.
					</p>

					{resendSuccess && (
						<div className="email-verification-modal__success">
							Bestätigungs-E-Mail wurde erneut gesendet!
						</div>
					)}

					{(error || resendError) && (
						<div className="email-verification-modal__error">
							{resendError || error}
						</div>
					)}

					{!showResendForm ? (
						<div className="email-verification-modal__actions">
							<button
								type="button"
								className="email-verification-modal__button email-verification-modal__button--secondary"
								onClick={() => setShowResendForm(true)}
							>
								E-Mail erneut senden
							</button>
							<button
								type="button"
								className="email-verification-modal__button email-verification-modal__button--primary"
								onClick={onSwitchToLogin}
							>
								Zur Anmeldung
							</button>
						</div>
					) : (
						<form onSubmit={handleResendVerification} className="email-verification-modal__resend-form">
							<div className="email-verification-modal__actions">
								<button
									type="button"
									className="email-verification-modal__button email-verification-modal__button--secondary"
									onClick={() => setShowResendForm(false)}
									disabled={loading}
								>
									Abbrechen
								</button>
								<button
									type="submit"
									className="email-verification-modal__button email-verification-modal__button--primary"
									disabled={loading}
								>
									{loading ? 'Sende...' : 'E-Mail senden'}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default EmailVerificationModal;
