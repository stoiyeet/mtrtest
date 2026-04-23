'use client';

import React from 'react';
import Image from 'next/image';
import type { CrewMember } from '@/lib/artemisData';
import { artemisData } from '@/lib/artemisData';
import styles from './ArtemisInfo.module.css';

interface ArtemisInfoProps {
  crew?: CrewMember | null;
  showMission?: boolean;
  onClose: () => void;
  isVisible: boolean;
}

export default function ArtemisInfo({ crew, showMission, onClose, isVisible }: ArtemisInfoProps) {
  const renderCrewProfile = () => {
    if (!crew) return null;

    return (
      <div>
        <div className={styles.crewHeader}>
          <Image
            src={crew.image}
            alt={crew.name}
            width={140}
            height={140}
            className={styles.crewPhoto}
            quality={85}
            priority={false}
            unoptimized
          />
          <div className={styles.crewTitle}>
            <h2 className={styles.crewName}>{crew.name}</h2>
            <p className={styles.crewRole}>{crew.role}</p>
            <span className={styles.crewAgency}>{crew.agency}</span>
            {crew.callsign && (
              <span className={styles.callsign}>CALLSIGN: &quot;{crew.callsign}&quot;</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.headline}>{crew.headline}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>PROFILE</div>
          {crew.bio.map((paragraph, idx) => (
            <p key={idx} className={styles.bioText}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>KEY ACHIEVEMENTS</div>
          <ul className={styles.achievementsList}>
            {crew.achievements.map((achievement, idx) => (
              <li key={idx} className={styles.achievementItem}>
                <span className={styles.achievementBullet}>▸</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderMissionBrief = () => {
    const mission = artemisData.mission;

    return (
      <div>
        <div className={styles.missionHeader}>
          <h2 className={styles.missionTitle}>{mission.title}</h2>
          <p className={styles.missionTagline}>{mission.tagline}</p>
          <div className={styles.missionMeta}>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>LAUNCH:</span> {mission.launchDate}
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>DURATION:</span> {mission.duration}
            </span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>MISSION HIGHLIGHTS</div>
          <ul className={styles.highlightsList}>
            {mission.highlights.map((highlight, idx) => (
              <li key={idx} className={styles.highlightItem}>
                <span className={styles.highlightBullet}>→</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>SIGNIFICANCE</div>
          <p className={styles.significanceText}>{mission.significance}</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>NEXT STEPS</div>
          <div className={styles.nextStepsGrid}>
            {mission.nextSteps.map((step, idx) => (
              <div key={idx} className={styles.nextStepCard}>
                <span className={styles.stepNumber}>{idx + 1}</span>
                <span className={styles.stepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.infoPanel} ${!isVisible ? styles.collapsed : ''}`}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close panel"
      >
        ×
      </button>

      <div className={styles.scrollContent}>
        {showMission ? renderMissionBrief() : renderCrewProfile()}
      </div>

      {/* Artemis branding footer */}
      <div className={styles.footer}>
        <Image
          src="https://glb.asteroidstrike.earth/images/ArtemisLogo.jpg"
          alt="Artemis Logo"
          width={64}
          height={32}
          className={styles.footerLogo}
          quality={85}
          unoptimized
        />
        <span className={styles.footerText}>Gateway to Mars</span>
      </div>
    </div>
  );
}
