import { useState, useCallback } from 'react';
import type { ToastMessage, ToastVariant } from '../components/ui/toast/Toast.component';

let idCounter = 0;

export const useToast = () => {
    const [messages, setMessages] = useState<ToastMessage[]>([]);

    const showToast = useCallback(
        (text: string, variant: ToastVariant = 'info', durationMs = 3500) => {
            const id = `toast-${++idCounter}-${Date.now()}`;
            setMessages(prev => [...prev, { id, text, variant, durationMs }]);
        },
        [],
    );

    const dismissToast = useCallback((id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    }, []);

    return { messages, showToast, dismissToast };
};
