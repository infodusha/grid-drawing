export interface Point {
  x: number;
  y: number;
}

export interface GridDimensions {
  width: number;
  height: number;
  cellSize: number;
}

export interface GridItem {
  id: string;
  name: string;
  tags: string[];
}
