import React from 'react';
import './AskTimInput.component.scss';

interface AskTimInputProps {
  question: string;
  setQuestion: (q: string) => void;
  loading: boolean;
  remaining: number;
  MAX_LEN: number;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

export const AskTimInput: React.FC<AskTimInputProps> = ({
  question,
  setQuestion,
  loading,
  remaining,
  MAX_LEN,
  onSubmit,
  error
}) => {
  return (
    <form onSubmit={onSubmit} className="asktim-body">
      <textarea
        id="asktim-text"
        className="asktim-textarea"
        maxLength={MAX_LEN}
        placeholder="Stell deine Frage..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
        disabled={loading}
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
      />
      <div className="asktim-meta">
        <span className={`asktim-remaining ${remaining < 0 ? 'error' : ''}`}>
          {remaining}
        </span>
        <button
          type="submit"
          className="task-action-btn primary"
          disabled={loading || question.trim().length === 0}>
          ➤
        </button>
      </div>
      {error && <div className="asktim-error">{error}</div>}
    </form>
  );
};
