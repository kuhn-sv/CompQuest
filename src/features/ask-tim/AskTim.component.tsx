import React from 'react';
import './AskTim.component.scss';
import { useAskTimConversation } from './hooks/useAskTimConversation';
import { AskTimInput } from './components/AskTimInput.component';
import { AskTimMessageList } from './components/AskTimMessageList.component';
import { AskTimRating } from './components/AskTimRating.component';


interface AskTimModalProps {
  open: boolean;
  onClose: () => void;
  taskMeta?: {
    id: string;
    title: string;
    level?: string;
  };
  // Optional structured context describing the currently visible task.
  taskContext?: unknown;
}

const AskTimModal: React.FC<AskTimModalProps> = ({
  open,
  onClose,
  taskMeta,
  taskContext,
}) => {
  const {
    question,
    setQuestion,
    answer,
    loading,
    error,
    messages,
    rating,
    ratingVisible,
    setRatingVisible,
    remaining,
    askTim,
    handleRating,
    handleMessageFeedback,
    MAX_LEN
  } = useAskTimConversation({ open, taskMeta, taskContext });

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

        <div className="asktim-separator" />

        <div className="asktim-content">
          <div className="asktim-panel">
            <AskTimMessageList 
              messages={messages} 
              loading={loading} 
              answer={answer} 
              onFeedback={handleMessageFeedback} 
            />

            <div className="asktim-controls">
               {/* Rating UI - Separate Component */}
               {messages.length > 0 && (
                 <AskTimRating 
                    rating={rating}
                    onRate={handleRating}
                    onDismiss={() => setRatingVisible(false)}
                    visible={ratingVisible}
                 />
               )}

              <AskTimInput 
                question={question}
                setQuestion={setQuestion}
                loading={loading}
                remaining={remaining}
                MAX_LEN={MAX_LEN}
                onSubmit={askTim}
                error={error}
              />
            </div>
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
