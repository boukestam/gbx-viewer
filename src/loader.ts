import { Ghost, Sample, CGameCtnChallenge } from "./parser/nodes";
import GameBoxParser from "./parser/parser";

export interface GhostSamples extends Ghost {
  samples: Sample[];
}

export async function loadGbx(url: string) {
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

export async function loadMap(
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

  const samples: Sample[] = [];
  for (const sample of ghost.recordData.samples) {
    if (sample.transform) samples.push(sample);
  }

  return { ...ghost, samples: samples };
}

export async function loadGhost(url: string): Promise<GhostSamples> {
  const replay = await loadGbx(url);

  return parseGhost(replay.body as unknown as Ghost);
}