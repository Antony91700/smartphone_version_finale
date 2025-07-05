import React from 'react';
import { Box } from '@chakra-ui/react';

export function PrecisionCrosshair({ position, visible, scale = 1 }) {
  if (!visible) return null;

  const crosshairSize = Math.max(40, 60 / scale); // Taille adaptée au zoom
  const lineWidth = Math.max(2, 3 / scale);

  return (
    <Box
      position="fixed"
      left={position.x}
      top={position.y}
      transform="translate(-50%, -50%)"
      pointerEvents="none"
      zIndex={2000}
    >
      {/* Cercle extérieur */}
      <Box
        position="absolute"
        width={`${crosshairSize}px`}
        height={`${crosshairSize}px`}
        border={`${lineWidth}px solid rgba(255, 0, 0, 0.8)`}
        borderRadius="50%"
        transform="translate(-50%, -50%)"
        animation="pulse 1s infinite"
      />
      
      {/* Croix de précision */}
      <Box
        position="absolute"
        width={`${crosshairSize * 0.6}px`}
        height={`${lineWidth}px`}
        bg="rgba(255, 0, 0, 0.9)"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        width={`${lineWidth}px`}
        height={`${crosshairSize * 0.6}px`}
        bg="rgba(255, 0, 0, 0.9)"
        transform="translate(-50%, -50%)"
      />
      
      {/* Point central */}
      <Box
        position="absolute"
        width="4px"
        height="4px"
        bg="red"
        borderRadius="50%"
        transform="translate(-50%, -50%)"
      />

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </Box>
  );
}