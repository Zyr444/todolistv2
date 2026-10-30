import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 -z-10"
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
            resize: true,
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.35 } },
          },
        },
        particles: {
          color: { value: '#6b8db5' },
          links: {
            color: '#3e6a9e',
            distance: 150,
            enable: true,
            opacity: 0.15,
            width: 0.7,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'bounce' },
            random: true,
            speed: 0.35,
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80,
          },
          opacity: {
            value: { min: 0.1, max: 0.45 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.08,
            },
          },
          shape: { type: 'circle' },
          size: {
            value: { min: 0.8, max: 2.2 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
