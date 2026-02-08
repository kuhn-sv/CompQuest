// Legacy HTML5 pointer/touch fallback hook removed — use dnd-kit primitives instead
// (exports retained historically here were deleted as part of the migration to dnd-kit)
export { useConnectionLines, CONNECTION_LINE_PRESETS } from './useConnectionLines';
export type { ConnectionLineCalculationProps, ConnectionLineSelectors, ConnectionLineCoordinateConfig } from './useConnectionLines';
export { useTimer } from './useTimer';
export { useOrientation } from './useOrientation';
export { useDeviceType } from './useDeviceType';
export { useFooterControls } from './useFooterControls';
export type { FooterControlFlags, FooterControlHandlers } from './useFooterControls';
export { useHudState } from './useHudState';
export { useHelperTask } from './useHelperTask';
export type { UseHelperTaskOptions, UseHelperTaskResult } from './useHelperTask';
export { useGameStartScreen } from './useGameStartScreen';
export type { UseGameStartScreenOptions, UseGameStartScreenResult } from './useGameStartScreen';
export { useBadgeNotification } from './useBadgeNotification';
export { useUserBadges } from './useUserBadges';