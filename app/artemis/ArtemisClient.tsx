'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { artemisData, type ArtemisMission } from '@/lib/artemisData';
import ArtemisInfo from '@/components/artemis/ArtemisInfo';
import styles from './ArtemisPage.module.css';
import { SPEED_CONFIG } from '@/lib/artemisFlightPath';

// Dynamically import the 3D scene to avoid SSR issues
const ArtemisScene = dynamic(() => import('@/components/artemis/ArtemisScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <div className="text-white text-lg">Loading 3D Scene...</div>
    </div>
  ),
});

export default function ArtemisClient() {
  const [selectedMission, setSelectedMission] = useState<ArtemisMission | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Timeline state
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation loop with variable speed
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      setT((prev) => {
        // Base increment for ~30 seconds
        let increment = 0.001;

        // Check if we're in a speed boost section
        for (const boost of SPEED_CONFIG.speedBoosts) {
          if (prev >= boost.startT && prev <= boost.endT) {
            increment *= boost.multiplier;
            break;
          }
        }

        const next = prev + increment;
        return next > 1 ? 1 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, SPEED_CONFIG.speedBoosts]);

  // Auto-stop at end
  useEffect(() => {
    if (t >= 1) setPlaying(false);
  }, [t]);

  const handleSpacecraftClick = () => {
    // If animation hasn't started, start it
    if (!animationStarted) {
      setAnimationStarted(true);
      setPlaying(true);
      return;
    }

    // Otherwise show mission info
    const artemisII = artemisData.missions.find(m => m.name === 'Artemis II');
    setSelectedMission(artemisII || artemisData.missions[1]);
    setIsInfoVisible(true);
  };

  const handleMissionSelect = (mission: ArtemisMission) => {
    setSelectedMission(mission);
    setIsInfoVisible(true);
  };

  const handleCloseInfo = () => {
    setIsInfoVisible(false);
    setSelectedMission(null);
  };

  const handleStartAnimation = () => {
    setAnimationStarted(true);
    setPlaying(true);
    setT(0);
  };

  const handleResetAnimation = () => {
    setT(0);
    setPlaying(false);
  };

  return (
    <div className={styles.container}>
      {/* 3D Scene */}
      <div className={styles.sceneContainer}>
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <ArtemisScene
            onSpacecraftClick={handleSpacecraftClick}
            onHoverChange={setHoveredObject}
            animationProgress={t}
            isAnimating={animationStarted}
          />
        </Suspense>
      </div>

      {/* Hover tooltip / Start prompt */}
      {!animationStarted && hoveredObject && !isInfoVisible && (
        <div className={styles.hoverTooltip}>
          <p>Click to start Artemis I flight path</p>
        </div>
      )}

      {hoveredObject && animationStarted && !isInfoVisible && (
        <div className={styles.hoverTooltip}>
          <p>Click to learn more about {hoveredObject}</p>
        </div>
      )}

      {/* Mission selector overlay - bottom left */}
      <div className={styles.missionSelector}>
        <h3>Artemis Missions</h3>
        <div className={styles.missionList}>
          {artemisData.missions.map((mission) => (
            <button
              key={mission.name}
              onClick={() => handleMissionSelect(mission)}
              className={`${styles.missionButton} ${
                selectedMission?.name === mission.name ? styles.active : ''
              }`}
            >
              <span className={styles.missionName}>{mission.name}</span>
              <span className={styles.missionDate}>{mission.date}</span>
              {mission.crewed && <span className={styles.crewedBadge}>Crewed</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Info Panel - slides in from right */}
      {isInfoVisible && selectedMission && (
        <ArtemisInfo
          mission={selectedMission}
          onClose={handleCloseInfo}
          isVisible={isInfoVisible}
        />
      )}

      {/* Easter egg - Artemis logo watermark */}
      <div className={styles.artemisWatermark}>
        <img src="/images/ArtemisLogo2.png" alt="Artemis" />
      </div>

      {/* Program overview - top left */}
      <div className={styles.programOverview}>
        <h1>Artemis Program</h1>
        <p>Returning humans to the Moon</p>
        <div className={styles.tagline}>
          <span>🌙</span>
          <span>Preparing for Mars</span>
        </div>
      </div>

      {/* Timeline controls - bottom bar */}
      {animationStarted && (
        <div className={styles.timelineBar}>
          <div className={styles.timelineInner}>
            {!playing ? (
              <button
                onClick={handleStartAnimation}
                className={styles.timelineButton}
                title="Start animation"
              >
                ▶
              </button>
            ) : (
              <button
                onClick={() => setPlaying(false)}
                className={styles.timelineButton}
                title="Pause animation"
              >
                ⏸
              </button>
            )}

            <div className={styles.timelineSlider}>
              <span className={styles.timelineLabel}>Launch</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={t}
                onChange={(e) => setT(parseFloat(e.target.value))}
                className={styles.timelineInput}
              />
              <span className={styles.timelineLabel}>Splashdown</span>
            </div>

            <button
              onClick={handleResetAnimation}
              className={styles.timelineButton}
              title="Reset"
            >
              ↻
            </button>

            <div className={styles.timelineStatus}>
              {t < 0.10 && 'Loop 1'}
              {t >= 0.10 && t < 0.25 && 'Loop 2'}
              {t >= 0.25 && t < 0.45 && 'Loop 3'}
              {t >= 0.45 && t < 0.70 && 'Trans-Lunar'}
              {t >= 0.70 && t < 0.85 && 'Moon Flyby'}
              {t >= 0.85 && 'Return'}
            </div>
          </div>
        </div>
      )}

      {/* Start button (before animation starts) */}
      {!animationStarted && (
        <div className={styles.startPrompt}>
          <button onClick={handleStartAnimation} className={styles.startButton}>
            <span className={styles.startIcon}>🚀</span>
            <span>Start Artemis I Flight</span>
          </button>
          <p className={styles.startHint}>Or click the spacecraft</p>
        </div>
      )}
    </div>
  );
}
