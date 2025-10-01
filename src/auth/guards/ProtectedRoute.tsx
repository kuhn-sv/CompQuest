import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ProtectedRoute.scss';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * 
 * Schützt Routen basierend auf dem Authentication-Status:
 * - requireAuth=true (default): Nur für angemeldete Nutzer
 * - requireAuth=false: Nur für nicht angemeldete Nutzer (z.B. Login-Seite)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Während der Authentication lädt, zeige Loading-Screen
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner">
          <div className="spinner"></div>
        </div>
        <p className="auth-loading__text">Lade Benutzerinformationen...</p>
      </div>
    );
  }

  // Für geschützte Routen (requireAuth=true)
  if (requireAuth && !user) {
    // Speichere die ursprünglich angeforderte Route für Redirect nach Login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Für öffentliche Routen (requireAuth=false) - z.B. Login-Seite
  if (!requireAuth && user) {
    // Wenn bereits angemeldet, leite zum Dashboard weiter
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Zeige die Komponente
  return <>{children}</>;
};

export default ProtectedRoute;