import { useRef, useCallback } from 'react';

// Paths relative to public/ – Vite serves these at runtime
const POSITIVE_SOUND = '/sounds/positive_feedback_sound.mpeg';
const NEGATIVE_SOUND = '/sounds/negative_feedback_sound.mpeg';

/**
 * Returns a `playFeedback(isCorrect)` function.
 *
 * - `true`  → plays positive feedback sound
 * - `false` → plays negative feedback sound
 *
 * Audio elements are lazily created and preloaded so playback starts
 * without delay.
 */
export function useFeedbackSound() {
    const positiveRef = useRef<HTMLAudioElement | null>(null);
    const negativeRef = useRef<HTMLAudioElement | null>(null);

    // Lazy-init: audio is created on first call, not on every render
    const getAudio = useCallback((positive: boolean) => {
        const ref = positive ? positiveRef : negativeRef;
        if (!ref.current) {
            ref.current = new Audio(positive ? POSITIVE_SOUND : NEGATIVE_SOUND);
            ref.current.load();
        }
        return ref.current;
    }, []);

    const playFeedback = useCallback(
        (isCorrect: boolean) => {
            const audio = getAudio(isCorrect);
            // Reset to start in case the sound is still playing (rapid clicks)
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Silently ignore – autoplay may be blocked if no prior user gesture,
                // but since we play after a button click this is unlikely.
            });
        },
        [getAudio],
    );

    return { playFeedback };
}
