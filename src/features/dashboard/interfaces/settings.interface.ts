export interface DashboardHeaderProps {
  displayName: string;
  onSettingsClick: () => void;
}

export interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  onSignOut: () => void;
  isAdmin: boolean;
  onNavigateToAdmin: () => void;
  leaderboardOptIn: boolean;
  onLeaderboardOptInChange: (value: boolean) => void;
}
