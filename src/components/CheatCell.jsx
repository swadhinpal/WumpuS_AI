import "../styles/Grid.css";
import { play } from "./Play";


function CheatCell({ id, x, y }) {
  const agent_x = play.agentIndex.row;
  const agent_y = play.agentIndex.column;
  const isAgentCell = agent_x === x && agent_y === y;
  let backgroundColor = "";
  const currCellId = play.getBoard()[x][y];

  
  if (id === 0.25) {
    backgroundColor = "lightgreen";
  } else if (id === 0.5) {
    backgroundColor = "darkorange";
  } else if (id > 0.5) {
    backgroundColor = "red";
  } else if (currCellId.includes("G")) {
    backgroundColor = "gold"; 
  } else {
    backgroundColor = isAgentCell ? "dodgerblue" : "white";
  }



  const cellStyle = {
    fontWeight: isAgentCell ? "bold" : "normal",
    backgroundColor: backgroundColor,
    width: "20px",
    height: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: isAgentCell ? "white" : "black",
  };

  return (
    <div style={cellStyle}>
      {id}
    </div>
  );
}

export default CheatCell;
