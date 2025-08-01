import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Rotation {
  x: number;
  y: number;
  z: number;
}

const BouncingDice: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 200, y: 200 });
  const [velocity, setVelocity] = useState<Velocity>({ 
    x: (Math.random() - 0.5) * 8, 
    y: (Math.random() - 0.5) * 8 
  });
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0, z: 0 });
  const [rotationVelocity, setRotationVelocity] = useState<Rotation>({ 
    x: (Math.random() - 0.5) * 10, 
    y: (Math.random() - 0.5) * 10, 
    z: (Math.random() - 0.5) * 10 
  });
  const [currentFace, setCurrentFace] = useState(1);
  const [isHitting, setIsHitting] = useState(false);
  
  const diceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const diceSize = 80; // Bigger dice
  const gravity = 0.15;
  const bounce = 0.85;
  const friction = 0.998;
  const rotationFriction = 0.995;
  const minVelocity = 0.5;

  // Generate random velocity when dice gets too slow
  const generateRandomVelocity = useCallback(() => {
    return {
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12
    };
  }, []);

  // Hit effect
  const triggerHitEffect = useCallback(() => {
    setIsHitting(true);
    setCurrentFace(Math.floor(Math.random() * 6) + 1);
    setTimeout(() => setIsHitting(false), 150);
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;

      const maxX = window.innerWidth - diceSize;
      const maxY = window.innerHeight - diceSize;

      setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        setVelocity(prevVel => {
          let newVelX = prevVel.x * friction;
          let newVelY = (prevVel.y + gravity) * friction;

          // Update position
          newX += newVelX;
          newY += newVelY;

          let hitWall = false;

          // Bounce off walls with corner detection
          if (newX <= 0) {
            newVelX = Math.abs(newVelX) * bounce + Math.random() * 2;
            newX = 0;
            hitWall = true;
          } else if (newX >= maxX) {
            newVelX = -Math.abs(newVelX) * bounce - Math.random() * 2;
            newX = maxX;
            hitWall = true;
          }

          if (newY <= 0) {
            newVelY = Math.abs(newVelY) * bounce + Math.random() * 2;
            newY = 0;
            hitWall = true;
          } else if (newY >= maxY) {
            newVelY = -Math.abs(newVelY) * bounce - Math.random() * 2;
            newY = maxY;
            hitWall = true;
          }

          // Corner bounce detection - add extra velocity for dramatic effect
          if ((newX <= 0 || newX >= maxX) && (newY <= 0 || newY >= maxY)) {
            // Hit corner - add extra bounce
            newVelX *= 1.3;
            newVelY *= 1.3;
            
            // Add random spin
            setRotationVelocity(prev => ({
              x: prev.x + (Math.random() - 0.5) * 20,
              y: prev.y + (Math.random() - 0.5) * 20,
              z: prev.z + (Math.random() - 0.5) * 20,
            }));
          }

          if (hitWall) {
            triggerHitEffect();
            
            // Add rotation velocity on impact
            setRotationVelocity(prev => ({
              x: prev.x + (Math.random() - 0.5) * 15,
              y: prev.y + (Math.random() - 0.5) * 15,
              z: prev.z + (Math.random() - 0.5) * 15,
            }));
          }

          // Keep minimum velocity to prevent dice from getting stuck
          const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
          if (speed < minVelocity && speed > 0.1) {
            const randomVel = generateRandomVelocity();
            newVelX = randomVel.x;
            newVelY = randomVel.y;
          }

          // Add occasional random impulses
          if (Math.random() < 0.005) {
            newVelX += (Math.random() - 0.5) * 6;
            newVelY += (Math.random() - 0.5) * 6;
          }

          return { x: newVelX, y: newVelY };
        });

        return { x: newX, y: newY };
      });

      // Update rotation
      setRotation(prev => {
        setRotationVelocity(prevVel => {
          const newRotVel = {
            x: prevVel.x * rotationFriction,
            y: prevVel.y * rotationFriction,
            z: prevVel.z * rotationFriction,
          };
          return newRotVel;
        });

        return {
          x: prev.x + rotationVelocity.x,
          y: prev.y + rotationVelocity.y,
          z: prev.z + rotationVelocity.z,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [generateRandomVelocity, triggerHitEffect, rotationVelocity]);

  // 3D Dice with sharp edges
  const Dice3D = () => {
    const faces = [
      { dots: 1, transform: 'rotateY(0deg) translateZ(40px)' },
      { dots: 6, transform: 'rotateY(180deg) translateZ(40px)' },
      { dots: 3, transform: 'rotateY(90deg) translateZ(40px)' },
      { dots: 4, transform: 'rotateY(-90deg) translateZ(40px)' },
      { dots: 2, transform: 'rotateX(90deg) translateZ(40px)' },
      { dots: 5, transform: 'rotateX(-90deg) translateZ(40px)' },
    ];

    const dotPositions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
    };

    return (
      <Box
        sx={{
          width: `${diceSize}px`,
          height: `${diceSize}px`,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: isHitting ? 'all 0.1s ease-out' : 'none',
          filter: isHitting 
            ? 'drop-shadow(0 0 25px rgba(255,255,255,0.9)) drop-shadow(0 0 40px rgba(255,255,255,0.6))' 
            : 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(255,255,255,0.2))',
        }}
      >
        {faces.map((face, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: `${diceSize}px`,
              height: `${diceSize}px`,
              backgroundColor: isHitting 
                ? 'rgba(255,255,255,0.4)' 
                : 'rgba(255,255,255,0.15)',
              border: `2px solid ${isHitting ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '2px', // Sharp edges
              transform: face.transform,
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: isHitting 
                ? 'inset 0 0 15px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.6)' 
                : 'inset 2px 2px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {/* Dots */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {dotPositions[face.dots as keyof typeof dotPositions]?.map((pos, dotIndex) => (
                <Box
                  key={dotIndex}
                  sx={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    backgroundColor: isHitting 
                      ? 'rgba(255,255,255,0.9)' 
                      : 'rgba(255,255,255,0.7)',
                    borderRadius: '50%',
                    left: `${pos[0]}%`,
                    top: `${pos[1]}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isHitting
                      ? '0 0 8px rgba(255,255,255,0.8), inset 1px 1px 3px rgba(255,255,255,0.3)'
                      : '0 2px 4px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.3)',
                    border: `1px solid ${isHitting ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}`,
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <Box
        ref={diceRef}
        sx={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          perspective: '1000px',
          cursor: 'pointer',
          pointerEvents: 'auto',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease',
        }}
        onClick={() => {
          // Add random impulse on click
          setVelocity(generateRandomVelocity());
          setRotationVelocity({
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 30,
            z: (Math.random() - 0.5) * 30,
          });
          triggerHitEffect();
        }}
      >
        <Dice3D />
      </Box>
    </Box>
  );
};

export default BouncingDice;