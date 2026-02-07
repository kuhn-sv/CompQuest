import React from 'react';
import {useTypewriter} from '../../hooks/useTypewriter';
import './SpeechBubble.component.scss';

interface SpeechBubbleProps {
  text: string;
  /** Called when the typewriter finishes or is skipped */
  onComplete?: () => void;
  className?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({text, className}) => {
  const {displayedText, isComplete, skip} = useTypewriter(text, {speed: 30});

  return (
    <div
      className={`speech-bubble ${className ?? ''}`}
      onClick={!isComplete ? skip : undefined}
      role={!isComplete ? 'button' : undefined}
      tabIndex={!isComplete ? 0 : undefined}>
      <div className="speech-bubble__arrow" />

      <span className="speech-bubble__name">TIM</span>
      <hr className="speech-bubble__divider" />

      <p className="speech-bubble__text">
        {displayedText}
        <span
          className={`speech-bubble__cursor ${isComplete ? 'speech-bubble__cursor--hidden' : ''}`}
        />
      </p>
    </div>
  );
};

export default SpeechBubble;
