import * as THREE from "three";
import { Block, CGameCtnAnchoredObject, CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { createGrass } from "./grass";
import { createCrystal, createMesh } from "./mesh";
import { getPlatformCurve, getPlatformSurface } from "./platform";
import { getRoadCurve, getRoadSurface } from "./road";
import { createSurface } from "./surface";
import { getTrackWallCurve, getTrackWallSurface } from "./trackWall";

export interface BlockMesh {
  mesh: THREE.InstancedMesh;
  rotation?: Vec3;
  offset?: Vec3;
  pivot?: Vec3;
}

export function getBlockInfo(block: Block) {
  let name = block.name + (block.color ? block.color.toString() : '');

  let isPillar = false;

  if (name.includes("Pillar")) {
    isPillar = true;
    name = name.replace(/Pillar/, "");
  }

  let curveFunc, surfaceFunc, curve;

  if (name.includes("Road")) {
    curveFunc = getRoadCurve(block.name);
    surfaceFunc = getRoadSurface;
  } else if (name.startsWith("Platform")) {
    curveFunc = getPlatformCurve(block.name);
    surfaceFunc = getPlatformSurface;
  } else if (name.startsWith("TrackWall")) {
    curveFunc = getTrackWallCurve(block.name);
    surfaceFunc = getTrackWallSurface;
  }

  if (curveFunc) {
    curve = curveFunc(block);
    if (curve.name) name = curve.name;
  }

  return {name, curve, surfaceFunc, isPillar};
}

export function createBlock(block: Block, count: number): BlockMesh | null {
  const info = getBlockInfo(block);

  if (info.name.includes("FC")) return null;

  let mesh: BlockMesh | null = null;

  if (info.name === "Grass") {
    mesh = createGrass(count);
  }

  if (!mesh && info.curve && info.surfaceFunc) {
    const surface = info.surfaceFunc(block);
    mesh = createSurface(surface, info.curve, count);
  }

  return mesh;
  
  //throw new Error("Unknown block type: " + name);
}

export function createAnchoredObject(object: CGameCtnAnchoredObject, map: CGameCtnChallenge, count: number): BlockMesh | null {
  if (!map.embeddedData) return null;
  
  const item = Object.values(map.embeddedData).find((item) => item.body.info[0] === object.itemModel[0]);

  if (item) {
    const crystal = item.body.entityModelEdition.meshCrystal;
    const meshOutput = createCrystal(crystal, object.color);
    const mesh = {mesh: createMesh(meshOutput, count)};
    return mesh;
  }

  return null;
}