/**
 * Parses a move command string (e.g., "2R", "3B", "2RB") into dx/dy coordinates
 */
export function parseMove(move: string): { dx: number; dy: number } {
  const match = move.match(/^(\d+)([LRTB]+)$/);
  if (!match) return { dx: 0, dy: 0 };

  const distance = parseInt(match[1], 10);
  const directions = match[2];

  let dx = 0;
  let dy = 0;

  for (const dir of directions) {
    switch (dir) {
      case "L":
        dx -= distance;
        break;
      case "R":
        dx += distance;
        break;
      case "T":
        dy -= distance;
        break;
      case "B":
        dy += distance;
        break;
    }
  }

  return { dx, dy };
}
