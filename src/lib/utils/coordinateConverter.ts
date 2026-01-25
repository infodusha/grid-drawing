/**
 * Converts grid coordinates to SVG coordinates
 * Aligns with grid lines (not centered in cells)
 */
export function gridToSvg(x: number, y: number, cellSize: number): { x: number; y: number } {
  return {
    x: x * cellSize,
    y: y * cellSize
  };
}
