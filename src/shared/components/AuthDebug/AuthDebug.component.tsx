import React, { useState } from 'react';
import { useAuth, AuthModal } from '../../../features/auth';

const AuthDebug: React.FC = () => {
  const { user, loading, error, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (error) {
    return <div>Auth Error: {error}</div>;
  }

  return (
    <>
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
        <h3>Authentication Status</h3>
        {user ? (
          <div>
            <p>✅ User is logged in</p>
            <p>Email: {user.email}</p>
            <p>Display Name: {user.displayName || 'Not set'}</p>
            <p>UID: {user.uid}</p>
            <button 
              onClick={handleSignOut}
              style={{ marginTop: '10px', padding: '8px 16px' }}
            >
              Abmelden
            </button>
          </div>
        ) : (
          <div>
            <p>❌ User is not logged in</p>
            <button 
              onClick={() => setShowAuthModal(true)}
              style={{ marginTop: '10px', padding: '8px 16px' }}
            >
              Anmelden / Registrieren
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
};

export default AuthDebug;