import React from 'react';
import './AskTimMessage.component.scss';
import { Message } from '../hooks/useAskTimConversation';

interface AskTimMessageProps {
  message: Message;
  index: number;
  onFeedback: (index: number, isHelpful: boolean) => void;
}

export const AskTimMessage: React.FC<AskTimMessageProps> = ({ message, index, onFeedback }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`asktim-bubble ${isAssistant ? 'assistant' : 'user'}`}>
      <div className="asktim-bubble-title">
        {isAssistant ? 'Tim' : 'Du'}
      </div>
      <div className="asktim-bubble-content">{message.content}</div>
      
      {/* Feedback UI for Assistant Messages */}
      {isAssistant && (
        <div className="asktim-message-feedback">
          <button 
             className={message.feedback === true ? 'active' : ''} 
             onClick={() => onFeedback(index, true)}
             aria-label="Hilfreich"
             title="Diese Antwort war hilfreich">
             👍
          </button>
          <button 
             className={message.feedback === false ? 'active' : ''} 
             onClick={() => onFeedback(index, false)}
             aria-label="Nicht hilfreich"
             title="Diese Antwort war nicht hilfreich">
             👎
          </button>
        </div>
      )}
    </div>
  );
};
