'use client'
import { useSearchParams } from 'next/navigation'
import MeteorImpactPage from '@/components/meteors/MeteorImpactPage'

export default function ImpactPage() {
  const params = useSearchParams()

  // Read meteor data from query string, fallback to defaults
  const mass = Number(params.get('mass')) || 2.7e19       // kg
  const diameter = Number(params.get('diameter')) || 226e3 // meters
  const speed = Number(params.get('speed')) || 25e3       // m/s
  const name = params.get('name') || 'Demo Meteor'
  const angle = Number(params.get('angle')) || 90
  const density = Number(params.get('density')) || 2700


  const meteor = { name, mass, diameter, speed, angle, density }

  return <MeteorImpactPage meteor={meteor} />
}
