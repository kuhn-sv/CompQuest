import React, { useState } from 'react';
import LoginForm from '../LoginForm/LoginForm.component';
import RegisterForm from '../RegisterForm/RegisterForm.component';
import ForgotPasswordModal from '../ForgotPasswordModal/ForgotPasswordModal.component';
import './AuthModal.component.scss';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ 
	isOpen, 
	onClose, 
	initialMode = 'login' 
}) => {
	const [mode, setMode] = useState<AuthMode>(initialMode);
	const [showForgotPassword, setShowForgotPassword] = useState(false);

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
		onClose();
	};

	const handleModalClose = () => {
		setMode(initialMode);
		setShowForgotPassword(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="auth-modal" onClick={handleModalClose}>
				<div 
					className="auth-modal__content" 
					onClick={e => e.stopPropagation()}
				>
					<button
						className="auth-modal__close"
						onClick={handleModalClose}
						aria-label="Schließen"
					>
						✕
					</button>

					<div className="auth-modal__form-container">
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
			</div>

			<ForgotPasswordModal
				isOpen={showForgotPassword}
				onClose={handleCloseForgotPassword}
			/>
		</>
	);
};

export default AuthModal;
