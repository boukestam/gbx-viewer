import GameBoxParser from "./parser";
import { Node } from "./types";

import {parseChunk as parseCGameCtnCollectorList} from "./classes/CGameCtnCollectorList";
import {parseChunk as parseCGameCtnMediaBlockTriangles} from "./classes/CGameCtnMediaBlockTriangles";
import {parseChunk as parseCGameGhost} from "./classes/CGameGhost";
import {parseChunk as parseCGameCtnChallenge} from "./classes/CGameCtnChallenge";
import {parseChunk as parseCGameCtnBlockSkin} from "./classes/CGameCtnBlockSkin";
import {parseChunk as parseCGameCtnChallengeParameters} from "./classes/CGameCtnChallengeParameters";
import {parseChunk as parseCGameCtnMediaClip} from "./classes/CGameCtnMediaClip";
import {parseChunk as parseCGameCtnMediaTrack} from "./classes/CGameCtnMediaTrack";
import {parseChunk as parseCGameCtnMediaClipGroup} from "./classes/CGameCtnMediaClipGroup";
import {parseChunk as parseCGameCtnMediaBlockCameraGame} from "./classes/CGameCtnMediaBlockCameraGame";
import {parseChunk as parseCGameCtnGhost} from "./classes/CGameCtnGhost";
import {parseChunk as parseCGameCtnReplayRecord} from "./classes/CGameCtnReplayRecord";
import {parseChunk as parseCGameCtnMediaBlockCameraOrbital} from "./classes/CGameCtnMediaBlockCameraOrbital";
import {parseChunk as parseCGameCtnMediaBlockCameraPath} from "./classes/CGameCtnMediaBlockCameraPath";
import {parseChunk as parseCGameCtnMediaBlockCameraCustom} from "./classes/CGameCtnMediaBlockCameraCustom";
import {parseChunk as parseCGameCtnMediaBlockImage} from "./classes/CGameCtnMediaBlockImage";
import {parseChunk as parseCGameCtnMediaBlockText} from "./classes/CGameCtnMediaBlockText";
import {parseChunk as parseGameCtnMediaBlockTrails} from "./classes/GameCtnMediaBlockTrails";
import {parseChunk as parseCGameCtnMediaBlockTransitionFade} from "./classes/CGameCtnMediaBlockTransitionFade";
import {parseChunk as parseCGameCtnAnchoredObject} from "./classes/CGameCtnAnchoredObject";
import {parseChunk as parseCGameCtnMacroBlockInfo} from "./classes/CGameCtnMacroBlockInfo";
import {parseChunk as parseCGameCtnAutoTerrain} from "./classes/CGameCtnAutoTerrain";
import {parseChunk as parseGameCtnMediaBlockDOF} from "./classes/GameCtnMediaBlockDOF";
import {parseChunk as parseCGameWaypointSpecialProperty} from "./classes/CGameWaypointSpecialProperty";
import {parseChunk as parseCGameCtnZoneGenealogy} from "./classes/CGameCtnZoneGenealogy";
import {parseChunk as parseCGameCtnMediaBlockEntity} from "./classes/CGameCtnMediaBlockEntity";
import {parseChunk as parseCControlEffectSimi} from "./classes/CControlEffectSimi";
import {parseChunk as parseCPlugEntRecordData} from "./classes/CPlugEntRecordData";
import {parseChunk as parseCGameCtnCollector} from "./classes/CGameCtnCollector";
import {parseChunk as parseCGameItemModel} from "./classes/CGameItemModel";
import {parseChunk as parseCGameCommonItemEntityModelEdition} from "./classes/CGameCommonItemEntityModelEdition";
import {parseChunk as parseCPlugTreeGenerator} from "./classes/CPlugTreeGenerator";
import {parseChunk as parseCPlugCrystal} from "./classes/CPlugCrystal";
import {parseChunk as parseCPlugMaterialUserInst} from "./classes/CPlugMaterialUserInst";
import {parseChunk as parseCGameItemPlacementParam} from "./classes/CGameItemPlacementParam";
import {parseChunk as parseCtnMediaBlockCamFxShake} from "./classes/CtnMediaBlockCamFxShake";
import {parseChunk as parseGameCtnMediaBlockFog} from "./classes/GameCtnMediaBlockFog";
import {parseChunk as parseCGameCommonItemEntityModel} from "./classes/CGameCommonItemEntityModel";
import {parseChunk as parseCGameCtnMediaBlockFxColors} from "./classes/CGameCtnMediaBlockFxColors";

const chunks = [
  parseCGameCtnCollectorList,
  parseCGameCtnMediaBlockTriangles,
  parseCGameGhost,
  parseCGameCtnChallenge,
  parseCGameCtnBlockSkin,
  parseCGameCtnChallengeParameters,
  parseCGameCtnMediaClip,
  parseCGameCtnMediaTrack,
  parseCGameCtnMediaClipGroup,
  parseCGameCtnMediaBlockCameraGame,
  parseCGameCtnGhost,
  parseCGameCtnReplayRecord,
  parseCGameCtnMediaBlockCameraOrbital,
  parseCGameCtnMediaBlockCameraPath,
  parseCGameCtnMediaBlockCameraCustom,
  parseCGameCtnMediaBlockImage,
  parseCGameCtnMediaBlockText,
  parseGameCtnMediaBlockTrails,
  parseCGameCtnMediaBlockTransitionFade,
  parseCGameCtnAnchoredObject,
  parseCGameCtnMacroBlockInfo,
  parseCGameCtnAutoTerrain,
  parseGameCtnMediaBlockDOF,
  parseCGameWaypointSpecialProperty,
  parseCGameCtnZoneGenealogy,
  parseCGameCtnMediaBlockEntity,
  parseCControlEffectSimi,
  parseCPlugEntRecordData,
  parseCGameCtnCollector,
  parseCGameItemModel,
  parseCGameCommonItemEntityModelEdition,
  parseCPlugTreeGenerator,
  parseCPlugCrystal,
  parseCPlugMaterialUserInst,
  parseCGameItemPlacementParam,
  parseCtnMediaBlockCamFxShake,
  parseGameCtnMediaBlockFog,
  parseCGameCommonItemEntityModel,
  parseCGameCtnMediaBlockFxColors
];

export const skippableChunks = [
  0x2E002025, 0x2E002026, 0x2E002027,
  0x2e009001,
  0x2E020003, 0x2E020004,
  0x2E026001,

  0x03029002,

  0x03043034, 0x03043036, 0x03043038, 0x0304303e, 0x03043044, 0x0304304f,
  0x03043055, 0x03043057, 0x03043058, 0x03043059, 0x0304305a, 
  0x0304305b, 0x0304305c, 0x0304305d,
  0x0304305e, 0x0304305f, 0x03043060, 0x03043061, 0x03043064, 0x03043067, 

  0x0303f007,

  0x0305b00a, 0x0305b00e,

  0x03092013, 0x0309201a, 0x0309201b, 0x03092022, 0x03092023, 0x03092024, 
  0x03092026, 0x03092027, 0x03092028, 0x03092029, 0x0309202A, 0x0309202B,
  0x0309202C, 0x0309202D,

  0x0309301A, 0x0309301B, 0x0309301C, 0x0309301D, 0x0309301E, 0x0309301F, 
  0x03093020, 0x03093021, 0x03093022, 0x03093023, 0x03093025, 0x03093026,
  0x03093027, 0x03093028,

  0x03101004, 0x03101005,

  0x0310d00b, 0x0310d00c, 0x0310d010, 0x0310d011,

  0x40000006,

  0x09003004
];

export const parsableSkippableChunks = [
  0x2E020000, 0x2E020001,

  0x03043018, 0x03043019, 0x0304301c, 0x03043029, 
  0x0304303d, 0x03043040, 0x03043042, 0x03043043,
  0x03043048, 0x0304304b, 0x03043050, 0x03043051,
  0x03043052, 0x03043053, 0x03043054, 0x03043056, 
  0x03043062, 0x03043063,
  0x03043065, 0x03043066, 0x03043068, 0x03043069,

  0x03092000, 0x03092005, 0x03092008, 0x03092009, 0x0309200a, 0x0309200b,
  0x03092013, 0x03092014, 0x03092017, 0x0309201d, 0x03092025,

  0x03093018
];

export function getChunkInfo(chunkId: number) {
  const info = {
    skippable: false,
    parsableSkippable: false,
  };

  if (skippableChunks.indexOf(chunkId) !== -1) info.skippable = true;

  if (parsableSkippableChunks.indexOf(chunkId) !== -1)
    info.parsableSkippable = true;

  return info;
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  for (const chunk of chunks) {
    const result = chunk(p, chunkId, node);
    if (typeof result === 'object') return result;
    if (result) return;
  }
  
  // Unknown chunk
  throw new Error("Unknown chunk " + chunkId.toString(16));
}
