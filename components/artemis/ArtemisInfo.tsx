'use client';

import React, { useState } from 'react';
import type { ArtemisMission } from '@/lib/artemisData';
import { artemisData } from '@/lib/artemisData';
import styles from './ArtemisInfo.module.css';

interface ArtemisInfoProps {
  mission: ArtemisMission;
  onClose: () => void;
  isVisible: boolean;
}

type TabType = 'overview' | 'crew' | 'hardware' | 'science' | 'timeline';

export default function ArtemisInfo({ mission, onClose, isVisible }: ArtemisInfoProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Mission Overview</div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Mission:</span>
                <span className={styles.value}>{mission.name}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Launch Date:</span>
                <span className={styles.value}>{mission.date}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.value} ${styles[mission.crewed ? 'crewed' : 'uncrewed']}`}>
                  {mission.crewed ? '👨‍🚀 Crewed' : '🤖 Uncrewed'}
                </span>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Primary Objectives</div>
              <ul className={styles.objectivesList}>
                {mission.objectives.map((objective, idx) => (
                  <li key={idx} className={styles.objectiveItem}>
                    <span className={styles.objectiveBullet}>→</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Key Facts</div>
              <div className={styles.factsGrid}>
                {mission.facts.map((fact, idx) => (
                  <div key={idx} className={styles.factCard}>
                    <span className={styles.factIcon}>✓</span>
                    <span className={styles.factText}>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'crew':
        return (
          <div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Mission Crew</div>
              {mission.crewed && mission.crew ? (
                <div className={styles.crewList}>
                  {mission.crew.map((member, idx) => {
                    const [name, role] = member.split(' - ');
                    const crewDetails = artemisData.crew[name];
                    return (
                      <div key={idx} className={styles.crewCard}>
                        <div className={styles.crewHeader}>
                          <span className={styles.crewName}>{name}</span>
                          <span className={styles.crewRole}>{role}</span>
                        </div>
                        {crewDetails && (
                          <div className={styles.crewBio}>{crewDetails}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.sectionInfo}>
                  This is an uncrewed test flight. No astronauts aboard.
                </div>
              )}
            </div>
          </div>
        );

      case 'hardware':
        return (
          <div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Mission Hardware</div>
              <div className={styles.hardwareList}>
                {mission.hardware.map((hw, idx) => {
                  const hardwareInfo = artemisData.hardware[hw];
                  return (
                    <div key={idx} className={styles.hardwareCard}>
                      <div className={styles.hardwareName}>{hw}</div>
                      {hardwareInfo && (
                        <div className={styles.hardwareDesc}>{hardwareInfo}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Key Systems</div>
              <div className={styles.systemsGrid}>
                <div className={styles.systemCard}>
                  <div className={styles.systemIcon}>🚀</div>
                  <div className={styles.systemName}>Launch Vehicle</div>
                  <div className={styles.systemValue}>SLS Block 1</div>
                </div>
                <div className={styles.systemCard}>
                  <div className={styles.systemIcon}>🛰️</div>
                  <div className={styles.systemName}>Spacecraft</div>
                  <div className={styles.systemValue}>Orion</div>
                </div>
                <div className={styles.systemCard}>
                  <div className={styles.systemIcon}>⚡</div>
                  <div className={styles.systemName}>Service Module</div>
                  <div className={styles.systemValue}>ESA (European)</div>
                </div>
                <div className={styles.systemCard}>
                  <div className={styles.systemIcon}>🛡️</div>
                  <div className={styles.systemName}>Heat Shield</div>
                  <div className={styles.systemValue}>Avcoat</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'science':
        return (
          <div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Science Goals</div>
              <div className={styles.sectionInfo}>
                Each Artemis mission advances our understanding of deep space exploration
                and prepares for sustained human presence on the Moon.
              </div>
              <div className={styles.scienceList}>
                {mission.objectives.filter(obj =>
                  obj.toLowerCase().includes('test') ||
                  obj.toLowerCase().includes('validate') ||
                  obj.toLowerCase().includes('science')
                ).map((goal, idx) => (
                  <div key={idx} className={styles.scienceCard}>
                    <span className={styles.scienceIcon}>🔬</span>
                    <span className={styles.scienceText}>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Long-term Impact</div>
              <div className={styles.impactGrid}>
                <div className={styles.impactCard}>
                  <div className={styles.impactTitle}>🌙 Lunar Science</div>
                  <div className={styles.impactDesc}>
                    Understanding Moon formation, water ice, and resources
                  </div>
                </div>
                <div className={styles.impactCard}>
                  <div className={styles.impactTitle}>🚀 Mars Prep</div>
                  <div className={styles.impactDesc}>
                    Testing technologies for future Mars missions
                  </div>
                </div>
                <div className={styles.impactCard}>
                  <div className={styles.impactTitle}>🔬 Deep Space</div>
                  <div className={styles.impactDesc}>
                    Studying radiation and long-duration human spaceflight
                  </div>
                </div>
                <div className={styles.impactCard}>
                  <div className={styles.impactTitle}>🌍 Earth Benefits</div>
                  <div className={styles.impactDesc}>
                    New technologies and international collaboration
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Artemis Program Timeline</div>
              <div className={styles.timeline}>
                {artemisData.timeline.map((yearData, idx) => (
                  <div key={idx} className={styles.timelineYear}>
                    <div className={styles.timelineYearLabel}>{yearData.year}</div>
                    <div className={styles.timelineMilestones}>
                      {yearData.milestones.map((milestone, midx) => (
                        <div key={midx} className={styles.timelineMilestone}>
                          <span className={styles.milestoneDot}></span>
                          <span className={styles.milestoneText}>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Future Vision</div>
              <div className={styles.visionCard}>
                <p className={styles.visionText}>
                  The Artemis program aims to establish a sustained human presence on and around
                  the Moon by the end of the decade, serving as a proving ground for Mars exploration
                  and inspiring the next generation of space explorers.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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

      <div className={styles.header}>
        <h2 className={styles.missionTitle}>{mission.name}</h2>
        <p className={styles.missionSubtitle}>NASA Artemis Program</p>
      </div>

      <div className={styles.tabList}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'crew' ? styles.active : ''}`}
          onClick={() => setActiveTab('crew')}
        >
          Crew
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'hardware' ? styles.active : ''}`}
          onClick={() => setActiveTab('hardware')}
        >
          Hardware
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'science' ? styles.active : ''}`}
          onClick={() => setActiveTab('science')}
        >
          Science
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </div>

      <div className={styles.scrollContent}>
        {renderTabContent()}
      </div>

      {/* Artemis branding footer */}
      <div className={styles.footer}>
        <img src="/images/ArtemisLogo.jpg" alt="Artemis Logo" className={styles.footerLogo} />
        <span className={styles.footerText}>Moon to Mars</span>
      </div>
    </div>
  );
}
