import { useEffect, useState } from "react";
import Cell from "./Cell";
import CheatCell from "./CheatCell";
import { play } from "./Play";

import "../styles/Button.css";
import "../styles/Grid.css";


import useSound from "use-sound";
import goldCollectSound from "../assets/movementSound.mp3";
import shootSound from "../assets/scream.mp3";
import loseSound from "../assets/loseSound.mp3";
import playSound from "../assets/playSound.mp3";
import winSound from "../assets/winSound.mp3";

import wumpus from "../assets/W.png";
import deathWumpus from "../assets/D.png";

const Grid = () => {
  const [cheatMode, setCheatMode] = useState(true);
  const [board, setBoard] = useState(play.getBoard());
  const [finalMessage, setFinalMessage] = useState("");
  const [wumpusCnt, setWumpusCnt] = useState(3);
  const [pitCnt, setPitCnt] = useState(5);
  const [goldCnt, setGoldCnt] = useState(2);
  const [arrowAvailable, setArrowAvailable] = useState(3);
  const [isDareDevilMode, setDareDevilMode] = useState(false);
  const [playBtnSound] = useSound(playSound);
  const [coinCollectSound] = useSound(goldCollectSound);
  const [winningSound] = useSound(winSound);
  const [losingSound] = useSound(loseSound);
  const [shootingSound] = useSound(shootSound);
  const [hoveredCell, setHoveredCell] = useState({ x: null, y: null });
  let latestWumpus = wumpusCnt;
  let latestPit = pitCnt;
  let latestGold = goldCnt;
  let latestArrowAvailable = arrowAvailable;
  let difficultyMode = "";

  let isMoving = 0;

  function toggleCheatMode() {
    playBtnSound();
    setCheatMode(!cheatMode);
  }
 

  function resetBoard() {
    playBtnSound();
    play.resetGameEnvironment();
    play.gameOnInit(latestWumpus, latestPit, latestGold,latestArrowAvailable, difficultyMode); 
    setFinalMessage("");
    setBoard([...play.getBoard()]);
  }

  function handleWumpusCnt(event) {
    const newValue = event.target.value;
    latestWumpus = newValue;
    setWumpusCnt(newValue);
    resetBoard();
  }

  function handlePitCnt(event) {
    const newValue = event.target.value;
    latestPit = newValue;
    setPitCnt(newValue);
    resetBoard();
  }

  function handleGoldCnt(event) {
    const newValue = event.target.value;
    latestGold = newValue;
    setGoldCnt(newValue);
    resetBoard();
  }

  function handleArrowAvailable(event) {
    const newValue = event.target.value;
    latestArrowAvailable = newValue;
    setArrowAvailable(newValue);
    resetBoard();
  }

  function handleDareDevilMode() {
    playBtnSound();
    setDareDevilMode(!isDareDevilMode);
    if (isDareDevilMode == false) {
      difficultyMode = "Easy";
      console.log(difficultyMode);
    } else {
      console.log(difficultyMode);
    }

    play.setDifficultyMode(difficultyMode);
  }

  const handleHover = (x, y, isHovered) => {
    setHoveredCell({ x, y, isHovered });
  };

  const uploadBoard=(e)=>{ 

    resetBoard() 
    const file=e.target.files[0]
    const reader=new FileReader()
    const newBoard=[]

    reader.onload=(event)=>{
        const data=event.target.result
        const lines=data.split("\n")

        for(let i=0;i<lines.length;i++)
        {
            const line=lines[i].trim();
            const row=[]
            for(let j=0;j<line.length;j++)
            {
                if(line[j]==="-") row.push("S")
                else row.push(line[j])
            }
            newBoard.push(row)
        }

        console.log("board setup",newBoard)
        play.resetGameEnvironment()
        play.setBoard(newBoard)
        setWumpusCnt(play.wumpusCount);
        setPitCnt(play.pitCount);
        setGoldCnt(play.goldCount);
        setArrowAvailable(play.arrowAvailable);
        setBoard([...play.getBoard()])
    }

    reader.readAsText(file)
}

  const moveAgent = async () => {
    playBtnSound();

    async function makeNextMove() {
      if (isMoving > 0 && !play.isGameOver()) {
        play.makeMove();
        if (play.isShoot) {
          setFinalMessage("Wumpus Shooted");
        }

        setBoard([...play.getBoard()]);
        isMoving = isMoving - 1;
        if (play.isGoldFound) {
          setFinalMessage(play.discoveredGold + " Gold Discovered");
        }
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (play.isGameOver()) {
          if (play.isYouWin()) {
            winningSound();
            setFinalMessage("🎉🎉 Wuhhu! You Collected all Golds 🎉🎉");
            setBoard([...play.getBoard()]);
            isMoving = 0;
          } else if (play.isYouLose()) {
            losingSound();
            setFinalMessage(
              "Lost the game !!! You fall into Pit => " +
                play.agentIndex.row +
                ", " +
                play.agentIndex.column +
                "🏳🏳"
            );
          }
        } else {
          // Make the next move
          makeNextMove();
        }
      }
    }

    isMoving = 1500;
    makeNextMove();
  };


  const grid = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 10; c++) {
      row.push(play.getBoard()[c][r]);
    }
    grid.push(row);
  }

  const pitProb = [];
  const wumpusProb = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    const row2 = [];
    for (let c = 0; c < 10; c++) {
      row.push(play.pitProbability[c][r]);
      row2.push(play.wumpusProbability[c][r]);
    }
    pitProb.push(row);
    wumpusProb.push(row2);
  }

  useEffect(() => {
    if (play.isShoot) {
      shootingSound();
      play.isShoot = false;
    }
  }, [play.isShoot, shootingSound]);

  useEffect(() => {
    if (play.isGoldFound) {
      coinCollectSound();
      play.isGoldFound = false;
    }
  }, [play.isGoldFound, coinCollectSound]);


  return (
    <div style={{ display: "flex", flexDirection: "row" , height:"100px"}} className="game-container">
    
      <div style={{ width: "40%",height:"30px",  }}  className="left-container" >
        <div className="left-upper-container" > 
          <div className="cheat-board" style={{ display: "flex", flexDirection: "column"}} >
          <div className="wumpus-board-heading" style={{ textAlign: "center",  fontWeight: "bold", fontSize: "20px",}}>Wumpus Probability</div>
            <div className="wumpus-board"  style={{ display: "flex", margin: 0 }}>
              {wumpusProb.map((col, colIndex) => (
                <div key={colIndex} className="row" >
                  {col.map((cell, rowIndex) => (
                    <div key={rowIndex} className="cheat-box" style={{ height:"30px",width:"40px", margin: "3px"}}>
                      <CheatCell id={cell} x={rowIndex} y={colIndex} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{height:"10%"}}></div>
            <div className="wumpus-board-heading" style={{ textAlign: "center",  fontWeight: "bold", fontSize: "20px",}}>Pit Probability</div>
            <div className="pit-board" style={{ display: "flex", margin: 0 }}>    
              {pitProb.map((col, colIndex) => (
                <div key={colIndex} className="row" >
                  {col.map((cell, rowIndex) => (
                    <div key={rowIndex} className="cheat-box" style={{ height:"12%",width:"40px", margin: "3px"}}>
                      <CheatCell id={cell} x={rowIndex} y={colIndex} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
       </div>
      <div className="right-container"  style={{ display: "flex", flexDirection: "column]"}}> 
       
        <div className="title" style={{fontSize: "40px", fontWeight:"bold"}}>
        <img src={wumpus} height='60px' ></img>
          Wumpus World
         <img src={ deathWumpus} height='70px' ></img>
          </div>
        <div className="game-board" style={{ display: "flex", margin: 0 }}>
          {grid.map((col, colIndex) => (
            <div key={colIndex} className="row">
              {col.map((cell, rowIndex) => (
                <div key={rowIndex} className="box" style={{ height:"50px",width:"40px", margin: "3px"}}>
                  <Cell
                    id={cell}
                    cheatMode={cheatMode}
                    x={rowIndex}
                    y={colIndex}
                  />
                </div>
              ))}
            </div>
          ))}

<div className="gameState" style={{ display: "flex", flexDirection: "column" }}>
<div className="message-box">
          <h2 className="alert-box" style={{ color: "black" }}>
            {finalMessage}
          </h2>
        </div>
  <div className="inputSection">
    <div className="valueCover">
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Wumpus Count 🐲
      </h2>
      <div className="value">
        <input
          type="number"
          min="1"
          max="50"
          value={wumpusCnt}
          onChange={handleWumpusCnt}
          style={{ width: "40px" }}
        />
      </div>
    </div>

    <div className="valueCover">
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Pit Count 🕳️
      </h2>
      <div className="value">
        <input
          type="number"
          min="1"
          max="50"
          value={pitCnt}
          onChange={handlePitCnt}
          style={{ width: "40px" }}
        />
      </div>
    </div>

    <div className="valueCover">
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Gold Count 🏆
      </h2>
      <div className="value">
        <input
          type="number"
          min="1"
          max="50"
          value={goldCnt}
          onChange={handleGoldCnt}
          style={{ width: "40px" }}
        />
      </div>
    </div>
    <div className="upload-group" style={{ marginTop: "1.2rem" }}>
                <label htmlFor="customBoard">Upload Board </label>
                <input
                  className="form-field"
                  type="file"
                  name="customBoard"
                  onChange={(e) => uploadBoard(e)}
                />
              </div>
    <div className="valueCover">
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Initial Arrow Count 🏆
      </h2>
      <div className="value">
        <input
          type="number"
          min="1"
          max="50"
          value={arrowAvailable}
          onChange={handleArrowAvailable}
          style={{ width: "40px" }}
        />
      </div>
    </div>

   
  </div>

 
</div>



      </div>
     
      <div className="left-bottom-container" style={{display: "flex", alignItems: "flex-start", paddingLeft: "10px" ,flexDirection:"column"}}>
      <div className="playBtnSection" style={{ display: "flex", alignItems: "flex-start", paddingLeft: "10px" ,flexDirection:"row"}}>
    <button className="custom-btn" onClick={moveAgent}>
      Play 🎮
    </button>
    <button className="custom-btn" onClick={toggleCheatMode}>
      {cheatMode ? "Cheat Mode 🔍 ON" : "Cheat Mode OFF"}
    </button>

    <button className="custom-btn" onClick={resetBoard}>
      Reset 🔄
    </button>

  </div>
  <div className="text-area" style={{display:"flex",alignItems:"center",flexDirection:"row"}}>
    <h2 className="text-box" style={{ color: "#28a745" }}>
      ⭐ Points: <span className="highlight">{play.point}</span>
    </h2>
    <h2 className="text-box" style={{ color: "#dc3545" }}>
      🎯 Wumpus Killed: <span className="highlight">{play.wumpusKilled}</span>
    </h2>
    <h2 className="text-box" style={{ color: "#fd7e14" }}>
      💰 Gold Collected: <span className="highlight">{play.discoveredGold}</span>
    </h2>
    <h2 className="text-box" style={{ color: "#007bff" }}>
      🚶 Moves: <span className="highlight">{play.moveCount}</span>
    </h2>
    <h2 className="text-box" style={{ color: "#007bff" }}>
     🎯 Arrow: <span className="highlight">{play.arrowAvailable}</span>
    </h2>
  </div>
  
 
 
</div>


     </div>
     </div>
     
  );
};

export default Grid;