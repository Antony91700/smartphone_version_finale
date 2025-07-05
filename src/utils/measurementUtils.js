export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};