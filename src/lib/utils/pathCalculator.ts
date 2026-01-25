import { parseMove } from './moveParser';
import { gridToSvg } from './coordinateConverter';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates path coordinates from moves
 */
export function calculatePathCoordinates(
  moves: string[],
  startX: number,
  startY: number
): Point[] {
  const points: Point[] = [];
  let currentX = startX;
  let currentY = startY;

  // Add starting point
  points.push({ x: currentX, y: currentY });

  // Process each move
  for (const move of moves) {
    const { dx, dy } = parseMove(move);
    currentX += dx;
    currentY += dy;
    points.push({ x: currentX, y: currentY });
  }

  return points;
}

/**
 * Builds SVG path string from grid coordinates
 */
export function buildPathString(points: Point[], cellSize: number): string {
  if (points.length === 0) return '';

  const svgPoints = points.map((p) => gridToSvg(p.x, p.y, cellSize));
  const first = svgPoints[0];
  let path = `M ${first.x} ${first.y}`;

  for (let i = 1; i < svgPoints.length; i++) {
    path += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
  }

  return path;
}

/**
 * Calculates the total length of a path in SVG coordinates
 */
export function calculatePathLength(points: Point[], cellSize: number): number {
  if (points.length < 2) return 0;

  let totalLength = 0;
  const svgPoints = points.map((p) => gridToSvg(p.x, p.y, cellSize));

  for (let i = 1; i < svgPoints.length; i++) {
    const dx = svgPoints[i].x - svgPoints[i - 1].x;
    const dy = svgPoints[i].y - svgPoints[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return totalLength;
}
