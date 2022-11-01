import { Vec3 } from "./parser";

export interface Block {
  blockName: string;
  rotation: number;
  x: number;
  y: number;
  z: number;
  author: any;
  skin: any;
  blockParameters: any;
}

export interface Environment {
  trackUID: string;
  environment: string;
  mapAuthor: string;
  trackName: string;
  timeOfDay: string;
  decorationAuthor: string;
  decorationEnvironment: string;
  size: Vec3;
  needUnlock: boolean;
  blocks: Block[];
}

export interface Archive {
  blockName: string;
  collection: string;
  author: string;
  numPieces: number;
}

export interface Chunk {
  id: number;
}

export interface Node {
  id: number;
  chunks: Chunk[];
}
