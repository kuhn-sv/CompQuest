import React, { useRef, useEffect } from 'react';
import './AskTimMessageList.component.scss';
import { Message } from '../hooks/useAskTimConversation';
import { AskTimMessage } from './AskTimMessage.component';

interface AskTimMessageListProps {
  messages: Message[];
  loading: boolean;
  answer: string | null;
  onFeedback: (index: number, isHelpful: boolean) => void;
}

export const AskTimMessageList: React.FC<AskTimMessageListProps> = ({ 
  messages, 
  loading, 
  answer, 
  onFeedback 
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (messages.length === 0 && !answer && !loading) {
    return (
      <div className="asktim-conversation" ref={listRef}>
        <div className="asktim-empty">
          Keine Unterhaltung vorhanden.
        </div>
      </div>
    );
  }

  return (
    <div className="asktim-conversation" ref={listRef}>
      {messages.map((m, idx) => (
        <AskTimMessage 
          key={`msg:${idx}`} 
          message={m} 
          index={idx} 
          onFeedback={onFeedback} 
        />
      ))}
      {loading && (
         <div className="asktim-bubble assistant">
            <div className="asktim-bubble-title">Tim</div>
            <div className="asktim-bubble-content typing">...</div>
         </div>
      )}
    </div>
  );
};
