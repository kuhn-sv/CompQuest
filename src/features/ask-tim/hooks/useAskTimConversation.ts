import { useState, useEffect, useMemo } from 'react';
import { trainingService } from '../../../services/supabase';

const MAX_LEN = 250;

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    feedback?: boolean; // true=up, false=down, undefined=none
}

interface UseAskTimConversationProps {
    open: boolean;
    taskMeta?: {
        id: string;
        title: string;
        level?: string;
    };
    taskContext?: unknown;
}

export const useAskTimConversation = ({ open, taskMeta, taskContext }: UseAskTimConversationProps) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(null);
    const [ratingVisible, setRatingVisible] = useState(true);

    // Initialize session when opening, if not already initialized
    useEffect(() => {
        if (open && !sessionId) {
            setSessionId(crypto.randomUUID());
            setRatingVisible(true); // Reset visibility on new session
        }
    }, [open, sessionId]);

    // Reset conversation when task changes
    useEffect(() => {
        setQuestion('');
        setAnswer(null);
        setError(null);
        setLoading(false);
        setMessages([]);
        setSessionId(null); // This will allow the open effect to create a new session
        setRating(null);
    }, [taskMeta?.id]);

    // Persist conversation whenever messages or rating change
    useEffect(() => {
        if (sessionId && taskMeta?.id && taskMeta?.title && messages.length > 0) {
            const timVersion = import.meta.env.VITE_TIM_VERSION;
            trainingService.saveTimConversation(
                sessionId,
                taskMeta.id,
                taskMeta.title,
                messages, // feedback is part of message object now, so saved in JSON too!
                rating ?? undefined,
                timVersion
            ).catch(err => console.warn('Failed to save Tim conversation:', err));
        }
    }, [sessionId, messages, rating, taskMeta]);

    const remaining = useMemo(() => MAX_LEN - question.length, [question]);

    const askTim = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!question.trim()) {
            setError('Bitte gib eine Frage ein.');
            return;
        }
        if (question.trim().length > MAX_LEN) {
            setError(`Deine Frage darf maximal ${MAX_LEN} Zeichen enthalten.`);
            return;
        }

        try {
            setError(null);
            setLoading(true);
            setAnswer(null);

            const contextPreview = (() => {
                try {
                    if (!taskContext) return null;
                    const s = JSON.stringify(taskContext);
                    return s.length > 1000 ? s.slice(0, 1000) + '…' : s;
                } catch {
                    return '[unserializable context]';
                }
            })();

            // Optimistically add user message
            const newMessages: Message[] = [
                ...messages,
                { role: 'user', content: question.trim() },
            ];
            setMessages(newMessages);
            setQuestion(''); // Clear input early

            const res = await fetch('/.netlify/functions/ask-tim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.trim(),
                    taskMeta: taskMeta ?? null,
                    taskContext: taskContext ?? null,
                    contextPreview,
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Fehler beim Anfragen der Antwort.');
            }
            const data = (await res.json()) as { answer?: string; error?: string };
            if (data.error) throw new Error(data.error);

            const got = data.answer ?? 'Ich konnte leider keine Antwort erzeugen.';

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: got },
            ]);
            setAnswer(got);

        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unerwarteter Fehler.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = (r: number) => {
        setRating(r);
    };

    const handleMessageFeedback = async (index: number, isHelpful: boolean) => {
        // Optimistic UI update
        const msg = messages[index];
        if (!sessionId || !msg) return;

        // Update local state
        const newMessages = [...messages];
        newMessages[index] = { ...msg, feedback: isHelpful };
        setMessages(newMessages);

        // Get context: The question should be the message before this one
        const context = {
            question: index > 0 ? messages[index - 1].content : '[No context]',
            answer: msg.content
        };

        // Send to server (separate table)
        try {
            const timVersion = import.meta.env.VITE_TIM_VERSION;
            await trainingService.rateTimMessage(sessionId, index, context, isHelpful, timVersion);
        } catch (e) {
            console.warn('Failed to rate message:', e);
        }
    };

    return {
        question,
        setQuestion,
        answer,
        loading,
        error,
        messages,
        sessionId,
        rating,
        ratingVisible,
        setRatingVisible,
        remaining,
        askTim,
        handleRating,
        handleMessageFeedback,
        MAX_LEN
    };
};
