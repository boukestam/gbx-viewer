import React, { useEffect, useState } from "react";
import "./App.css";
import { Environment, Ghost, Sample } from "./parser/nodes";
import MapParser from "./parser/parser";
import { Chunk } from "./parser/types";
import { Renderer } from "./Renderer";

const mapUrl = "/data/Simple TECH 1.Map.Gbx";
const replayUrl = "/data/Simple TECH 1.Replay.Gbx";

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

  const parser = new MapParser(Buffer.from(buffer));
  const result = await parser.parse();

  return result;
}

function getChunk<T>(chunks: Chunk[], id: number) {
  return chunks.find((chunk) => chunk.id === id) as T | undefined;
}

async function loadMap(url: string): Promise<Environment> {
  const result = await loadGbx(url);

  const environment = getChunk<Environment>(result.body, 0x0304301f);

  if (!environment) throw new Error("No environment found in map file");

  return environment;
}

async function loadGhost(url: string): Promise<GhostSamples> {
  const result = await loadGbx(url);

  const ghost =
    getChunk<Ghost>(result.body, 0x03092000) ||
    getChunk<Ghost>(
      getChunk<any>(result.body, 0x03093014).ghosts[0].chunks,
      0x03092000
    );

  if (!ghost) throw new Error("No ghost found in map file");

  const samples: Sample[] = [];
  for (const chunk of ghost.recordData.chunks) {
    const sampleChunk = chunk as { samples?: Sample[] };
    if (sampleChunk.samples) {
      for (const sample of sampleChunk.samples) {
        if (sample.transform) samples.push(sample);
      }
    }
  }

  return { ...ghost, samples: samples };
}

function App() {
  const [map, setMap] = useState<Environment | null>(null);
  const [ghost, setGhost] = useState<GhostSamples | null>(null);

  useEffect(() => {
    loadMap(mapUrl).then(setMap);
    loadGhost(replayUrl).then(setGhost);
  }, []);

  return (
    <div className="App">
      {(!map || !ghost) && "Loading..."}
      {map && ghost && <Renderer map={map} ghost={ghost} />}
    </div>
  );
}

export default App;
