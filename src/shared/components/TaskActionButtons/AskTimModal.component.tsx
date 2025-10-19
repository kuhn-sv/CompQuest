import React, {useEffect, useMemo, useRef, useState} from 'react';
import './AskTimModal.component.scss';
import {trainingService} from '../../../services/supabase/training.service';

interface AskTimModalProps {
  open: boolean;
  onClose: () => void;
  taskMeta?: {
    id: string;
    title: string;
    level?: string;
  };
  // Optional structured context describing the currently visible task.
  // Each task component can supply whatever shape is useful (title, prompt,
  // variables). The object will be forwarded to the server and included in
  // the system/user prompt sent to the assistant.
  taskContext?: unknown;
}

const MAX_LEN = 250;

const TIM_VERSION = '0.2';

const AskTimModal: React.FC<AskTimModalProps> = ({
  open,
  onClose,
  taskMeta,
  taskContext,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{role: 'user' | 'assistant'; content: string}>
  >([]);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when closing
      setQuestion('');
      setAnswer(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Scroll to bottom when modal opens or messages change
  useEffect(() => {
    if (open && conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [open, messages]);

  const remaining = useMemo(() => MAX_LEN - question.length, [question]);

  const askTim = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Prepare a lightweight stringified context for debugging/logging.
      const contextPreview = (() => {
        try {
          if (!taskContext) return null;
          const s = JSON.stringify(taskContext);
          return s.length > 1000 ? s.slice(0, 1000) + '…' : s;
        } catch {
          return '[unserializable context]';
        }
      })();

      // include prior messages so the assistant receives the chat history
      const res = await fetch('/api/ask-tim', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          question: question.trim(),
          taskMeta: taskMeta ?? null,
          taskContext: taskContext ?? null,
          contextPreview,
          messages,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Fehler beim Anfragen der Antwort.');
      }
      const data = (await res.json()) as {answer?: string; error?: string};
      if (data.error) throw new Error(data.error);
      const got = data.answer ?? 'Ich konnte leider keine Antwort erzeugen.';
      // append both user and assistant messages to local history
      setMessages(prev => [
        ...prev,
        {role: 'user', content: question.trim()},
        {role: 'assistant', content: got},
      ]);
      setAnswer(got);
      // clear the input field after successful send
      setQuestion('');

      // Save request/response to Supabase
      if (taskMeta?.id && taskMeta?.title) {
        try {
          await trainingService.recordTimMessage(
            taskMeta.id,
            taskMeta.title,
            taskMeta.level ?? '',
            TIM_VERSION,
            question.trim(),
            data.answer ?? '',
          );
        } catch (err) {
          console.warn('Tim logging failed:', err);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unerwarteter Fehler.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="asktim-overlay" role="dialog" aria-modal="true">
      <div className="asktim-modal">
        <div className="asktim-header">
          <h3>Tim fragen</h3>
          <button
            className="asktim-close"
            onClick={onClose}
            aria-label="Schließen">
            ✕
          </button>
        </div>

        <div className="asktim-content">
          <div className="asktim-panel">
            <div className="asktim-conversation" ref={conversationRef}>
              {messages.length === 0 && !answer && !loading && (
                <div className="asktim-empty">
                  Keine Unterhaltung vorhanden.
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={`msg:${idx}`}
                  className={`asktim-bubble ${m.role === 'assistant' ? 'assistant' : 'user'}`}>
                  <div className="asktim-bubble-title">
                    {m.role === 'assistant' ? 'Tim' : 'Du'}
                  </div>
                  <div className="asktim-bubble-content">{m.content}</div>
                </div>
              ))}
            </div>

            <form onSubmit={askTim} className="asktim-body">
              <label htmlFor="asktim-text" className="asktim-label">
                Stell deine Frage (max. {MAX_LEN} Zeichen)
              </label>
              <textarea
                id="asktim-text"
                className="asktim-textarea"
                maxLength={MAX_LEN}
                placeholder="Z. B.: Ich verstehe nicht, wie ich die Zahl in Binär umwandle. Kannst du es Schritt für Schritt erklären?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={loading}
                rows={6}
              />
              <div className="asktim-meta">
                <span
                  className={`asktim-remaining ${remaining < 0 ? 'error' : ''}`}>
                  {remaining} Zeichen übrig
                </span>
                <button
                  type="submit"
                  className="task-action-btn primary"
                  disabled={loading || question.trim().length === 0}>
                  {loading ? 'Frage wird beantwortet…' : 'Frage senden'}
                </button>
              </div>
              {error && <div className="asktim-error">{error}</div>}
            </form>
          </div>

          <div className="asktim-illustration">
            <img src="/timothy.svg" alt="Tim" className="asktim-avatar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskTimModal;
