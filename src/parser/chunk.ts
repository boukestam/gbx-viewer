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
import {parseChunk as parseGameCtnMediaBlockTrails} from "./classes/CGameCtnMediaBlockTrails";
import {parseChunk as parseCGameCtnMediaBlockTransitionFade} from "./classes/CGameCtnMediaBlockTransitionFade";
import {parseChunk as parseCGameCtnAnchoredObject} from "./classes/CGameCtnAnchoredObject";
import {parseChunk as parseCGameCtnMacroBlockInfo} from "./classes/CGameCtnMacroBlockInfo";
import {parseChunk as parseCGameCtnAutoTerrain} from "./classes/CGameCtnAutoTerrain";
import {parseChunk as parseGameCtnMediaBlockDOF} from "./classes/CGameCtnMediaBlockDOF";
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
import {parseChunk as parseCtnMediaBlockCamFxShake} from "./classes/CGameCtnMediaBlockCamFxShake";
import {parseChunk as parseGameCtnMediaBlockFog} from "./classes/CGameCtnMediaBlockFog";
import {parseChunk as parseCGameCommonItemEntityModel} from "./classes/CGameCommonItemEntityModel";
import {parseChunk as parseCGameCtnMediaBlockFxColors} from "./classes/CGameCtnMediaBlockFxColors";
import {parseChunk as parseCGameCtnMediaBlockSound} from "./classes/CGameCtnMediaBlockSound";
import {parseChunk as parseCGameCtnMediaBlockInterface} from "./classes/CGameCtnMediaBlockInterface";
import {parseChunk as parseCGameCtnMediaBlockDirtyLens} from "./classes/CGameCtnMediaBlockDirtyLens";
import {parseChunk as parseCGameBlockItem} from "./classes/CGameBlockItem";

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
  parseCGameCtnMediaBlockFxColors,
  parseCGameCtnMediaBlockSound,
  parseCGameCtnMediaBlockInterface,
  parseCGameCtnMediaBlockDirtyLens,
  parseCGameBlockItem
];

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  for (const chunk of chunks) {
    const result = chunk(p, chunkId, node);
    if (typeof result === 'object') return result;
    if (result) return;
  }
  
  // Unknown chunk
  throw new Error("Unknown chunk " + chunkId.toString(16));
}
