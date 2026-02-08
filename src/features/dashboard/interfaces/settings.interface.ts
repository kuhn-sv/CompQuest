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
}
