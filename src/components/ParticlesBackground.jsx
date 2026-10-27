import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
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
            grab: { distance: 120, links: { opacity: 0.3 } },
          },
        },
        particles: {
          color: { value: '#7c9cbf' },
          links: {
            color: '#4a6fa5',
            distance: 130,
            enable: true,
            opacity: 0.18,
            width: 0.8,
          },
          collisions: { enable: false },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'bounce' },
            random: true,
            speed: 0.4,
            straight: false,
          },
          number: {
            density: { enable: true, area: 900 },
            value: 70,
          },
          opacity: {
            value: { min: 0.15, max: 0.4 },
            animation: {
              enable: true,
              speed: 0.6,
              minimumValue: 0.1,
            },
          },
          shape: { type: 'circle' },
          size: {
            value: { min: 1, max: 2.5 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
