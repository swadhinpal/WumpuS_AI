import { play } from "./Play";

function Cell({ id, cheatMode, x, y }) {
  let imgid, imageSize=40;

  const agent_x = play.agentIndex.row;
  const agent_y = play.agentIndex.column;

  const isAgentCell = agent_x === x && agent_y === y;
  if (isAgentCell) {
    id = "A";
  }

  if (id.length > 1) {

    if (id.includes("T") && id.includes("B") && id.includes("G")) {
      id = "TBG";
    }
    else if (id.includes("T") && id.includes("B") && id.includes("W")) {
      id = "TBW";
    }
    else if (id.includes("T") && id.includes("B") && id.includes("P")) {
      id = "TBP";
    }
    else if (id.includes("T") && id.includes("B") && id.includes("F")) {
      id = "TBF";
    }
    else if (id.includes("T") && id.includes("B") && id.includes("D")) {
      id = "TBD";
    }
    else if (id.includes("T") && id.includes("G")) {
      id = "TG";
    }
    else if (id.includes("B") && id.includes("G")) {
      id = "BG";
    }
    else if (id.includes("T") && id.includes("B")) {
      id = "TB";
    }
    else if (id.includes("T") && id.includes("P")) {
      id = "TP";
    }
    else if (id.includes("B") && id.includes("P")) {
      id = "BP";
    }
    else if (id.includes("T") && id.includes("W")) {
      id = "TW";
    }
    else if (id.includes("B") && id.includes("W")) {
      id = "BW";
    }
    else if (id.includes("T") && id.includes("F")) {
      id = "TF";
    }
    else if (id.includes("B") && id.includes("F")) {
      id = "BF";
    }
    else if (id.includes("G"))
    {
      id ="G";
    }
    else if (id.includes("P"))
    {
      id ="P";
    }
    else if (id.includes("W"))
    {
      id ="W";
    }
    else if (id.includes("T"))
    {
        id ="T";
    }
    else if (id.includes("B"))
    {
      id ="B";
    }
    else if (id.includes("F"))
    {
      id ="F";
    }
    else id ="S";

    /*
    if (
      id == "TB" ||
      id == "BT" ||
      //id == "TBG" ||
      //id == "BTG" ||
      id == "TBS" ||
      id == "SBS" ||
      (id.includes("T") && id.includes("B"))
    ) {
      id = "TB";
    }
    if (id == "TG" || id == "GT" || (id.includes("T") && id.includes("G"))) {
      id = "TG";
    }
    if (id == "BG" || id == "GB" || (id.includes("G") && id.includes("B"))) {
      id = "BG";
    }
    if (
      id == "SG" ||
      id == "GS" ||
      id == "SGG" ||
      id == "SSG" ||
      id.includes("G")
    ) {
      id = "G";
    }
    
    if (id == "SB" || id == "BS" || (id.includes("B") && id.includes("S"))) {
      id = "B";
    }
    if (id == "TS" || (id.includes("T") && id.includes("S"))) {
      id = "T";
    }
    if (id == "WT" || id == "TW" || (id.includes("T") && id.includes("W"))) {
      id = "W";
    }
    if (id.includes("P")) {
      id = "P";
    }
    if (id == "" || id == "SS" || id == "" || id.includes("S")) {
      id = "S";
    }*/

    imgid = `/assets/${id}.png`;
  } else {
    imgid = `/assets/${id}.png`;
  }

  if (id == 0) {
    imgid = `/assets/S.png`;
  }

  
  if (cheatMode && id !== "A" && !play.cellVisited[x][y]) {
    imgid = "/assets/cover.png";
    imageSize = 50;
  }

  return (
    <div>
      <img src={imgid} width={imageSize} height={imageSize} alt={id} />
    </div>
  );
}

export default Cell;