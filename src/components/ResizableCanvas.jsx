import React from 'react';
import { Box } from '@chakra-ui/react';
import { Canvas } from './Canvas';

export function ResizableCanvas({
  image,
  scale,
  position,
  points,
  isPlacingPoints,
  isEditing,
  measurements,
  drawingColor,
  onTouchGesture,
  canvasRef,
  setPoints,
  draggedPointIndex,
  setDraggedPointIndex
}) {
  return (
    <Box 
      position="relative" 
      width="100vw"
      height="100vh"
      overflow="hidden"
      bg="black"
    >
      <Canvas
        ref={canvasRef}
        image={image}
        scale={scale}
        position={position}
        points={points}
        isPlacingPoints={isPlacingPoints}
        isEditing={isEditing}
        measurements={measurements}
        drawingColor={drawingColor}
        onTouchGesture={onTouchGesture}
        setPoints={setPoints}
        draggedPointIndex={draggedPointIndex}
        setDraggedPointIndex={setDraggedPointIndex}
      />
    </Box>
  );
}