class Play{
  constructor()
  {
      console.log("starting from here ...")
      // wumpus count, pit count, gold count, arrowAvailable
      this.gameOnInit(3,5,2,3)
  }

  /*
      Documentation: (Cell types) 
      =============

      - agentsafe
      - agentstinky
      - agentBreeze
      - agentwumpus
      - agentpit
      - agentgold
        S - (S)afe Cell
        W - (W)umpus
        A - (A)gent
        G - (G)old
        P - (P)it
        T - s(T)ench
        B - (B)reeze
        U - Both (Stench U Breeze)
  */
  gridSize=10
  wumpusCount=0
  pitCount=0
  goldCount=0
  point=0
  moveCount=0
  contiguousRandomMoveCount=0
  foundGold=0
  wumpusDead=0
  threshold=0.5
  UP=0
  DOWN=1
  LEFT=2
  RIGHT=3
  shootDirection!: number
  moveDirection!: number 
  isShoot=false
  gameOver=false
  youWin=false
  youLose=false
  gameOverLine=""  
  isGoldFound=false 
  cheatMode=false 
  collectingGold=false
  discoveredGold = 0;
  wumpusKilled = 0;
  arrowAvailable =0;


  initialBoard = this.generateGrid(10, 10, "S");
  board = this.generateGrid(10, 10, "S");
  cellVisited = this.generateGrid(10, 10, false);
  nearDanger = this.generateGrid(10, 10, false);
  cheatBoard = this.generateGrid(10, 10, "S");
  pitProbability = this.generateGrid(10, 10, 0.0);
  wumpusProbability = this.generateGrid(10, 10, 0.0);
  totalMoves = this.generateGrid(10, 10, 0);

  private generateGrid<T>(rows: number, cols: number, initialValue: T): T[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
  }

  // for tracking agent
  agentIndex = {
      row: 9,
      column: 0,
  };

  currentIndex = {
      row: 9,
      column: 0,
  };

  busy: boolean = false;
  difficulty = "";
  rowCoefficient=[-1,0,1,0]
  colCoefficient=[0,1,0,-1]

  isValidCell(x: number, y: number)
  {
      if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        return true;
      }
      return false;
  }

  makeMove() {
    var mv: number = -1;
    mv = this.move();
    this.moveCount += 1;

    // Store the current location in currentIndex
    this.currentIndex = {
      row: this.agentIndex.row,
      column: this.agentIndex.column,
    };

    if (mv == this.UP) {
      this.agentIndex.row--;
      this.point--;
    } else if (mv == this.DOWN) {
      this.agentIndex.row++;
      this.point--;
    } else if (mv == this.LEFT) {
      this.agentIndex.column--;
      this.point--;
    } else if (mv == this.RIGHT) {
      this.agentIndex.column++;
      this.point--;
    }

    // Return both currentIndex and move
    return mv;
  }

  private getPossibleDirections(): number[] {
      const directions: number[] = [];
      if (this.agentIndex.row > 0) directions.push(this.UP);
      if (this.agentIndex.row < 9) directions.push(this.DOWN);
      if (this.agentIndex.column > 0) directions.push(this.LEFT);
      if (this.agentIndex.column < 9) directions.push(this.RIGHT);
      return directions;
    }
    
    private getDirectionsBelowPitThreshold():  { direction: number; probability: number }[] {
      const belowThreshold: { direction: number; probability: number }[] = [];
      if (this.agentIndex.row < 9 && (this.totalMoves[this.agentIndex.row+1][this.agentIndex.column]<15 ||
        !this.cellVisited[this.agentIndex.row+1][this.agentIndex.column]) &&
        this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column] < this.threshold) {
        belowThreshold.push({ direction: this.DOWN, probability: this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column] });
      }
      if (this.agentIndex.column < 9 && (this.totalMoves[this.agentIndex.row][this.agentIndex.column+1]<15 ||
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column+1]) &&
        this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1] < this.threshold) {
        belowThreshold.push({ direction: this.RIGHT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1] });
      }
      if (this.agentIndex.row > 0 && (this.totalMoves[this.agentIndex.row-1][this.agentIndex.column]<15 ||
        !this.cellVisited[this.agentIndex.row-1][this.agentIndex.column]) &&
        this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column] < this.threshold) {
        belowThreshold.push({ direction: this.UP, probability: this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column] });
      }
      if (this.agentIndex.column > 0 && (this.totalMoves[this.agentIndex.row][this.agentIndex.column-1]<15 ||
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column-1]) &&
        this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1] < this.threshold) {
        belowThreshold.push({ direction: this.LEFT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1] });
      }
      return belowThreshold;
    }

    private getDirectionsBelowBothThreshold():  { direction: number; probability: number }[] {
      const belowThreshold: { direction: number; probability: number }[] = [];
      if (this.agentIndex.row < 9 && (this.totalMoves[this.agentIndex.row+1][this.agentIndex.column]<15 ||
        !this.cellVisited[this.agentIndex.row+1][this.agentIndex.column]) &&
        this.wumpusProbability[this.agentIndex.row + 1][this.agentIndex.column] < this.threshold &&
        this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column] < this.threshold) {
        belowThreshold.push({ direction: this.DOWN, probability: this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column]
          + this.wumpusProbability[this.agentIndex.row + 1][this.agentIndex.column]
         });
      }
      if (this.agentIndex.column < 9 && (this.totalMoves[this.agentIndex.row][this.agentIndex.column+1]<15 ||
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column+1]) &&
        this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1] < this.threshold &&
        this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1] < this.threshold) {
        belowThreshold.push({ direction: this.RIGHT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1]
          + this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1]
         });
      }
      if (this.agentIndex.row > 0 && (this.totalMoves[this.agentIndex.row-1][this.agentIndex.column]<15 ||
        !this.cellVisited[this.agentIndex.row-1][this.agentIndex.column]) &&
        this.wumpusProbability[this.agentIndex.row - 1][this.agentIndex.column] < this.threshold &&
        this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column] < this.threshold) {
        belowThreshold.push({ direction: this.UP, probability: this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column]
          + this.wumpusProbability[this.agentIndex.row - 1][this.agentIndex.column]
         });
      }
      if (this.agentIndex.column > 0 && (this.totalMoves[this.agentIndex.row][this.agentIndex.column-1]<15 ||
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column-1]) &&
        this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1] < this.threshold &&
        this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1] < this.threshold) {
        belowThreshold.push({ direction: this.LEFT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1]
          + this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1]
         });
      }
      return belowThreshold;
    }

    private getDirectionsLessThreshold():  { direction: number; probability: number }[] {
      const belowThreshold: { direction: number; probability: number }[] = [];
      if (this.agentIndex.row < 9 ){
        belowThreshold.push({ direction: this.DOWN, probability: this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column]
          + this.wumpusProbability[this.agentIndex.row + 1][this.agentIndex.column]
         });
      }
      if (this.agentIndex.column < 9){
        belowThreshold.push({ direction: this.RIGHT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1]
          + this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1]
         });
      }
      if (this.agentIndex.row > 0){
        belowThreshold.push({ direction: this.UP, probability: this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column]
          + this.wumpusProbability[this.agentIndex.row - 1][this.agentIndex.column]
         });
      }
      if (this.agentIndex.column > 0) {
        belowThreshold.push({ direction: this.LEFT, probability: this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1]
          + this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1]
         });
      }
      return belowThreshold;
    }
    
    private chooseRandomDirection(directions: number[]): number {
      const randomIndex = Math.floor(Math.random() * directions.length);
      return directions[randomIndex];
    }
    
    private updateMoveCount(randomDirection: number){
      switch (randomDirection) {
        case this.LEFT:
          this.totalMoves[this.agentIndex.row][this.agentIndex.column - 1]++;
          break;
        case this.RIGHT:
          this.totalMoves[this.agentIndex.row][this.agentIndex.column + 1]++;
          break;
        case this.UP:
          this.totalMoves[this.agentIndex.row - 1][this.agentIndex.column]++;
          break;
        case this.DOWN:
          this.totalMoves[this.agentIndex.row + 1][this.agentIndex.column]++;
          break;
      }
    }

    private resetRandomMoveCount(): void {
      this.contiguousRandomMoveCount = 0;
    }
    
    private handlePitLoop(): number {
      console.log("pit loop");
      // Step 1: Get directions with probabilities below the threshold
      const directionsBelowPitThreshold = this.getDirectionsBelowPitThreshold();
      if (directionsBelowPitThreshold.length > 0) {
        // Step 2: Sort by probability and take the minimum one
        directionsBelowPitThreshold.sort((a, b) => a.probability - b.probability);
        const bestDirection = directionsBelowPitThreshold[0].direction;
        //const directions = directionsBelowPitThreshold.map(item => item.direction);
        //const bestDirection = this.chooseRandomDirection(directions);
        this.resetRandomMoveCount();
        return bestDirection;
      }
      
      // Step 3: If no direction is below the threshold, move randomly
      const possibleDirections = this.getPossibleDirections();
      const randomDirection = this.chooseRandomDirection(possibleDirections);
      this.resetRandomMoveCount();
      return randomDirection;
    }

    private handlePitWumpusLoop(): number {
      console.log("pit wumpus loop");
      // Step 1: Get directions with probabilities below the threshold
      const directionsBelowBothThreshold = this.getDirectionsBelowBothThreshold();
      if (directionsBelowBothThreshold.length > 0) {
        // Step 2: Sort by probability and take the minimum one
        directionsBelowBothThreshold.sort((a, b) => a.probability - b.probability);
        const bestDirection = directionsBelowBothThreshold[0].direction;
        //const directions = directionsBelowBothThreshold.map(item => item.direction);
        //const bestDirection = this.chooseRandomDirection(directions);
        this.resetRandomMoveCount();
        return bestDirection;
      }
      const directionsLessThreshold= this.getDirectionsLessThreshold();
      if (directionsLessThreshold.length > 0) {
          // Step 2: Sort by probability and take the minimum one
          directionsLessThreshold.sort((a, b) => a.probability - b.probability);
          const betterDirection = directionsLessThreshold[0].direction;
          //const directions = directionsLessThreshold.map(item => item.direction);
          //const betterDirection = this.chooseRandomDirection(directions);
          this.resetRandomMoveCount();
          return betterDirection;
      }
      // Step 3: If no direction is below the threshold, move randomly
      const possibleDirections = this.getPossibleDirections();
      const randomDirection = this.chooseRandomDirection(possibleDirections);
      this.resetRandomMoveCount();
      return randomDirection;
    }

    private updateBoardAfterWumpusShot(row: number, column: number): void {
      // Remove Wumpus and add "D" if cell becomes empty
      this.board[row][column] = this.board[row][column].replace("W", "");
      if (this.board[row][column] === "") {
        this.board[row][column] = "D";
      }
      this.removeStench(row, column);
    }
  
  private getAvailableDirections(conditionFn: (row: number, col: number) => boolean): number[] {
      const directions: number[] = [];
      if (this.agentIndex.row > 0 && conditionFn(this.agentIndex.row - 1, this.agentIndex.column)) {
          directions.push(this.UP);
      }
      if (this.agentIndex.column > 0 && conditionFn(this.agentIndex.row, this.agentIndex.column - 1)) {
          directions.push(this.LEFT);
      }
      if (this.agentIndex.row < 9 && conditionFn(this.agentIndex.row + 1, this.agentIndex.column)) {
          directions.push(this.DOWN);
      }
      if (this.agentIndex.column < 9 && conditionFn(this.agentIndex.row, this.agentIndex.column + 1)) {
          directions.push(this.RIGHT);
      }
      return directions;
  }

  move() {
    this.calculateBreezeAndStench();

    if (this.gameOver || this.busy) {
      // case when game ends
      return -1;
    }
    if (this.board[this.agentIndex.row][this.agentIndex.column].includes("G")) {
      console.log("gold collecting");
      this.busy = true;
      this.discoveredGold += 1;
      this.point += 1000;
      this.isGoldFound = !this.isGoldFound;
      setTimeout(() => {
        this.board[this.agentIndex.row][this.agentIndex.column] = this.board[
          this.agentIndex.row
        ][this.agentIndex.column].replace("G", "F");

        this.busy = false;
      }, 1000);
      if (this.discoveredGold == this.goldCount) {
        console.log("you win");
        this.gameOver = true;
        this.gameOverLine = "Congrats! You Win";
        this.youWin = true;

        return -1;
      }
    }
    else if (
      this.board[this.agentIndex.row][this.agentIndex.column].includes("W") ||
      this.board[this.agentIndex.row][this.agentIndex.column].includes("P")
    ) {
      this.point -= 10000;
      this.gameOver = true;
      this.youLose = true;
      this.gameOverLine = "Game Over! You Lose";
      console.log(this.gameOverLine);
      return -1;
    }
    else if (this.arrowAvailable>0 && this.wumpusCount > this.wumpusKilled && this.isWumpusClose()) {
    // console.log("UP BOARD: ", this.board);
    this.isShoot = !this.isShoot;
    this.wumpusKilled += 1;
    this.arrowAvailable-=1;
    switch (this.shootDirection) {
    case this.RIGHT:
    this.updateBoardAfterWumpusShot(this.agentIndex.row, this.agentIndex.column + 1);
    break;
    case this.LEFT:
    this.updateBoardAfterWumpusShot(this.agentIndex.row, this.agentIndex.column - 1);
    break;
    case this.UP:
    this.updateBoardAfterWumpusShot(this.agentIndex.row - 1, this.agentIndex.column);
    break;
    case this.DOWN:
    this.updateBoardAfterWumpusShot(this.agentIndex.row + 1, this.agentIndex.column);
    break;
    }
    console.log("DEAD: ", this.board);
    return -1; 
    }
    else if (this.arrowAvailable>0 && this.areWeInPitLoop()) {
      console.log("pit loop");
      return this.handlePitLoop();
    }
    else if (this.arrowAvailable==0 && this.areWeInPitWumpusLoop()) {
      console.log("pit wumpus loop");
      return this.handlePitWumpusLoop();
    }
    else if (this.isItDangerCell()) {
      console.log("danger space");
  
      // Check visited cells
      const visitedAvailableDirections = this.getAvailableDirections(
          (row, col) => this.cellVisited[row][col] && this.totalMoves[row][col] < 15
      );
      if (visitedAvailableDirections.length > 0) {
        const randomDirection = this.chooseRandomDirection(visitedAvailableDirections);
        this.updateMoveCount(randomDirection);
        return randomDirection;
      }
  
      // Check unvisited cells with low probabilities
      const unvisitedAvailableDirections = this.getAvailableDirections(
          (row, col) =>
              this.wumpusProbability[row][col] < this.threshold &&
              this.pitProbability[row][col] < this.threshold
      );
      if (unvisitedAvailableDirections.length > 0) {
          const randomDirection= this.chooseRandomDirection(unvisitedAvailableDirections);
          this.updateMoveCount(randomDirection);
          return randomDirection;
      }

      const availableDirections = this.getAvailableDirections(() => true);
      if (availableDirections.length > 0) {
          const randomDirection= this.chooseRandomDirection(availableDirections);
          this.updateMoveCount(randomDirection);
          return randomDirection;
      }
      return -1;
   }
    // cell is safe
    else if (!this.isItDangerCell()) {
      console.log("free space");
      // first go to the unvisited index randomly
      const freeSpaceToUnvisitedDirections: number[] = [];
      if (this.agentIndex.row < 9 &&
        !this.cellVisited[this.agentIndex.row + 1][this.agentIndex.column]) {
        freeSpaceToUnvisitedDirections.push(this.DOWN);
      }
      if ( this.agentIndex.column < 9 &&
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column + 1]) {
        freeSpaceToUnvisitedDirections.push(this.RIGHT);
      }
      if (this.agentIndex.row > 0 &&
        !this.cellVisited[this.agentIndex.row - 1][this.agentIndex.column]) {
        freeSpaceToUnvisitedDirections.push(this.UP);
      }
      if (this.agentIndex.column > 0 &&
        !this.cellVisited[this.agentIndex.row][this.agentIndex.column - 1]) {
        freeSpaceToUnvisitedDirections.push(this.LEFT);
      }

      if (freeSpaceToUnvisitedDirections.length > 0) {
        const randomIndex = Math.floor(Math.random() * freeSpaceToUnvisitedDirections.length);
        const randomDirection = freeSpaceToUnvisitedDirections[randomIndex];
        // update the total moves and return the chosen direction
        switch (randomDirection) {
          case this.LEFT:
            this.cellVisited[this.agentIndex.row][this.agentIndex.column - 1] =true;
            this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1] =0.0;
            this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1] =0.0;
            this.totalMoves[this.agentIndex.row][this.agentIndex.column - 1]++;
            return this.LEFT;
          case this.RIGHT:
            this.cellVisited[this.agentIndex.row][this.agentIndex.column + 1] =true;
            this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1] =0.0;
            this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1] =0.0;
            this.totalMoves[this.agentIndex.row][this.agentIndex.column + 1]++;
            return this.RIGHT;
          case this.UP:
            this.cellVisited[this.agentIndex.row - 1][this.agentIndex.column] =true;
            this.pitProbability[this.agentIndex.row-1][this.agentIndex.column] =0.0;
            this.wumpusProbability[this.agentIndex.row-1][this.agentIndex.column] =0.0;
            this.totalMoves[this.agentIndex.row - 1][this.agentIndex.column]++;
            return this.UP;
          case this.DOWN:
            this.cellVisited[this.agentIndex.row + 1][this.agentIndex.column] =true;
            this.pitProbability[this.agentIndex.row+1][this.agentIndex.column] =0.0;
            this.wumpusProbability[this.agentIndex.row+1][this.agentIndex.column] =0.0;
            this.totalMoves[this.agentIndex.row + 1][this.agentIndex.column]++;
            return this.DOWN;
        }
      }
      // if all neighbor have been visited, choose random direction
      else {
        while (true) {
          switch (this.rand(1, 4)) {
            case 1:
              if (this.agentIndex.row < 9) {
                this.totalMoves[this.agentIndex.row + 1][this.agentIndex.column]++;
                this.contiguousRandomMoveCount++;
                return this.DOWN;
              }
              break;
            case 2:
              if (this.agentIndex.column < 9) {this.totalMoves[this.agentIndex.row][this.agentIndex.column + 1]++;
                this.contiguousRandomMoveCount++;
                return this.RIGHT;
              }
              break;
            case 3:
              if (this.agentIndex.row > 0) {
                this.totalMoves[this.agentIndex.row - 1][this.agentIndex.column]++;
                this.contiguousRandomMoveCount++;
                return this.UP;
              }
              break;
            case 4:
              if (this.agentIndex.column > 0) {
                this.totalMoves[this.agentIndex.row][this.agentIndex.column - 1]++;
                this.contiguousRandomMoveCount++;
                return this.LEFT;
              }
              break;
          }
        }
      }
    }
    return -1;
  }

  isWumpusClose() {
    if (this.agentIndex.column < 9 &&
      this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1] > 0.5) {
      this.shootDirection = this.RIGHT;
      return true;
    }
    if (this.agentIndex.column > 0 &&
      this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1] > 0.5) {
      this.shootDirection = this.LEFT;
      return true;
    }
    if (this.agentIndex.row < 9 &&
      this.wumpusProbability[this.agentIndex.row + 1][this.agentIndex.column] > 0.5) {
      this.shootDirection = this.DOWN;
      return true;
    }
    if (this.agentIndex.row > 0 &&
      this.wumpusProbability[this.agentIndex.row - 1][this.agentIndex.column] > 0.5) {
      this.shootDirection = this.UP;
      return true;
    }
    return false;
  }

  removeStench(row, column) {
    const directions = [
      [-1, 0], // Up
      [1, 0], // Down
      [0, -1], // Left
      [0, 1], // Right
    ];

    for (const [dr, dc] of directions) {
      const cr = row + dr;
      const cc = column + dc;

      if (cr >= 0 && cr <= 9 && cc >= 0 && cc <= 9) {
        let flag = 1;

        for (const [r, c] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = cr + r;
          const nc = cc + c;

          if (
            nr >= 0 &&
            nr <= 9 &&
            nc >= 0 &&
            nc <= 9 &&
            this.board[nr][nc].includes("W")
          ) {
            flag = 0;
            break;
          }
        }

        if (flag) {
          this.board[cr][cc] = this.board[cr][cc].replace("T", "");
          let xd = JSON.stringify(this.getBoard());
          console.log("wumpus killed: ", this.wumpusKilled);
          console.log("after removing stench: ", row, column, xd);
        }
      }
    }

    this.wumpusProbability[row][column] = 0.0;
    console.log("after removing stench: ", row, column, this.board);
  }

  areWeInPitLoop() {
    if (
      this.contiguousRandomMoveCount > 0 &&
      this.totalMoves[this.agentIndex.row][this.agentIndex.column] > 1 &&
      this.board[this.agentIndex.row][this.agentIndex.column].includes("B")
    )
      return true;
    else return false;
  }

  areWeInWumpusLoop() {
      if (
        this.contiguousRandomMoveCount > 0 &&
        this.totalMoves[this.agentIndex.row][this.agentIndex.column] > 1 &&
        this.board[this.agentIndex.row][this.agentIndex.column].includes("T")
      )
        return true;
      else return false;
  }

  areWeInPitWumpusLoop() {
      if (
        this.contiguousRandomMoveCount > 0 &&
        this.totalMoves[this.agentIndex.row][this.agentIndex.column] > 1 &&
        (this.board[this.agentIndex.row][this.agentIndex.column].includes("B")||
        this.board[this.agentIndex.row][this.agentIndex.column].includes("T"))
      )
        return true;
      else return false;
    }

  isItDangerCell() {
    if (
      this.board[this.agentIndex.row][this.agentIndex.column].includes("B") ||
      this.board[this.agentIndex.row][this.agentIndex.column].includes("T")
    ) {
      return true;
    }
    return false;
  }

  rand(min: number, max: number): number {
    if (min > max) [min, max] = [max, min]; 
    if (min === max) return min; 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  calculateBreezeAndStench() {
    if (!this.nearDanger[this.agentIndex.row][this.agentIndex.column] &&
      this.isValidCell(this.agentIndex.row, this.agentIndex.column)) {
      if (this.board[this.agentIndex.row][this.agentIndex.column].includes("B")) {
        this.updatePitWumpusPercentage(true, false);
      }
      if (this.board[this.agentIndex.row][this.agentIndex.column].includes("T")) {
        this.updatePitWumpusPercentage(false, true);
      }
    }
  }

  updatePitWumpusPercentage(pit: boolean, wumpus: boolean) {
    if (this.agentIndex.column > 0 &&
      !this.cellVisited[this.agentIndex.row][this.agentIndex.column - 1]) {
      if (pit == true) {
        this.pitProbability[this.agentIndex.row][this.agentIndex.column - 1] += 0.25;
      } else {
        this.wumpusProbability[this.agentIndex.row][this.agentIndex.column - 1] += 0.25;
      }
    }
    if (this.agentIndex.column < 9 &&
      !this.cellVisited[this.agentIndex.row][this.agentIndex.column + 1]) {
      if (pit == true) {
        this.pitProbability[this.agentIndex.row][this.agentIndex.column + 1] += 0.25;
      } else {
        this.wumpusProbability[this.agentIndex.row][this.agentIndex.column + 1] += 0.25;
      }
    }
    if (this.agentIndex.row > 0 &&
      !this.cellVisited[this.agentIndex.row - 1][this.agentIndex.column]) {
      if (pit == true) {
        this.pitProbability[this.agentIndex.row - 1][this.agentIndex.column] += 0.25;
      } else {
        this.wumpusProbability[this.agentIndex.row - 1][this.agentIndex.column] += 0.25;
      }
    }
    if (this.agentIndex.row < 9 &&
      !this.cellVisited[this.agentIndex.row + 1][this.agentIndex.column]) {
      if (pit == true) {
        this.pitProbability[this.agentIndex.row + 1][this.agentIndex.column] += 0.25;
      } else {
        this.wumpusProbability[this.agentIndex.row + 1][this.agentIndex.column] += 0.25;
      }
    }
    // update the cell to danger
    this.nearDanger[this.agentIndex.row][this.agentIndex.column] = true;
  }

  gameOnInit(wumpusCount: any, pitCount: any, goldCount: any, arrowAvailable: any)
  {
      this.wumpusCount=wumpusCount
      this.pitCount=pitCount
      this.goldCount=goldCount
      this.arrowAvailable= arrowAvailable
      this.init()
      this.cellVisited[9][0]=true
  }

  init()
  {
      console.log("before setting the board")
      // age wumpus uncle k board e boshai
      for(let i=0;i<this.wumpusCount;i++)
      {
          let row=0, col=0
          do{
              row = Math.floor(Math.random() * 10);
              col = Math.floor(Math.random() * 10);
          }while((row>7 && col<2) || (this.board[row][col]==="W"))
          
          this.board[row][col]="W"
      }

      // update the relative cells to wumpus
      this.updateWumpusRelativeCell()

      // ekhon pit k initialize kori
      for (let i = 0; i < this.pitCount; i++) 
      {
          let row=0, col=0;
          do {
              row = Math.floor(Math.random() * 10);
              col = Math.floor(Math.random() * 10);
          } while ((row>7 && col<2) || this.board[row][col].includes("P") || this.board[row][col].includes("W"))
      
          if (this.board[row][col] == "S") 
          {
              this.board[row][col] = "P";
          } 
          else 
          {
              this.board[row][col] += "P";  
          }
      }
      // update the relative cells to pit
      this.updateRelativePitCell()

      // gold init
      for (let i = 0; i < this.goldCount; i++) 
      {
          let row=0, col=0;
          do {
              row = Math.floor(Math.random() * 10);
              col = Math.floor(Math.random() * 10);
          } while ((row === 9 && col === 0) || this.board[row][col].includes("W") || this.board[row][col].includes("P"))
  
          this.board[row][col] += "G";
      }

      this.cheatBoard = JSON.parse(JSON.stringify(this.board));
      console.log("after setting up the board: ", this.board);
  }

  updateWumpusRelativeCell()
  {
      for(let row=0;row<10;row++)
      {
          for(let col=0;col<10;col++)
          {
              if(this.board[row][col].includes("W"))
              {
      
                  for(let k=0;k<4;k++)
                  {
                      let r=row+this.rowCoefficient[k]
                      let c=col+this.colCoefficient[k]
                      if(this.isValidCell(r,c)) 
                      {
                          this.setStench(r,c)
                      }
                  }
              }
          }
      }
  }

  setStench(row: number,col: number)
  {
      if (this.board[row][col] == "S") 
      {
          this.board[row][col] = "T";
      } 
      else if (!this.board[row][col].includes("T")) 
      {
          this.board[row][col] += "T";
      }
  }

  updateRelativePitCell()
  {
      for(let row=0;row<10;row++)
      {
          for(let col=0;col<10;col++)
          {
              if(this.board[row][col].includes("P"))
              {
      
                  for(let k=0;k<4;k++)
                  {
                      let r=row+this.rowCoefficient[k]
                      let c=col+this.colCoefficient[k]
                      if(this.isValidCell(r,c)) 
                      {
                          this.setBreeze(r,c)
                      }
                  }
              }
          }
      }
  }

  setBreeze(row: number,col: number)
  {
      if (this.board[row][col] == "S") 
      {
          this.board[row][col] = "B";
      } 
      else if (!this.board[row][col].includes("B")) 
      {
          this.board[row][col] += "B";
      }
  }

  getBoard() 
  {
      return this.board;
  }

  isGameOver() 
  {
      if (this.gameOver) 
      {
          return true;
      }
      return false;
  }
  isYouWin() 
  {
      if (this.youWin) 
      {
          return true;
      }
      return false;
  }
  isYouLose() 
  {
      if (this.youLose) 
      {
          return true;
      }
      return false;
  }

  // resetting game env
  resetGameEnvironment() {
    
      this.board = this.generateGrid(10, 10, "S");
      this.cellVisited = this.generateGrid(10, 10, false);
      this.nearDanger = this.generateGrid(10, 10, false);
      this.cheatBoard = this.generateGrid(10, 10, "S");
      this.pitProbability = this.generateGrid(10, 10, 0.0);
      this.wumpusProbability = this.generateGrid(10, 10, 0.0);
      this.totalMoves = this.generateGrid(10, 10, 0);

      this.agentIndex = { row: 9, column: 0 };
      this.currentIndex = { row: 9, column: 0 };
      this.pitCount = 0;
      this.arrowAvailable=0;
      this.goldCount = 0;
      this.point = 0;
      this.moveCount = 0;
      this.wumpusCount = 0;
      this.contiguousRandomMoveCount = 0;
      this.foundGold = 0;
      this.wumpusDead = 0;
      this.UP = 0;
      this.DOWN = 1;
      this.LEFT = 2;
      this.RIGHT = 3;
      this.isShoot = false;
      this.gameOver = false;
      this.youWin = false;
      this.youLose = false;
      this.gameOverLine = "";
      this.cheatMode = false;
      this.isGoldFound=false;
      this.collectingGold=false
      this.discoveredGold = 0;
      this.wumpusKilled = 0;
      this.threshold=0.5
      this.busy= false;
      this.difficulty = "";
      console.log("RESETING ENV");
  }

  // setting up board
  setBoard(newBoard)
  {
      this.board = this.initialBoard; // may be i dont need this, still keeping it
      this.board = JSON.parse(JSON.stringify(newBoard));
      const { wCount, pCount, gCount, aCount} = this.countWumpusPitAndGold();
      this.wumpusCount = wCount;
      this.pitCount = pCount;
      this.goldCount = gCount;
      this.arrowAvailable = aCount;
      this.initialBoard = JSON.parse(JSON.stringify(this.board));
      this.addPercept()
  }

  countWumpusPitAndGold() 
  {
      let wCount = 0;
      let pCount = 0;
      let gCount = 0;
      let aCount=0;
      for (let i = 0; i < this.board.length; i++) 
      {
          for (let j = 0; j < this.board.length; j++) 
          {
              if (this.board[i][j] == "W") wCount += 1;
              else if (this.board[i][j] == "P") pCount += 1;
              else if (this.board[i][j] == "G") gCount += 1;
          }
      }
      return { wCount, pCount, gCount, aCount };
  }

  addPercept()
  {
      this.updateWumpusRelativeCell()
      this.updateRelativePitCell()
  }

}

export const play=new Play() 