'use client';

import { useSearchParams } from 'next/navigation';
import styles from './formulas.module.css';
import Link from 'next/link';

// Using KaTeX for beautiful math equations
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function FormulasPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'overview';

  const formulas = {
    overview: {
      title: "Impact Energy & Basic Calculations",
      equations: [
        {
          title: "Kinetic Energy",
          equation: "E = \\frac{1}{2}mv^2",
          description: "Total impact energy in Joules, where m is mass in kg and v is velocity in m/s"
        },
        {
          title: "Recurrence Period",
          equation: "T_{re} = 109 \\cdot E_{Mt}^{0.78}",
          description: "Average time between impacts of this magnitude in years"
        }
      ]
    },
    thermal: {
      title: "Thermal Radiation Effects",
      equations: [
        {
          title: "Fireball Radius",
          equation: "R_f = 0.002 \\cdot E^{1/3}",
          description: "Radius of the fireball in meters, where E is energy in Joules"
        },
        {
          title: "Thermal Radiation Distance",
          equation: "r = \\sqrt{\\frac{KE}{2\\pi\\Phi}}",
          description: "Distance for a given thermal flux Φ, where K is the luminous efficiency"
        }
      ]
    },
    blast: {
      title: "Air Blast & Overpressure",
      equations: [
        {
          title: "Peak Overpressure (Surface Burst)",
          equation: "p(r) = p_x \\cdot \\frac{(r_x/r)^a}{1 + (r_x/r)^b}",
          description: "Where rx is scaled distance and px is reference pressure"
        },
        {
          title: "Regular Reflection Region",
          equation: "p(r) = p_0 \\cdot e^{-\\alpha r}",
          description: "For airbursts in the regular reflection region"
        }
      ]
    },
    crater: {
      title: "Crater Formation",
      equations: [
        {
          title: "Transient Crater Diameter",
          equation: "D_{tc} = 1.161\\cdot\\left(\\frac{\\rho_i}{\\rho_t}\\right)^{1/3}L^{0.78}v_i^{0.44}g^{-0.22}\\sin^{1/3}\\theta",
          description: "Where ρi is impactor density, ρt is target density, L is diameter, vi is impact velocity"
        },
        {
          title: "Final Crater Diameter",
          equation: "D_{fr} = \\begin{cases} 1.25D_{tc} & D_{tc} < 3200m \\\\ 1.17D_{tc}^{1.13}/3200^{0.13} & D_{tc} \\geq 3200m \\end{cases}",
          description: "Relationship between final and transient crater diameters"
        }
      ]
    },
    seismic: {
      title: "Seismic Effects",
      equations: [
        {
          title: "Richter Magnitude",
          equation: "M = 0.67 \\log_{10}(E) - 5.87",
          description: "Where E is impact energy in Joules"
        },
        {
          title: "Effective Magnitude at Distance",
          equation: "M_{eff} = \\begin{cases} M - 0.0238r & r < 60km \\\\ M - 0.0048r - 1.1644 & 60 \\leq r \\leq 700km \\\\ M - 1.66\\log_{10}(r) - 6.399 & r > 700km \\end{cases}",
          description: "Where r is distance from impact in km"
        }
      ]
    }
  };

  const categoryData = formulas[category as keyof typeof formulas];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/meteors/formulas?category=overview" className={category === 'overview' ? styles.active : ''}>
          Overview
        </Link>
        <Link href="/meteors/formulas?category=thermal" className={category === 'thermal' ? styles.active : ''}>
          Thermal
        </Link>
        <Link href="/meteors/formulas?category=blast" className={category === 'blast' ? styles.active : ''}>
          Blast
        </Link>
        <Link href="/meteors/formulas?category=crater" className={category === 'crater' ? styles.active : ''}>
          Crater
        </Link>
        <Link href="/meteors/formulas?category=seismic" className={category === 'seismic' ? styles.active : ''}>
          Seismic
        </Link>
      </nav>

      <div className={styles.content}>
        <h1>{categoryData.title}</h1>
        
        {categoryData.equations.map((eq, index) => (
          <div key={index} className={styles.equation}>
            <h2>{eq.title}</h2>
            <div className={styles.math}>
              <BlockMath math={eq.equation} />
            </div>
            <p>{eq.description}</p>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <Link href="/meteors" className={styles.backButton}>
          Return to Impact Calculator
        </Link>
      </footer>
    </div>
  );
}
