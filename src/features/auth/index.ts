// Authentication Context and Provider
export { AuthProvider, AuthContext } from './context/AuthContext';

// Authentication Hooks
export { useAuth } from './hooks/useAuth';

// Authentication Components
export { AuthModal, LoginForm, RegisterForm, ForgotPasswordModal } from './components';

// Route Guards
export { default as ProtectedRoute } from './guards/ProtectedRoute';
export { default as TopicGuard } from './guards/TopicGuard';

// Re-export types for convenience
export type {
  User,
  UserProfile,
  AuthContextType,
  LoginCredentials,
  RegisterData
} from './interfaces/auth.interface';