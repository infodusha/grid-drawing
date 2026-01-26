import { parseMove } from "../../geometry/moveParser";
import { gridToSvg } from "../../geometry/coordinateConverter";

/**
 * Calculates the length of the common prefix between two move arrays
 */
export function calculateCommonPathLength(
  moves: string[],
  commonLength: number,
  startX: number,
  startY: number,
  cellSize: number,
): number {
  if (commonLength === 0) return 0;

  let x = startX;
  let y = startY;
  const svgPoints: Array<{ x: number; y: number }> = [
    gridToSvg(x, y, cellSize),
  ];

  for (let i = 0; i < commonLength; i++) {
    const { dx, dy } = parseMove(moves[i]);
    x += dx;
    y += dy;
    svgPoints.push(gridToSvg(x, y, cellSize));
  }

  let commonPathLength = 0;
  for (let i = 1; i < svgPoints.length; i++) {
    const dx = svgPoints[i].x - svgPoints[i - 1].x;
    const dy = svgPoints[i].y - svgPoints[i - 1].y;
    commonPathLength += Math.sqrt(dx * dx + dy * dy);
  }

  return commonPathLength;
}

/**
 * Finds the common prefix length between two move arrays
 */
export function findCommonPrefixLength(
  previousMoves: string[],
  currentMoves: string[],
): number {
  let commonLength = 0;
  for (
    let i = 0;
    i < Math.min(previousMoves.length, currentMoves.length);
    i++
  ) {
    if (previousMoves[i] === currentMoves[i]) {
      commonLength++;
    } else {
      break;
    }
  }
  return commonLength;
}
