"use client";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "../components/LoadingScreen";
import Joyride from "react-joyride";

const EarthScene = dynamic(() => import("@/components/EarthHome"), { ssr: false });

export default function Home(): React.ReactElement {
  const [phase, setPhase] = useState<"loading" | "project">("loading");
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  const steps = [
    {
      target: "#nav-impact",
      content: "Explore theoretical impacts of real and custom meteor strikes",
    },
    {
      target: "#nav-mitigation",
      content: "Simulate modern mitigation techniques for asteroid threats",
    },
  ];

  useEffect(() => {
    const duration = 2600; 
    const start = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf: number;

    const update = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1); // 0 → 1
      const eased = easeOutCubic(t);

      setProgress(eased * 100);

      if (t < 1) {
        raf = requestAnimationFrame(update);
      } else {
        setProgress(100);
        setSceneReady(true);
        setTimeout(() => setPhase("project"), 400);
      }
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* API Link */}
      <div className="absolute top-4 right-4 z-50 hidden md:flex flex-col items-center">
        <a
          href="https://stoiyeet.github.io/AsteroidStrike/"
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 7V3.5L18.5 9H15z" />
          </svg>
          API
        </a>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
          Try Endpoint
        </span>
      </div>

      {/* Tour */}
      {mounted && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous
          showSkipButton
          disableScrolling
          styles={{
            options: {
              zIndex: 20,
              backgroundColor: "#0a0a0a",
              primaryColor: "#22d3ee",
              textColor: "#fff",
            },
            buttonNext: { backgroundColor: "#22d3ee", color: "#000" },
            buttonBack: { color: "#888" },
          }}
        />
      )}

      {/* 3D Scene */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: sceneReady ? 1 : 0 }}
        transition={{ duration: 1.8 }}
      >
        <EarthScene />
      </motion.div>

      {/* Content */}
      <section className="absolute inset-0 flex items-center justify-center px-6 md:px-16">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div
              key="loading"
              className="w-full h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingScreen loadingProgress={progress} />
            </motion.div>
          )}

          {phase === "project" && (
            <motion.div
              key="content"
              className="max-w-2xl w-full md:ml-auto md:mr-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Label */}
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
                Simulation Platform
              </p>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                <span className="text-cyan-400">IMPACT</span>
              </h1>

              {/* Description */}
              <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
                Real-time asteroid impact simulation. Model collisions, evaluate outcomes,
                and explore defense strategies through an interactive system.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3 max-w-md">
                <button
                  id="nav-impact"
                  className="px-6 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition"
                  onClick={() => (window.location.href = "/meteors")}
                >
                  Impact Assessment
                </button>

                <button
                  id="nav-mitigation"
                  className="px-6 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition"
                  onClick={() => (window.location.href = "/mitigation")}
                >
                  Mitigation Strategies
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Attribution */}
      <div className="absolute left-4 bottom-4 text-xs text-gray-400">
        <span className="opacity-70">Built by</span>{" "}
        <a
          href="https://www.linkedin.com/in/mark-i-kogan/"
          target="_blank"
          className="hover:text-cyan-300"
        >
          Mark Kogan
        </a>
        <span className="mx-2 text-gray-600">•</span>
        <a
          href="https://www.linkedin.com/in/omid-latifi-2bb380215/"
          target="_blank"
          className="hover:text-cyan-300"
        >
          Omid Latifi
        </a>
      </div>
    </main>
  );
}