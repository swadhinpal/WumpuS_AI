import { play } from "./Play";

export class Boards {
  constructor() {
    this.BOARD_SIZE = 2;
    this.modifiedCells = new Set();
    this.initialGrid = null;
    this.grid = null;
    this.cellVisited = null;
    this.difficultyMode = "Easy";

    this.initEnvironment();
  }

  initEnvironment() {
    play.gameOnInit(1, 5, 1, this.difficultyMode);
    this.cellVisited = Array.from({ length: this.BOARD_SIZE }, () =>
      Array(this.BOARD_SIZE).fill(false)
    );
    this.initialGrid = this.deepCopy(play.getBoard());
    this.grid = this.deepCopy(this.initialGrid);
  }

  deepCopy(array) {
    return JSON.parse(JSON.stringify(array));
  }

  getBoard() {
    return this.grid;
  }

  resetBoard() {
    this.grid = this.deepCopy(this.initialGrid);
    return this.grid;
  }

  getCurrentPosition(element) {
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      const colIndex = this.grid[i].indexOf(element);
      if (colIndex !== -1) {
        return { rowIndex: i, colIndex };
      }
    }
    return { rowIndex: -1, colIndex: -1 };
  }

  findSafeCells(currentX, currentY) {
    const safeCells = [];
    const hazardProbabilities = Array.from({ length: this.BOARD_SIZE }, () =>
      Array(this.BOARD_SIZE).fill(0)
    );

    // Update probabilities based on sensory information
    for (let x = 0; x < this.BOARD_SIZE; x++) {
      for (let y = 0; y < this.BOARD_SIZE; y++) {
        if (!this.isValidCell(x, y)) continue;

        if (this.grid[x][y] === "T") hazardProbabilities[x][y] += 0.3;
        if (this.grid[x][y] === "B") hazardProbabilities[x][y] += 0.3;
      }
    }

    const directions = [
      [currentX + 1, currentY],
      [currentX - 1, currentY],
      [currentX, currentY + 1],
      [currentX, currentY - 1],
    ];

    directions.forEach(([x, y]) => {
      if (
        this.isValidCell(x, y) &&
        hazardProbabilities[x][y] < 0.5
      ) {
        safeCells.push({ x, y });
      }
    });

    return safeCells;
  }

  makeMove(targetX, targetY, currentX, currentY) {
    if (this.isValidCell(targetX, targetY)) {
      this.grid[targetX][targetY] = "A";
      this.grid[currentX][currentY] = this.getCellState(currentX, currentY);
      this.cellVisited[currentX][currentY] = true;
      return true;
    } else {
      console.error("Invalid or unsafe move.");
      return false;
    }
  }

  getCellState(x, y) {
    const cellKey = `${x}-${y}`;
    if (this.modifiedCells.has(cellKey)) {
      return this.initialGrid[x][y];
    }
    return "S";
  }

  updateBoard(nextStep) {
    const { row: nextX, column: nextY } = nextStep;
    const { row: currentX, column: currentY } = play.currentIndex;

    this.grid[currentX][currentY] = this.initialGrid[currentX][currentY];
    this.grid[nextX][nextY] = "A";
    this.cellVisited = play.cellVisited;
  }

  setBoard(newBoard) {
    this.initialGrid = this.deepCopy(newBoard);
    this.grid = this.deepCopy(newBoard);
  }

  clearEnvironment() {
    this.grid = Array.from({ length: this.BOARD_SIZE }, () =>
      Array(this.BOARD_SIZE).fill("")
    );
    this.initialGrid = this.deepCopy(this.grid);
  }

  isValidCell(x, y) {
    return (
      x >= 0 && x < this.BOARD_SIZE &&
      y >= 0 && y < this.BOARD_SIZE
    );
  }
}

export const boards = new Boards();
