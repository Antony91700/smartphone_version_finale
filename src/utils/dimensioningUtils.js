import { DRAWING_CONFIG as DC } from './drawingConstants';

const drawArrowhead = (context, x, y, isStart, isVertical, scale) => {
  if (!context) return;

  const arrowLength = DC.ARROW_LENGTH / scale;
  const angle = Math.PI / 6;

  context.beginPath();
  context.moveTo(x, y);

  if (isVertical) {
    const sign = isStart ? 1 : -1;
    context.lineTo(
      x - arrowLength * Math.sin(angle),
      y - sign * arrowLength * Math.cos(angle)
    );
    context.moveTo(x, y);
    context.lineTo(
      x + arrowLength * Math.sin(angle),
      y - sign * arrowLength * Math.cos(angle)
    );
  } else {
    const sign = isStart ? 1 : -1;
    context.lineTo(
      x - sign * arrowLength * Math.cos(angle),
      y - arrowLength * Math.sin(angle)
    );
    context.moveTo(x, y);
    context.lineTo(
      x - sign * arrowLength * Math.cos(angle),
      y + arrowLength * Math.sin(angle)
    );
  }
  context.stroke();
};

export const drawHorizontalExtensionLines = (context, point, scale, drawingColor = 'white') => {
  if (!context) return;

  const extensionLength = DC.EXTENSION_LENGTH / scale;
  
  context.beginPath();
  context.moveTo(point.x - extensionLength, point.y);
  context.lineTo(point.x + extensionLength, point.y);
  context.strokeStyle = drawingColor === 'white' ? DC.COLORS.DIMENSION : '#000000';
  context.lineWidth = DC.LINE_WIDTH.EXTENSION / scale;
  context.stroke();
};

export const drawParallelogramDimensionLine = (context, start, end, scale, text, offset = 50, drawingColor = 'white') => {
  if (!context || !start || !end) return;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const translation = { x: offset / scale, y: 0 };

  // Special case for rightmost parallelogram (P3-P"3-P"1-P1)
  const isDoubleOffset = Math.abs(offset) === DC.DIMENSION_OFFSET * 2;
  if (isDoubleOffset && start === end) {
    // Calculate P"3 position (2 offsets to the right of P3)
    const p3Prime = {
      x: start.x + (2 * DC.DIMENSION_OFFSET) / scale,
      y: start.y
    };

    // Calculate slope of P3-P2 line
    const slope = dy / dx;
    
    // Find intersection with P1's horizontal line (P"1)
    const p1Prime = {
      x: p3Prime.x - (p3Prime.y - end.y) / slope,
      y: end.y
    };

    // Draw the parallelogram
    context.beginPath();
    context.moveTo(start.x, start.y); // P3
    context.lineTo(p3Prime.x, p3Prime.y); // P"3
    context.lineTo(p1Prime.x, p1Prime.y); // P"1
    context.lineTo(end.x, end.y); // P1
    context.strokeStyle = drawingColor === 'white' ? DC.COLORS.DIMENSION : '#000000';
    context.lineWidth = DC.LINE_WIDTH.DIMENSION / scale;
    context.stroke();

    // Add measurement text
    if (text) {
      const midX = (p3Prime.x + p1Prime.x) / 2;
      const midY = (p3Prime.y + p1Prime.y) / 2;
      
      context.save();
      context.fillStyle = drawingColor === 'white' ? DC.COLORS.TEXT : '#000000';
      context.font = `${DC.FONT_SIZE / scale}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.translate(midX, midY);
      context.rotate(Math.atan2(dy, dx));
      context.fillText(text, 0, -8/scale);
      context.restore();
    }
    return;
  }

  // Standard parallelogram drawing
  const translatedStart = { x: start.x + translation.x, y: start.y + translation.y };
  const translatedEnd = { x: end.x + translation.x, y: end.y + translation.y };

  context.save();
  context.strokeStyle = drawingColor === 'white' ? DC.COLORS.DIMENSION : '#000000';
  context.lineWidth = DC.LINE_WIDTH.DIMENSION / scale;

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(translatedStart.x, translatedStart.y);
  context.lineTo(translatedEnd.x, translatedEnd.y);
  context.lineTo(end.x, end.y);
  context.stroke();

  if (text) {
    context.fillStyle = drawingColor === 'white' ? DC.COLORS.TEXT : '#000000';
    context.font = `${DC.FONT_SIZE / scale}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const midX = (translatedStart.x + translatedEnd.x) / 2;
    const midY = (translatedStart.y + translatedEnd.y) / 2;
    
    context.save();
    context.translate(midX, midY);
    context.rotate(Math.atan2(dy, dx));
    context.fillText(text, 0, -8/scale);
    context.restore();
  }

  context.restore();
};