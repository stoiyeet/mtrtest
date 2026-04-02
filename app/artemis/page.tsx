import { Suspense } from 'react';
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
