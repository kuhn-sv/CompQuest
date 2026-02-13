import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useToast } from '../../../shared/hooks/useToast';

export const useSettingsModal = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { signOut, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { messages: toastMessages, showToast, dismissToast } = useToast();

  const isAdmin = userProfile?.role === 'admin';
  const leaderboardOptIn = userProfile?.leaderboardOptIn ?? true;

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

  const handleLeaderboardOptInChange = useCallback(
    async (value: boolean) => {
      try {
        await updateProfile({ leaderboardOptIn: value });
        showToast(
          value
            ? 'Du nimmst jetzt am Leaderboard teil.'
            : 'Du wurdest vom Leaderboard entfernt.',
          'info',
        );
      } catch (error) {
        console.error('Failed to update leaderboard setting:', error);
        showToast('Einstellung konnte nicht gespeichert werden.', 'error');
      }
    },
    [updateProfile, showToast],
  );

  return {
    showSettings,
    openSettings,
    closeSettings,
    handleSignOut,
    handleNavigateToAdmin,
    isAdmin,
    leaderboardOptIn,
    handleLeaderboardOptInChange,
    toastMessages,
    dismissToast,
  };
};
