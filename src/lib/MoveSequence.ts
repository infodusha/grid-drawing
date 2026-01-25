export interface MoveSequenceJSON {
  moves: string[];
  startX: number;
  startY: number;
  gridWidth: number;
  gridHeight: number;
}

export class MoveSequence {
  public moves: string[];
  public startX: number;
  public startY: number;
  public gridWidth: number;
  public gridHeight: number;

  constructor(
    moves: string[] = [],
    startX: number = 0,
    startY: number = 0,
    gridWidth: number = 10,
    gridHeight: number = 10,
  ) {
    this.moves = [...moves];
    this.startX = startX;
    this.startY = startY;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  static validateMove(move: string): boolean {
    const movePattern = /^(\d+)([LRTB]+)$/;
    return movePattern.test(move);
  }

  private validateMoveOrThrow(move: string): void {
    if (!MoveSequence.validateMove(move)) {
      throw new Error(
        `Invalid move format: "${move}". Expected format: number followed by direction letters (L, R, T, B). Example: "2R", "3B", "2RB"`,
      );
    }
  }

  toJSON(): MoveSequenceJSON {
    return {
      moves: [...this.moves],
      startX: this.startX,
      startY: this.startY,
      gridWidth: this.gridWidth,
      gridHeight: this.gridHeight,
    };
  }

  static fromJSON(json: MoveSequenceJSON) {
    return new MoveSequence(
      json.moves,
      json.startX,
      json.startY,
      json.gridWidth,
      json.gridHeight,
    );
  }

  addMove(move: string) {
    this.validateMoveOrThrow(move);
    this.moves.push(move);
  }

  removeMove(index?: number) {
    if (this.moves.length === 0) {
      return;
    }

    if (index === undefined) {
      this.moves.pop();
    } else {
      if (index < 0 || index >= this.moves.length) {
        throw new Error(
          `Index ${index} is out of bounds for moves array of length ${this.moves.length}`,
        );
      }
      this.moves.splice(index, 1);
    }
  }

  clearMoves() {
    this.moves = [];
  }

  clone() {
    return new MoveSequence(
      [...this.moves],
      this.startX,
      this.startY,
      this.gridWidth,
      this.gridHeight,
    );
  }
}
