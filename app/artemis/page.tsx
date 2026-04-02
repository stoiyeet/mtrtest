'use client'; 

import { Suspense, useEffect } from 'react';
import ArtemisClient from './ArtemisClient';

export const metadata = {
  title: 'Artemis Program | Asteroid Impact Simulator',
  description: 'Explore NASA\'s Artemis program - returning humans to the Moon and preparing for Mars missions.',
  openGraph: {
    title: 'Artemis Program',
    description: 'Interactive exploration of NASA\'s Artemis lunar missions',
    images: ['https://glb.asteroidstrike.earth/images/ArtemisLogo2.png'],
  },
};

  // --- Visit counting logic ---
  useEffect(() => {
    const hasVisited = document.cookie.split("; ").find(row => row.startsWith("visited="));
    if (!hasVisited) {
      // first visit -> increment counter
      fetch("/api/visits", { method: "POST" });
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      document.cookie = `visited=true; path=/; expires=${expires.toUTCString()}`;
    }
  }, []);

export default function ArtemisPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading Artemis Mission...</div>
      </div>
    }>
      <ArtemisClient />
    </Suspense>
  );
}
