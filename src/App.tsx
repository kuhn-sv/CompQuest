import React from 'react';
import {useTheme} from './shared/hooks/useTheme';
import {BrowserRouter as Router} from 'react-router-dom';
import {
  AuthProvider,
  useAuth,
} from './features/auth';
import {BadgeNotificationProvider} from './shared/context/BadgeNotificationContext';
import {UserBadgesProvider} from './shared/context/UserBadgesContext';
import './App.scss';
import {useOrientation} from './shared/hooks/useOrientation';
import OrientationOverlay from './features/tasks/shared/components/orientation-overlay/OrientationOverlay';
import BadgeCelebrationPopup from './shared/components/ui/badge-celebration-popup/BadgeCelebrationPopup.component';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  // Initialize theme handling (forced to dark by useTheme implementation)
  useTheme();

  // Check device orientation - show overlay on mobile/tablet devices in portrait mode
  const {isPortrait} = useOrientation();
  const isMobileOrTablet =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    (window.matchMedia('(max-width: 1024px)').matches ||
      window.matchMedia('(pointer: coarse)').matches);

  const shouldShowOrientationOverlay = isMobileOrTablet && isPortrait;

  return (
    <AuthProvider>
      <AppShell shouldShowOrientationOverlay={shouldShowOrientationOverlay} />
    </AuthProvider>
  );
};

/**
 * Inner shell that has access to AuthContext so we can pass
 * `isAuthenticated` to the BadgeNotificationProvider.
 */
const AppShell: React.FC<{shouldShowOrientationOverlay: boolean}> = ({
  shouldShowOrientationOverlay,
}) => {
  const {user} = useAuth();

  return (
    <BadgeNotificationProvider isAuthenticated={!!user}>
      <UserBadgesProvider isAuthenticated={!!user}>
        <Router>
          {shouldShowOrientationOverlay && <OrientationOverlay />}
          <BadgeCelebrationPopup />
          <AppRoutes />
        </Router>
      </UserBadgesProvider>
    </BadgeNotificationProvider>
  );
};

export default App;
