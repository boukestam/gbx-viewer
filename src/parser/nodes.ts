import { Color, FileRef, Transform, Vec3, Node } from "./types";

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

export interface Sample {
  timestamp: number;
  transform?: Transform;
  rpm?: number;
  steer?: number;
  gas?: number;
  brake?: number;
  gear?: number;
};

export interface Ghost {
  ghostAvatarName: string;
  ghostClubTag: string;
  ghostNickname: string;
  ghostTrigram: string;
  ghostZone: string;
  hasBadges: boolean;
  lightTrailColor: Color;
  playerModel: [string, string, string];
  recordData: Node;
  recordingContext: string;
  skinPackDescs: FileRef[];
  version: number;
}