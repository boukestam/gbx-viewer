import React, { useEffect, useState } from "react";
import "./App.css";
import { GhostSamples, loadGhost, loadMap } from "./loader";
import { CGameCtnChallenge } from "./parser/nodes";
import { Renderer } from "./Renderer";

//const name = "Stuartville Track";
//const name = "Niepodlegli (ft mime)";
//const name = "Aqua";
const name = "Deep Dip";
//const name = "TestPivots";
//const name = "TestCurves";

const mapUrl = `/maps/${name}.Map.Gbx`;
const replayUrl = `/maps/${name}.Replay.Gbx`;

function App() {
  const [map, setMap] = useState<CGameCtnChallenge | undefined>();
  const [ghost, setGhost] = useState<GhostSamples | undefined>();

  useEffect(() => {
    loadMap(mapUrl)
      .then((result) => {
        setMap(result.map);
        if (result.ghost) setGhost(result.ghost);
        else
          loadGhost(replayUrl)
            .then(setGhost)
            .catch((e) => {
              console.error("Error while parsing replay");
              console.error(e);
            });
      })
      .catch((e) => {
        console.error("Error while parsing map");
        console.error(e);
      });
  }, []);

  return (
    <div className="App">
      {!map && "Loading..."}
      {map && <Renderer map={map} ghost={ghost} />}
    </div>
  );
}

export default App;
