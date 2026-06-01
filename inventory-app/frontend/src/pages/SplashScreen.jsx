import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Initializing workspace', duration: 600 },
  { label: 'Loading inventory data', duration: 700 },
  { label: 'Syncing orders & customers', duration: 600 },
  { label: 'Ready', duration: 400 },
];

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=loading, 2=exit
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepsDone, setStepsDone] = useState([]);

  useEffect(() => {
    // Phase 0: show logo for 900ms, then transition to loading
    const t = setTimeout(() => setPhase(1), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 1) return;

    let isMounted = true;

    let currentStep = 0;
    let currentProgress = 0;

    const runStep = (idx) => {
      if (!isMounted) return;

      if (idx >= STEPS.length) {
        setTimeout(() => setPhase(2), 300);
        setTimeout(() => onComplete?.(), 1000);
        return;
      }

      setStep(idx);

      const targetProgress = Math.round(
        ((idx + 1) / STEPS.length) * 100
      );

      const stepDuration = STEPS[idx].duration;
      const tickInterval = 16;
      const ticks = stepDuration / tickInterval;
      const progressPerTick =
      (targetProgress - currentProgress) / ticks;

      let ticked = 0;

      const ticker = setInterval(() => {
        if (!isMounted) {
          clearInterval(ticker);
          return;
        }

        ticked++;

        currentProgress = Math.min(
          currentProgress + progressPerTick,
          targetProgress
        );

        setProgress(Math.round(currentProgress));

        if (ticked >= ticks) {
          clearInterval(ticker);

          setStepsDone((prev) => [...prev, idx]);

          currentStep = idx + 1;

          setTimeout(() => runStep(currentStep), 80);
        }
      }, tickInterval);
    };

    runStep(0);

    return () => {
      isMounted = false;
    };
  }, [phase, onComplete]);

  return (
    <div
      className={`splash-root ${phase === 2 ? 'splash-exit' : ''}`}
      aria-label="Loading"
    >
      {/* Background grid */}
      <div className="splash-grid" />
      {/* Radial glow */}
      <div className="splash-glow" />
      {/* Scanline overlay */}
      <div className="splash-scanlines" />

      <div className="splash-center">
        {/* Logo mark */}
        <div className={`splash-logo-wrap ${phase >= 1 ? 'splash-logo-up' : ''}`}>
          <div className="splash-logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="1" />
              <rect x="16" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="2" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="splash-wordmark">
            <span className="splash-brand">ARCUS</span>
            <span className="splash-brand-sub">inventory</span>
          </div>
        </div>

        {/* Loading panel */}
        <div className={`splash-panel ${phase === 1 ? 'splash-panel-in' : ''} ${phase === 2 ? 'splash-panel-out' : ''}`}>
          {/* Progress bar */}
          <div className="splash-bar-track">
            <div className="splash-bar-fill" style={{ width: `${progress}%` }} />
            <div className="splash-bar-glow" style={{ left: `${progress}%` }} />
          </div>

          {/* Steps */}
          <div className="splash-steps">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`splash-step
                  ${i === step && phase === 1 ? 'splash-step-active' : ''}
                  ${stepsDone.includes(i) ? 'splash-step-done' : ''}
                  ${i > step ? 'splash-step-pending' : ''}
                `}
              >
                <span className="splash-step-dot">
                  {stepsDone.includes(i) ? (
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <polyline points="1.5,4 3,5.5 6.5,2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className={i === step && phase === 1 ? 'splash-dot-pulse' : ''} />
                  )}
                </span>
                <span className="splash-step-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Counter */}
          <div className="splash-counter">
            <span className="splash-pct">{progress}</span>
            <span className="splash-pct-sym">%</span>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="splash-corner splash-corner-tl" />
      <div className="splash-corner splash-corner-br" />
    </div>
  );
}
