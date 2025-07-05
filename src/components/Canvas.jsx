import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useGesture } from '@use-gesture/react';
import { drawImage, drawPoints } from '../utils/canvasUtils';
import { PrecisionCrosshair } from './PrecisionCrosshair';

export const Canvas = forwardRef(({
  image,
  scale,
  position,
  points,
  isPlacingPoints,
  isEditing,
  measurements,
  drawingColor,
  onTouchGesture,
  setPoints,
  draggedPointIndex,
  setDraggedPointIndex
}, ref) => {
  const contextRef = useRef(null);
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 });
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const longPressTimerRef = useRef(null);
  const vibrationPatternRef = useRef(null);

  useEffect(() => {
    try {
      if (!ref.current) return;
      
      const canvas = ref.current;
      const context = canvas.getContext('2d');
      
      // Canvas plein écran
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      contextRef.current = context;
      draw();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du canvas:', error);
    }
  }, [image, scale, position, points, measurements, drawingColor, draggedPointIndex]);

  // Fonction pour démarrer la vibration progressive
  const startProgressiveVibration = () => {
    try {
      if (!navigator.vibrate) return;
      
      // Vibration progressive : faible au début, plus forte à la fin
      let intensity = 0;
      vibrationPatternRef.current = setInterval(() => {
        intensity += 10;
        navigator.vibrate(Math.min(intensity, 50));
      }, 100);
    } catch (error) {
      console.error('Erreur vibration:', error);
    }
  };

  // Fonction pour arrêter la vibration
  const stopProgressiveVibration = () => {
    try {
      if (vibrationPatternRef.current) {
        clearInterval(vibrationPatternRef.current);
        vibrationPatternRef.current = null;
      }
    } catch (error) {
      console.error('Erreur arrêt vibration:', error);
    }
  };

  // Configuration des gestes avec React-Use-Gesture
  const bind = useGesture({
    // Drag (pan)
    onDrag: ({ delta: [dx, dy], pinching, cancel, dragging, xy: [x, y], first, last }) => {
      try {
        if (pinching) cancel(); // Annuler le drag pendant le pinch
        
        if (isEditing && draggedPointIndex !== null) {
          // Mode déplacement de point
          if (first) {
            setIsDraggingPoint(true);
          }
          
          onTouchGesture('pan', { 
            deltaX: dx, 
            deltaY: dy,
            currentX: x,
            currentY: y
          });
          
          if (last) {
            setIsDraggingPoint(false);
            onTouchGesture('dragEnd', {});
          }
        } else if (!isPlacingPoints && !isEditing && dragging) {
          // Pan normal de l'image
          onTouchGesture('pan', { deltaX: dx, deltaY: dy });
        }
      } catch (error) {
        console.error('Erreur lors du drag:', error);
      }
    },
    
    // Pinch (zoom)
    onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
      try {
        onTouchGesture('pinchZoom', { 
          scale: scale, 
          center: { x: ox, y: oy } 
        });
      } catch (error) {
        console.error('Erreur lors du pinch:', error);
      }
    },
    
    // Click/Tap simple
    onClick: ({ event }) => {
      try {
        if (isEditing) {
          const rect = ref.current.getBoundingClientRect();
          const coords = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
          onTouchGesture('tap', coords);
        }
      } catch (error) {
        console.error('Erreur lors du click:', error);
      }
    },
    
    // Double tap
    onDoubleClick: ({ event }) => {
      try {
        const rect = ref.current.getBoundingClientRect();
        const coords = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        onTouchGesture('doubleTap', coords);
      } catch (error) {
        console.error('Erreur lors du double click:', error);
      }
    },
    
    // Gestion du touch pour le mode précision (placement initial)
    onPointerDown: ({ event }) => {
      try {
        if (!isPlacingPoints) return;
        
        const rect = ref.current.getBoundingClientRect();
        const coords = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        
        // Afficher immédiatement le crosshair
        setCrosshairPosition(coords);
        setShowCrosshair(true);
        setIsLongPressing(true);
        
        // Démarrer la vibration progressive
        startProgressiveVibration();
        
        // Timer pour long press avec feedback progressif
        longPressTimerRef.current = setTimeout(() => {
          try {
            // Vibration finale plus forte
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]); // Pattern de confirmation
            }
            
            const imageCoords = {
              x: (coords.x - position.x) / scale,
              y: (coords.y - position.y) / scale
            };
            
            onTouchGesture('longTap', imageCoords);
            
            // Masquer le crosshair après placement
            setShowCrosshair(false);
            setIsLongPressing(false);
            stopProgressiveVibration();
          } catch (error) {
            console.error('Erreur lors du long press:', error);
          }
        }, 600); // Légèrement plus long pour plus de précision
      } catch (error) {
        console.error('Erreur lors du pointer down:', error);
      }
    },
    
    onPointerMove: ({ event }) => {
      try {
        if (!isPlacingPoints || !isLongPressing) return;
        
        // Mettre à jour la position du crosshair en temps réel
        const rect = ref.current.getBoundingClientRect();
        const coords = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        setCrosshairPosition(coords);
      } catch (error) {
        console.error('Erreur lors du pointer move:', error);
      }
    },
    
    onPointerUp: () => {
      try {
        if (!isPlacingPoints) return;
        
        // Nettoyer si on relâche avant la fin du timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        
        setShowCrosshair(false);
        setIsLongPressing(false);
        stopProgressiveVibration();
      } catch (error) {
        console.error('Erreur lors du pointer up:', error);
      }
    }
  }, {
    // Configuration
    drag: {
      threshold: isEditing && draggedPointIndex !== null ? 5 : 15, // Seuil plus bas pour l'édition de points
      filterTaps: !isEditing // Permettre les taps en mode édition
    },
    pinch: {
      scaleBounds: { min: 0.1, max: 8 }, // Zoom maximum augmenté pour plus de précision
      rubberband: true
    }
  });

  const draw = () => {
    try {
      if (!contextRef.current || !ref.current) return;

      const ctx = contextRef.current;
      const canvas = ref.current;

      // Clear canvas avec fond noir
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      if (image) {
        drawImage(ctx, image, position, scale);
      }

      // Draw points, lines, and measurements
      if (points.length > 0) {
        const visibleRatios = measurements ? {
          ratio23to31: measurements.showRatio2313,
          ratio23to12: measurements.showRatio2312
        } : {};
        
        drawPoints(ctx, points, position, scale, visibleRatios, drawingColor, draggedPointIndex, isEditing);
      }
    } catch (error) {
      console.error('Erreur lors du dessin:', error);
    }
  };

  // Déterminer le curseur selon le mode
  const getCursor = () => {
    try {
      if (isPlacingPoints) return 'none'; // Masquer le curseur en mode précision
      if (isEditing) return 'pointer'; // Curseur pointer en mode édition
      if (isDraggingPoint) return 'grabbing'; // Curseur de déplacement
      return 'grab'; // Curseur par défaut
    } catch (error) {
      console.error('Erreur cursor:', error);
      return 'grab';
    }
  };

  return (
    <Box w="100%" h="100%" position="relative">
      <canvas
        ref={ref}
        {...bind()} // Appliquer les gestes
        style={{
          width: '100%',
          height: '100%',
          cursor: getCursor(),
          touchAction: 'none'
        }}
      />
      
      {/* Crosshair de précision pour le placement initial */}
      <PrecisionCrosshair 
        position={crosshairPosition}
        visible={showCrosshair && isPlacingPoints}
        scale={scale}
      />
      
      {/* Indicateur visuel pour le mode édition */}
      {isEditing && (
        <Box
          position="fixed"
          top={4}
          right={4}
          bg="orange.500"
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontSize="sm"
          fontWeight="bold"
          zIndex={1500}
          boxShadow="lg"
        >
          ✏️ Mode édition
          {draggedPointIndex !== null && ` - P${draggedPointIndex + 1}`}
        </Box>
      )}
    </Box>
  );
});