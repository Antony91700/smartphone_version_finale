import { DRAWING_CONFIG as DC } from './drawingConstants';
import { calculateDistance } from './geometryUtils';
import { drawParallelogramDimensionLine, drawHorizontalExtensionLines } from './dimensioningUtils';

export const drawImage = (context, image, position, scale) => {
  if (!context || !image) return;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.save();
  context.translate(position.x, position.y);
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);
  context.restore();
};

const drawPoint = (context, point, index, scale, drawingColor, isSelected = false, isEditMode = false) => {
  if (!context || !point) return;
  
  // Point plus visible avec bordure
  const pointRadius = Math.max(DC.POINT_RADIUS, 8 / scale); // Taille minimum plus grande
  
  // Effet de sélection en mode édition
  if (isEditMode && isSelected) {
    // Halo de sélection
    context.beginPath();
    context.arc(point.x, point.y, pointRadius + 8/scale, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(255, 165, 0, 0.3)'; // Orange translucide
    context.fill();
    
    // Animation de pulsation (simulée avec un cercle plus grand)
    context.beginPath();
    context.arc(point.x, point.y, pointRadius + 12/scale, 0, 2 * Math.PI);
    context.strokeStyle = '#FFA500'; // Orange
    context.lineWidth = 2/scale;
    context.stroke();
  }
  
  // Cercle extérieur (bordure)
  context.beginPath();
  context.arc(point.x, point.y, pointRadius + 2/scale, 0, 2 * Math.PI);
  context.fillStyle = drawingColor === 'white' ? '#000000' : '#FFFFFF';
  context.fill();
  
  // Cercle intérieur (point principal)
  context.beginPath();
  context.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
  context.fillStyle = isSelected && isEditMode ? '#FFA500' : DC.COLORS.POINT; // Orange si sélectionné
  context.fill();
  
  // Texte du point avec meilleure visibilité
  context.fillStyle = drawingColor === 'white' ? 'white' : 'black';
  context.font = `bold ${Math.max(DC.FONT_SIZE, 16)/scale}px Arial`; // Police plus grande et en gras
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  
  // Ombre pour le texte
  context.shadowColor = drawingColor === 'white' ? 'black' : 'white';
  context.shadowBlur = 2/scale;
  context.shadowOffsetX = 1/scale;
  context.shadowOffsetY = 1/scale;
  
  context.fillText(`P${index + 1}`, point.x + (pointRadius + 8)/scale, point.y);
  
  // Reset shadow
  context.shadowColor = 'transparent';
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  
  // Indicateur de déplacement en mode édition
  if (isEditMode && !isSelected) {
    // Petites flèches pour indiquer que le point est déplaçable
    const arrowSize = 4/scale;
    const arrowOffset = pointRadius + 15/scale;
    
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Flèche droite
    context.beginPath();
    context.moveTo(point.x + arrowOffset, point.y);
    context.lineTo(point.x + arrowOffset - arrowSize, point.y - arrowSize/2);
    context.lineTo(point.x + arrowOffset - arrowSize, point.y + arrowSize/2);
    context.closePath();
    context.fill();
    
    // Flèche gauche
    context.beginPath();
    context.moveTo(point.x - arrowOffset, point.y);
    context.lineTo(point.x - arrowOffset + arrowSize, point.y - arrowSize/2);
    context.lineTo(point.x - arrowOffset + arrowSize, point.y + arrowSize/2);
    context.closePath();
    context.fill();
  }
};

const drawSegment = (context, start, end, color, scale) => {
  if (!context || !start || !end) return;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = color;
  context.lineWidth = Math.max(DC.LINE_WIDTH.SEGMENT, 4)/scale; // Ligne plus épaisse
  context.stroke();
};

const drawDimensioning = (context, points, scale, visibleRatios, drawingColor) => {
  if (!context || points.length !== 3) return;

  const distance23 = calculateDistance(points[1], points[2]);
  const distance31 = calculateDistance(points[2], points[0]);
  const distance12 = calculateDistance(points[0], points[1]);

  // Draw extension lines for all points
  points.forEach(point => drawHorizontalExtensionLines(context, point, scale, drawingColor));

  // Draw left side dimensioning
  drawParallelogramDimensionLine(
    context,
    points[0],
    points[1],
    scale,
    `${Math.round(distance12)} px`,
    -DC.DIMENSION_OFFSET,
    drawingColor
  );

  if (visibleRatios.ratio23to12) {
    drawParallelogramDimensionLine(
      context,
      points[1],
      points[2],
      scale,
      `${Math.round((distance23 / distance12) * 100)}%`,
      -DC.DIMENSION_OFFSET * 2,
      drawingColor
    );
  }

  // Draw right side dimensioning
  drawParallelogramDimensionLine(
    context,
    points[0],
    points[2],
    scale,
    `${Math.round(distance31)} px`,
    DC.DIMENSION_OFFSET,
    drawingColor
  );

  if (visibleRatios.ratio23to31) {
    drawParallelogramDimensionLine(
      context,
      points[1],
      points[2],
      scale,
      `${Math.round((distance23 / distance31) * 100)}%`,
      DC.DIMENSION_OFFSET * 2,
      drawingColor
    );
  }
};

export const drawPoints = (context, points, position, scale, visibleRatios, drawingColor = 'white', draggedPointIndex = null, isEditMode = false) => {
  if (!context || !points || points.length === 0) return;

  try {
    context.save();
    context.translate(position.x, position.y);
    context.scale(scale, scale);

    // Draw segments
    if (points.length > 1) {
      // Always draw P1-P2 segment in blue
      drawSegment(context, points[0], points[1], DC.COLORS.SEGMENT_1, scale);

      if (points.length === 3) {
        // P2-P3 segment in red
        drawSegment(context, points[1], points[2], DC.COLORS.SEGMENT_2, scale);
        
        // Draw dimensioning system
        drawDimensioning(context, points, scale, visibleRatios, drawingColor);
      }
    }

    // Draw points on top with enhanced visibility and edit mode indicators
    points.forEach((point, index) => {
      const isSelected = draggedPointIndex === index;
      drawPoint(context, point, index, scale, drawingColor, isSelected, isEditMode);
    });

    context.restore();
  } catch (error) {
    console.error('Error in drawPoints:', error);
  }
};