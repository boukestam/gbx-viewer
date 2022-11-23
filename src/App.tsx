import React, { useEffect, useState } from "react";
import "./App.css";
import { CGameCtnChallenge, Ghost, Sample } from "./parser/nodes";
import GameBoxParser from "./parser/parser";
import { Renderer } from "./Renderer";

//const name = "Stuartville Track";
//const name = "Niepodlegli (ft mime)";
//const name = "Aqua";
const name = "TestPivots";
//const namce = "TestCurves";

const mapUrl = `/data/${name}.Map.Gbx`;
const replayUrl = `/data/${name}.Replay.Gbx`;

export interface GhostSamples extends Ghost {
  samples: Sample[];
}

async function loadGbx(url: string) {
  const response = await fetch(url);

  if (response.status !== 200) {
    console.error(response);
    throw new Error("Unable to load gbx file");
  }

  const buffer = await response.arrayBuffer();

  const parser = new GameBoxParser(Buffer.from(buffer));
  const result = parser.parse();

  console.log(url, result);

  return result;
}

async function loadMap(
  url: string
): Promise<{ map: CGameCtnChallenge; ghost?: GhostSamples }> {
  const map = await loadGbx(url);

  return {
    map: map.body as unknown as CGameCtnChallenge,
    ghost:
      map.body.raceValidateGhost &&
      parseGhost(map.body.raceValidateGhost as Ghost),
  };
}

function parseGhost(body: any): GhostSamples {
  const ghost = body.recordData ? body : body.ghosts[0];

  console.log(ghost);

  const samples: Sample[] = [];
  for (const sample of ghost.recordData.samples) {
    if (sample.transform) samples.push(sample);
  }

  return { ...ghost, samples: samples };
}

async function loadGhost(url: string): Promise<GhostSamples> {
  const replay = await loadGbx(url);

  return parseGhost(replay.body as unknown as Ghost);
}

function App() {
  const [map, setMap] = useState<CGameCtnChallenge | null>(null);
  const [ghost, setGhost] = useState<GhostSamples | null>(null);

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
      {(!map || !ghost) && "Loading..."}
      {map && ghost && <Renderer map={map} ghost={ghost} />}
    </div>
  );
}

export default App;
