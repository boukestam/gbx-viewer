import * as THREE from "three";
import { Block, CGameCtnAnchoredObject, CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { getBlockName } from "../render/blocks";
import { createDeco } from "./deco";
import { createGrass } from "./grass";
import { createCrystal, createMesh } from "./mesh";
import { createPlatform } from "./platform";
import { createRoad } from "./road";
import { createTrackWall } from "./trackWall";

export interface BlockMesh {
  mesh: THREE.InstancedMesh;
  rotation?: Vec3;
  offset?: Vec3;
  pivot?: Vec3;
}

const cache: {[name: string]: BlockMesh | null} = {};

export function createBlock(block: Block, count: number): BlockMesh | null {
  const name = getBlockName(block);

  if (name.includes("FC")) return null;

  if (name in cache) return cache[name];

  let mesh;

  if (block.name === "Grass") mesh = createGrass(count);
  else if (name.includes("Road")) mesh = createRoad(block, count);
  else if (name.startsWith("Deco")) mesh = createDeco(block, count);
  else if (name.startsWith("Platform")) mesh = createPlatform(block, count);
  else if (name.startsWith("TrackWall")) mesh = createTrackWall(block, count);
  else mesh = createDeco(block, count);

  cache[name] = mesh;

  return mesh;
  
  //throw new Error("Unknown block type: " + name);
}

export function createAnchoredObject(object: CGameCtnAnchoredObject, map: CGameCtnChallenge, count: number): BlockMesh | null {
  if (object.itemModel[0] in cache) return cache[object.itemModel[0]];
  
  if (!map.embeddedData) return null;
  
  const item = Object.values(map.embeddedData).find((item) => item.body.info[0] === object.itemModel[0]);

  if (item) {
    const crystal = item.body.entityModelEdition.meshCrystal;
    const meshOutput = createCrystal(crystal, object.color);
    const mesh = {mesh: createMesh(meshOutput, count)};
    cache[object.itemModel[0]] = mesh;
    return mesh;
  }

  return null;
}