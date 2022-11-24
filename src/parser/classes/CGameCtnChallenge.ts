import { parseBlocks } from "../blocks";
import { Chunk, Node, Vec3 } from "../types";
import GameBoxParser from "../parser";
import AdmZip from "adm-zip";
import { Block } from "../nodes";

export enum DifficultyColor {
  Default,
  White,
  Green,
  Blue,
  Red,
  Black
}

function parseBakedBlock(p: GameBoxParser): Block {
  const name = p.lookBackString();
  const rotation = p.byte();
  let coord = p.byte3();
  const flags = p.int32();

  if (flags !== -1) {
    coord = coord.sub(new Vec3(1, 0, 1));
  }

  return {name, rotation, coord, flags};
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0304300d) {
    const [vehicle, collection, author] = p.meta();
    return { vehicle, collection, author };
  } else if (chunkId === 0x03043011) {
    const collectorList = p.nodeRef();
    const challengeParameters = p.nodeRef();
    const kind = p.uint32();

    return { collectorList, challengeParameters, kind };
  } else if (chunkId === 0x03043018) {
    const isLapRace = p.bool();
    const lapCount = p.int32();
    return {isLapRace, lapCount};
  } else if (chunkId === 0x03043019) {
    const modPackDesc = p.fileRef();
    return {modPackDesc};
  } else if (chunkId === 0x0304301f || chunkId === 0x03043013) {
    const blocks = parseBlocks(p, chunkId);
    return blocks;
  } else if (chunkId === 0x03043022) {
    p.skip(4);
    return true;
  } else if (chunkId === 0x03043024) {
    const customMusicPackDesc = p.fileRef();
    return { customMusicPackDesc };
  } else if (chunkId === 0x03043025) {
    const mapCoordOrigin = p.vec2();
    const mapCoordTarget = p.vec2();
    return { mapCoordOrigin, mapCoordTarget };
  } else if (chunkId === 0x03043026) {
    const clipGlobal = p.nodeRef();
    return { clipGlobal };
  } else if (chunkId === 0x03043027) {
    const archiveGmCamVal = p.uint32();
    if (archiveGmCamVal) {
      // ignored
      p.skip(1 + 9 + 3 + 4 * 3);
    }
    return true;
  } else if (chunkId === 0x03043028) {
    const chunk = parseChunk(p, 0x03043027, node);
    const comments = p.string();
    return { chunk, comments };
  } else if (chunkId === 0x03043029) {
    const hashedPassword = p.bytes(16);
    const crc32 = p.uint32();
    return { hashedPassword, crc32 };
  } else if (chunkId === 0x0304302a) {
    p.skip(4);
    return true;
  } else if (chunkId === 0x03043040) {
    const version = p.int32();
    p.skip(4);
    const size = p.int32();

    p = p.encapsulate();

    p.skip(4);

    const anchoredObjects = p.list(() => p.parseNode()) as Node[];

    if (version >= 1 && version !== 5) {
      const itemsOnItem = p.list(() => p.int2());

      for (const item of itemsOnItem) {
        anchoredObjects[item.y].chunks.push({id: 0, placedOnItem: anchoredObjects[item.x]} as Chunk);
      }
    }

    let blockIndexes, snapItemGroups, itemIndexes, snappedIndexes;

    if (version >= 5) {
      blockIndexes = p.list(() => p.int32());
      
      if (version < 7) {
        snapItemGroups = p.list(() => p.int32());
      }

      if (version >= 6) {
        itemIndexes = p.list(() => p.int32());
      }

      if (version >= 7) {
        snapItemGroups = p.list(() => p.int32());
      }

      if (version !== 6) {
        p.list(() => p.int32());
      }

      snappedIndexes = p.list(() => p.int32());

      if (version >= 8) throw new Error("Version not supported");
    }

    return {size, anchoredObjects, blockIndexes, snapItemGroups, itemIndexes, snappedIndexes};
  } else if (chunkId === 0x03043042) {
    const version = p.int32();
    const authorVersion = p.int32();
    const authorLogin = p.string();
    const authorNickname = p.string();
    const authorZone = p.string();
    const authorExtraInfo = p.string();

    return {authorVersion, authorLogin, authorNickname, authorZone, authorExtraInfo};
  } else if (chunkId === 0x03043043) {
    p.skip(4);

    const sizeOfNodeWithClassId = p.int32();

    p = p.encapsulate();

    const genealogies = p.list(() => p.parseNode());

    return {sizeOfNodeWithClassId, genealogies};
  } else if (chunkId === 0x03043048) {
    const version = p.int32();

    if (version >= 1) throw new Error("Version not supported");

    p.skip(4);

    const count = p.int32();
    const bakedBlocks: Block[] = [];

    for (let i = 0; i < count; i++) {
      const block = parseBakedBlock(p);
      bakedBlocks.push(block);

      if (block.flags === -1) i--;
    }

    while ((p.peekUint32() & 0xC0000000) > 0) {
      bakedBlocks.push(parseBakedBlock(p));
    }

    p.skip(4);

    const bakedClipsAdditionalData = p.list(() => {
      const clip1 = p.meta();
      const clip2 = p.meta();
      const clip3 = p.meta();
      const clip4 = p.meta();
      const coord = p.int3();
      return {clip1, clip2, clip3, clip4, coord};
    });

    return {bakedBlocks, bakedClipsAdditionalData};
  } else if (chunkId === 0x03043049) {
    const version = p.uint32();

    const clipIntro = p.nodeRef();
    const clipPodium = p.nodeRef();
    const clipGroupInGame = p.nodeRef();
    const clipGroupEndRace = p.nodeRef();

    let clipAmbiance;
    if (version >= 2) {
      clipAmbiance = p.nodeRef();
    }

    let triggerSize;
    if (version >= 1) {
      triggerSize = p.int3();
    }

    return {
      version,
      clipIntro,
      clipPodium,
      clipGroupInGame,
      clipGroupEndRace,
      clipAmbiance,
      triggerSize,
    };
  } else if (chunkId === 0x0304304b) {
    const objectiveTextAuthor = p.string();
    const objectiveTextGold = p.string();
    const objectiveTextSilver = p.string();
    const objectiveTextBronze = p.string();
    return {objectiveTextAuthor, objectiveTextGold, objectiveTextSilver, objectiveTextBronze};
  } else if (chunkId === 0x03043050) {
    const version = p.int32();
    const triggerSize = p.vec3();

    const offzones = p.list(() => [p.int3(), p.int3()]);

    return {triggerSize, offzones};
  } else if (chunkId === 0x03043051) {
    const version = p.int32();
    const titleId = p.lookBackString();
    const buildVersion = p.string();

    return {titleId, buildVersion};
  } else if (chunkId === 0x03043052) {
    const version = p.int32();
    const decoBaseHeightOffset = p.int32();

    return {decoBaseHeightOffset};
  } else if (chunkId === 0x03043053) {
    const version = p.int32();
    const botPaths = p.list(() => {
      const clan = p.int32();
      const path = p.list(() => p.vec3());
      const isFlying = p.bool();
      const waypointSpecialProperty = p.nodeRef();
      const isAutonomous = p.bool();

      return {clan, path, isFlying, waypointSpecialProperty, isAutonomous};
    });
    
    return {botPaths};
  } else if (chunkId === 0x03043054) {
    const version = p.int32();
    p.skip(4);
    const size = p.int32();

    p = p.encapsulate();

    const embedded = p.list(() => p.meta());

    const embeddedData: {[name: string]: any} = {};
    const data = p.bytes(p.int32());

    if (data.length > 0) {
      const zip = new AdmZip(data);
      const entries = zip.getEntries();

      for (const entry of entries) {
        const e = new GameBoxParser(entry.getData());
        try {
          embeddedData[entry.name] = e.parse();
        } catch (e) {
          console.warn("Error while parsing embedded data: " + entry.name);
          console.warn(e);
        }
      }
    }

    const textures = p.list(() => p.string());

    return {size, embedded, embeddedData, textures};
  } else if (chunkId === 0x03043056) {
    const version = p.int32();
    p.skip(4);

    const dayTime = p.uint32();
    p.skip(4);

    const dynamicDayLight = p.bool();
    const dayDuration = p.int32();

    return {dayTime, dynamicDayLight, dayDuration};
  } else if (chunkId === 0x03043062) {
    const version = p.int32();

    if (version > 0) throw new Error("Version not supported");

    for (const block of node.blocks) {
      block.color = p.byte() as DifficultyColor;
    }

    for (const block of node.bakedBlocks) {
      block.color = p.byte() as DifficultyColor;
    }

    for (const item of node.anchoredObjects) {
      item.color = p.byte() as DifficultyColor;
    }

    return true;
  } else if (chunkId === 0x03043063) {
    const version = p.int32();

    if (version > 0) throw new Error("Version not supported");

    for (const item of node.anchoredObjects) {
      item.animationPhaseOffset = p.byte();
    }

    return true;
  } else if (chunkId === 0x03043065) {
    const version = p.int32();

    if (version > 0) throw new Error("Version not supported");

    for (const item of node.anchoredObjects) {
      const hasForegroundPackDesc = p.bool(true);
      if (hasForegroundPackDesc) {
        item.foregroundPackDesc = p.fileRef();
      }
    }

    return true;
  } else if (chunkId === 0x03043068) {
    const version = p.int32();

    if (version > 1) throw new Error("Version not supported");

    for (const block of node.blocks) {
      block.lightMapQuality = p.byte();
    }

    for (const block of node.bakedBlocks) {
      block.lightMapQuality = p.byte();
    }

    for (const item of node.anchoredObjects) {
      item.lightMapQuality = p.byte();
    }

    return true;
  } else if (chunkId === 0x03043069) {
    const version = p.int32();

    if (version > 0) throw new Error("Version not supported");

    const dict: {[id: number]: any} = {};

    for (const block of node.blocks) {
      const macroBlockId = p.int32();

      if (macroBlockId === -1) continue;

      if (macroBlockId in dict) {
        block.macroBlockReference = dict[macroBlockId];
      } else {
        const instance = {};
        dict[macroBlockId] = instance;
        block.macroBlockReference = instance;
      }
    }

    for (const item of node.anchoredObjects) {
      const macroBlockId = p.int32();

      if (macroBlockId === -1) continue;

      if (macroBlockId in dict) {
        item.macroBlockReference = dict[macroBlockId];
      } else {
        const instance = {};
        dict[macroBlockId] = instance;
        item.macroBlockReference = instance;
      }
    }

    const idFlagsPair = p.list(() => p.int2());

    for (const pair of idFlagsPair) {
      dict[pair.x].flags = pair.y;
    }

    return {macroBlockInstances: Object.values(dict)};
  }
}