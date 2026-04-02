'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { artemisData, type ArtemisMission } from '@/lib/artemisData';
import ArtemisInfo from '@/components/artemis/ArtemisInfo';
import styles from './ArtemisPage.module.css';

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

  const handleSpacecraftClick = () => {
    // Show Artemis II mission by default (current/upcoming mission)
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

  return (
    <div className={styles.container}>
      {/* 3D Scene */}
      <div className={styles.sceneContainer}>
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <ArtemisScene
            onSpacecraftClick={handleSpacecraftClick}
            onHoverChange={setHoveredObject}
          />
        </Suspense>
      </div>

      {/* Hover tooltip */}
      {hoveredObject && !isInfoVisible && (
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
    </div>
  );
}
