import React, {useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../auth';
import SpeechBubble from './components/SpeechBubble/SpeechBubble.component';
import StatusBar from './components/StatusBar/StatusBar.component';
import './onboarding.page.scss';

interface OnboardingSlide {
  getText: (name: string) => string;
  buttonLabel: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    getText: name =>
      `Hey ${name}! Schön, dass du endlich da bist. Ich habe hier ein echtes Problem…`,
    buttonLabel: 'Weiter',
  },
  {
    getText: () =>
      'Der Rechner hier springt einfach nicht mehr an. Ich habe schon alles versucht, aber es scheint ein tiefgehendes Hardware-Problem zu sein.',
    buttonLabel: 'Weiter',
  },
  {
    getText: () =>
      'Lass uns mal einen Blick ins Innere machen und das Mainboard anschauen. Wir müssen die Komponenten einzeln untersuchen, um den Fehler zu finden. Bist du bereit für unsere Mission?',
    buttonLabel: 'Hardware prüfen',
  },
];

const OnboardingPage: React.FC = () => {
  const {userProfile, updateProfile} = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const displayName = userProfile?.displayName?.split(' ')[0] || 'Spieler';

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const handleNext = useCallback(async () => {
    if (transitioning) return;

    if (isLastSlide) {
      // Persist onboarding completion
      try {
        await updateProfile({
          progress: {
            ...(userProfile?.progress ?? {
              totalPoints: 0,
              level: 0,
              achievements: [],
              completedTasks: [],
              statistics: {
                tasksCompleted: 0,
                timeSpent: 0,
                avgTaskTime: 0,
                lastActivity: new Date().toISOString(),
              },
            }),
            hasCompletedOnboarding: true,
          },
        });
      } catch (err) {
        console.error('[Onboarding] Failed to persist completion:', err);
      }
      navigate('/dashboard', {replace: true});
    } else {
      setTransitioning(true);
      // Brief fade-out before switching slide
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setTransitioning(false);
      }, 250);
    }
  }, [isLastSlide, transitioning, navigate, updateProfile, userProfile]);

  return (
    <div className="onboarding-page">
      <div className="onboarding-page__content">
        <div className="onboarding-page__character">
          <img
            src="/timothy.svg"
            alt="Tim"
            className="onboarding-page__character-img"
          />
        </div>

        <div
          className={`onboarding-page__dialogue ${transitioning ? 'onboarding-page__dialogue--fade-out' : ''}`}>
          <SpeechBubble key={currentSlide} text={slide.getText(displayName)} />

          <button className="onboarding-page__btn" onClick={handleNext}>
            {slide.buttonLabel}
            <span className="onboarding-page__btn-chevron">›</span>
          </button>
        </div>
      </div>

      {/* Slide progress dots */}
      <div className="onboarding-page__dots">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`onboarding-page__dot ${i === currentSlide ? 'onboarding-page__dot--active' : ''}`}
          />
        ))}
      </div>

      <StatusBar />
    </div>
  );
};

export default OnboardingPage;
