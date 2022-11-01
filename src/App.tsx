import React, { useEffect, useState } from "react";
import "./App.css";
import { Environment } from "./parser/nodes";
import MapParser from "./parser/parser";
import { Renderer } from "./Renderer";

function App() {
  const [map, setMap] = useState<Environment | null>(null);

  useEffect(() => {
    fetch(
      //"/data/Maps/Campaigns/CurrentQuarterly/Fall 2022 - 01.Map.Gbx"
      //"/data/Blocks/Stadium/GamepadEditor/DirtRoadFlat/Checkpoints/Start/Ground.Macroblock.Gbx"
      "/data/ghost.gbx"
    ).then((response) => {
      if (response.status !== 200) {
        console.error("Unable to load gbx file");
        return;
      }

      response.arrayBuffer().then((buffer) => {
        const parser = new MapParser(Buffer.from(buffer));
        parser.parse().then((result) => {
          console.log(result);
          const environment: Environment = result.body.find(
            (chunk) => chunk.id == 0x0304301f
          ) as unknown as Environment;
          setMap(environment);
        });
      });
    });
  }, []);

  return (
    <div className="App">
      {!map && "Loading..."}
      {map && <Renderer map={map} />}
    </div>
  );
}

export default App;
