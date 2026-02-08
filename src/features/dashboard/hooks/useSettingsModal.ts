import {useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../auth';

export const useSettingsModal = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {signOut, userProfile} = useAuth();
  const navigate = useNavigate();

  const isAdmin = userProfile?.role === 'admin';

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut]);

  const handleNavigateToAdmin = useCallback(() => {
    setShowSettings(false);
    navigate('/professor-dashboard');
  }, [navigate]);

  return {
    showSettings,
    openSettings,
    closeSettings,
    handleSignOut,
    handleNavigateToAdmin,
    isAdmin,
  };
};
