import { DifficultyColor } from "./classes/CGameCtnChallenge";
import { EItemType } from "./classes/CGameItemModel";
import { ELayerType } from "./classes/CPlugCrystal";
import { Color, FileRef, Transform, Vec3, Node, Vec2 } from "./types";

export interface Block {
  blockName: string;
  rotation: number;
  x: number;
  y: number;
  z: number;
  author: any;
  skin: any;
  blockParameters: any;
  color?: DifficultyColor;
}

export interface Material {
  isNatural: boolean;
  isUsingGameMaterial: boolean;
  link: string;
  surfacePhysicId: number;
  textureSizeInMeters: number;
  tilingU: number;
  tilingV: number;
  userTextures: string[];
}

export interface GeometryLayer {
  faces: {
    group: {
      name: string;
    };
    material: Material;
    verts: {
      position: Vec3;
      uv: Vec2;
    }[];
  }[];
}

export interface CGameItemModel {
  entityModelEdition: {
    meshCrystal: {
      layers: {
        type: ELayerType;
        [key: string]: any;
      }[];
      materials: Material[];
    }
  };
  groundPoint: Vec3;
  info: [string, string, string];
  itemTypeE: EItemType;
  orbitalCenterHeightFromGround: number;
  orbitalPreviewAngle: number;
  orbitalRadiusBase: number;
  waypointType: number;
}

export interface CGameCtnAnchoredObject {
  absolutePositionInMap: Vec3;
  blockUnitCoord: Vec3;
  color: number;
  itemModel: [string, string, string];
  pitchYawRoll: Vec3;
  pivotPosition: Vec3;
  scale: number;
  waypointSpecialProperty?: {
    tag: string;
    order: number;
  };
}

export interface CGameCtnChallenge {
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
  anchoredObjects?: CGameCtnAnchoredObject[];
  embeddedData?: {
    [name: string]: {
      body: CGameItemModel;
    }
  };
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