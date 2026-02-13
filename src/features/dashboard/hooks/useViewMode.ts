import { useState, useEffect, useCallback } from 'react';
import useDeviceType from '@shared/hooks/useDeviceType';

const VIEW_MODE_STORAGE_KEY = 'compquest-view-mode';

export function useViewMode() {
    const [is3DView, setIs3DView] = useState(false);
    const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
    const { isTablet } = useDeviceType();

    // Load saved view mode from localStorage on mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (savedViewMode !== null) {
            setIs3DView(savedViewMode === '3D');
        }
    }, []);

    // On tablets, default to 2D
    useEffect(() => {
        if (isTablet) {
            setIs3DView(false);
            localStorage.setItem(VIEW_MODE_STORAGE_KEY, '2D');
        }
    }, [isTablet]);

    // Handle critical performance - automatically switch to 2D
    const handleCriticalPerformance = useCallback(() => {
        setIs3DView(false);
        setShowPerformanceWarning(true);
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, '2D');

        // Hide warning after 10 seconds
        setTimeout(() => {
            setShowPerformanceWarning(false);
        }, 10000);
    }, []);

    // Toggle view mode and save to localStorage
    const handleToggleView = useCallback(() => {
        const newViewMode = !is3DView;
        setIs3DView(newViewMode);
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, newViewMode ? '3D' : '2D');
    }, [is3DView]);

    return {
        is3DView,
        showPerformanceWarning,
        handleToggleView,
        handleCriticalPerformance,
        isTablet,
    };
}
