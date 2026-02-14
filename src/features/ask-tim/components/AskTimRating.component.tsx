import React from 'react';
import './AskTimRating.component.scss';

interface AskTimRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  onDismiss: () => void;
  visible: boolean;
}

export const AskTimRating: React.FC<AskTimRatingProps> = ({
  rating,
  onRate,
  onDismiss,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="asktim-rating-container">
       <button className="asktim-rating-close" onClick={onDismiss} aria-label="Rating schließen">
          ✕
       </button>
       <div className="asktim-rating">
         <span>War das hilfreich?</span>
         <div className="stars">
           {[1, 2, 3, 4, 5].map((star) => (
             <span
               key={star}
               className={`star ${rating && rating >= star ? 'filled' : ''}`}
               onClick={() => onRate(star)}
               title={`${star} Stern${star > 1 ? 'e' : ''}`}
             >
               ★
             </span>
           ))}
         </div>
       </div>
    </div>
  );
};
