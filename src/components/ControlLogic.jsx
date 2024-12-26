import { boards } from "./Boards";

const BOARD_SIZE = 10;

export function isValidMove(targetX, targetY, currentX, currentY) 
{
  const withinBounds =
    targetX >= 0 &&
    targetX < BOARD_SIZE &&
    targetY >= 0 &&
    targetY < BOARD_SIZE;

  const manhattanDistance = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

  return withinBounds && manhattanDistance === 1;
}

export function move() 
{
  const board = boards;
  let hasMoved = false;

  const { rowIndex, colIndex } = board.getCurrentPosition("A");
  const safeMoves = boards.findSafeCells(rowIndex, colIndex);

  if (safeMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * safeMoves.length);
    const { new_x: nextX, new_y: nextY } = safeMoves[randomIndex];
    hasMoved = board.makeMove(nextX, nextY, rowIndex, colIndex);

  
    if (board.initialGrid[nextX][nextY] === "G") {
      console.log("Gold Found at:", nextX, nextY);
    }
  } else {
    //jodi safe moves na thake tkhn random selection
    const directions = [
      { dx: 1, dy: 0 }, // Down
      { dx: -1, dy: 0 }, // Up
      { dx: 0, dy: 1 }, // Right
      { dx: 0, dy: -1 }, // Left
    ];

  
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    for (const { dx, dy } of shuffledDirections) {
      const targetX = rowIndex + dx;
      const targetY = colIndex + dy;

      if (isValidMove(targetX, targetY, rowIndex, colIndex)) {
        hasMoved = board.makeMove(targetX, targetY, rowIndex, colIndex);
        break;
      }
    }
  }

  return !hasMoved; 
}
