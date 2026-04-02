'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { artemisData, type CrewMember } from '@/lib/artemisData';
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
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [showMobileCrewMenu, setShowMobileCrewMenu] = useState(false);

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
    setShowMissionBrief(true);
    setSelectedCrew(null);
    setIsInfoVisible(true);
  };

  const handleCrewSelect = (crew: CrewMember) => {
    setSelectedCrew(crew);
    setShowMissionBrief(false);
    setIsInfoVisible(true);
    setShowMobileCrewMenu(false);
  };

  const handleCloseInfo = () => {
    setIsInfoVisible(false);
    setSelectedCrew(null);
    setShowMissionBrief(false);
  };

  const handleStartAnimation = () => {
    setAnimationStarted(true);
    setPlaying(true);
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

      {hoveredObject && animationStarted && !isInfoVisible && (
        <div className={styles.hoverTooltip}>
          <p>Click for mission briefing</p>
        </div>
      )}

      {/* Crew selector overlay - bottom left */}
      <div className={styles.missionSelector}>
        <h3>ARTEMIS II CREW</h3>
        <div className={styles.missionList}>
          {artemisData.crew.map((crew) => (
            <button
              key={crew.name}
              onClick={() => handleCrewSelect(crew)}
              className={`${styles.missionButton} ${
                selectedCrew?.name === crew.name ? styles.active : ''
              }`}
            >
              <span className={styles.missionName}>{crew.name}</span>
              <span className={styles.missionDate}>{crew.role}</span>
              <span className={styles.crewedBadge}>{crew.agency}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Panel - slides in from right */}
      {isInfoVisible && (
        <ArtemisInfo
          crew={selectedCrew}
          showMission={showMissionBrief}
          onClose={handleCloseInfo}
          isVisible={isInfoVisible}
        />
      )}

      {/* Easter egg - Artemis logo watermark */}
      <div className={styles.artemisWatermark}>
        <Image
          src="https://glb.asteroidstrike.earth/images/ArtemisLogo2.png"
          alt="Artemis"
          width={80}
          height={80}
          quality={75}
          priority={false}
        />
      </div>

      {/* Program overview - top left */}
      <div className={styles.programOverview}>
        <h1>ARTEMIS II</h1>
        <p>First crewed lunar flyby in 50+ years</p>
        <div className={styles.tagline}>
          <span>🌙</span>
          <span>Gateway to Mars</span>
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
              {t < 0.13 && 'Loop 1'}
              {t >= 0.13 && t < 0.3 && 'Loop 2'}
              {t >= 0.3 && t < 0.5 && 'Loop 3'}
              {t >= 0.5 && t < 0.6 && 'Trans-Lunar'}
              {t >= 0.60 && t < 0.75 && 'Moon Flyby'}
              {t >= 0.75 && 'Return'}
            </div>
          </div>
        </div>
      )}

      {/* Start button (before animation starts) */}
      {!animationStarted && (
        <div className={styles.startPrompt}>
          <button onClick={handleStartAnimation} className={styles.startButton}>
            <span className={styles.startIcon}>🚀</span>
            <span>Start Artemis II Flight</span>
          </button>
          <p className={styles.startHint}>Or click the spacecraft</p>
        </div>
      )}

      {/* Mobile crew menu button */}
      <button
        className={styles.mobileCrewButton}
        onClick={() => setShowMobileCrewMenu(true)}
        aria-label="Open crew menu"
      >
        <span className={styles.menuIcon}>👥</span>
        <span className={styles.menuText}>CREW</span>
      </button>

      {/* Mobile crew menu overlay */}
      {showMobileCrewMenu && (
        <div className={styles.mobileCrewOverlay}>
          <div className={styles.mobileCrewPanel}>
            <div className={styles.mobileCrewHeader}>
              <h3>ARTEMIS II CREW</h3>
              <button
                onClick={() => setShowMobileCrewMenu(false)}
                className={styles.mobileCrewClose}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className={styles.mobileCrewList}>
              {artemisData.crew.map((crew) => (
                <button
                  key={crew.name}
                  onClick={() => handleCrewSelect(crew)}
                  className={styles.mobileCrewItem}
                >
                  <Image
                    src={crew.image}
                    alt={crew.name}
                    width={80}
                    height={80}
                    className={styles.mobileCrewPhoto}
                    quality={85}
                  />
                  <div className={styles.mobileCrewInfo}>
                    <span className={styles.mobileCrewName}>{crew.name}</span>
                    <span className={styles.mobileCrewRole}>{crew.role}</span>
                    <span className={styles.mobileCrewAgency}>{crew.agency}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
