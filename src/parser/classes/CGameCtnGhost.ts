import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03092000) {
    const version = p.uint32();
    const playerModel = p.meta();
    const lightTrailColor = p.color();
    const skinPackDescs = p.list(() => p.fileRef());
    const hasBadges = p.bool();

    if (hasBadges) {
      p.skip(4);
      p.vec3();
      p.list(() => {
        p.string();
        p.string();
      });
      p.list(() => p.string());
    }

    const ghostNickname = p.string();
    const ghostAvatarName = p.string();

    let recordingContext, recordData, ghostTrigram, ghostZone, ghostClubTag;

    if (version >= 2) {
      recordingContext = p.string();

      if (version >= 4) {
        p.skip(4);

        if (version >= 5) {
          recordData = p.nodeRef();
          p.list(() => p.int32());

          if (version >= 6) {
            ghostTrigram = p.string();

            if (version >= 7) {
              ghostZone = p.string();

              if (version >= 8) {
                ghostClubTag = p.string();

                if (version > 8) {
                  throw new Error("Invalid CGameCtnGhost version: " + version);
                }
              }
            }
          }
        }
      }
    }

    return {
      version,
      playerModel,
      lightTrailColor,
      skinPackDescs,
      hasBadges,
      ghostNickname,
      ghostAvatarName,
      recordingContext,
      recordData,
      ghostTrigram,
      ghostZone,
      ghostClubTag,
    };
  } else if (chunkId === 0x03092005) {
    const raceTime = p.uint32();
    return { raceTime };
  } else if (chunkId === 0x03092008) {
    const numRespawns = p.int32();
    return { numRespawns };
  } else if (chunkId === 0x03092009) {
    const lightTrailColor = p.color();
    return { lightTrailColor };
  } else if (chunkId === 0x0309200a) {
    const stuntsScore = p.uint32();
    return { stuntsScore };
  } else if (chunkId === 0x0309200b) {
    const checkpoints = p.list(() => {
      const time = p.uint32();
      const stuntsScore = p.uint32();
      return { time, stuntsScore };
    });
    return { checkpoints };
  } else if (chunkId === 0x0309200c) {
    p.skip(4);
    return true;
  } else if (chunkId === 0x0309200e) {
    const uid = p.lookBackString(true);
    return { uid };
  } else if (chunkId === 0x0309200f) {
    const ghostLogin = p.string();
    return { ghostLogin };
  } else if (chunkId === 0x03092010) {
    p.lookBackString();
    return true;
  } else if (chunkId === 0x03092011) {
    const eventsDuration = p.int32();
    if (eventsDuration === 0 && !node.Is025Ver1) return { eventsDuration };

    p.skip(4);
    const controlNames = p.list(() => p.lookBackString());

    const numControlEntries = p.int32();
    p.skip(4);

    const controlEntries = [];
    for (let i = 0; i < numControlEntries; i++) {
      const time = p.int32() - 100000;
      const controlNameIndex = p.byte();
      const onoff = p.uint32();
      controlEntries.push({ time, controlNameIndex, onoff });
    }

    const gameVersion = p.string();
    const exeChecksum = p.uint32();
    const osKind = p.int32();
    const cpuKind = p.int32();
    const raceSettingsXML = p.string();

    return {
      eventsDuration,
      controlNames,
      controlEntries,
      gameVersion,
      exeChecksum,
      osKind,
      cpuKind,
      raceSettingsXML,
    };
  } else if (chunkId === 0x03092012) {
    p.skip(20);
    return true;
  } else if (chunkId === 0x03092014) {
    p.skip(4);
    return true;
  } else if (chunkId === 0x03092015) {
    const playerMobilId = p.lookBackString();
    return { playerMobilId };
  } else if (chunkId === 0x03092017) {
    const skinPackDescs = p.list(() => p.fileRef());
    const ghostNickname = p.string();
    const ghostAvatarName = p.string();
    return { skinPackDescs, ghostNickname, ghostAvatarName };
  } else if (chunkId === 0x03092018) {
    p.meta();
    return true;
  } else if (chunkId === 0x03092019) {
    const chunk = parseChunk(p, 0x03092011, node);

    if (!(chunk.eventsDuration === 0 && !node.Is025Ver1)) p.skip(4);

    return chunk;
  } else if (chunkId === 0x0309201c) {
    p.skip(32);
    return true;
  } else if (chunkId === 0x0309201d) {
    const version = p.uint32();

    if (version < 2) {
      throw new Error("Invalid CGameCtnGhost version: " + version);
    }

    const playerInputs = p.list(() => {
      p.skip(8);

      if (version >= 4) {
        p.skip(4);
      }

      p.skip(4);

      const size = p.int32();
      p.skip(size);
    });

    return { version, playerInputs };
  } else if (chunkId === 0x03092025) {
    const version = p.int32();
    node.Is025Ver1 = version >= 1;

    const chunk = parseChunk(p, 0x03092019, node);

    if (!(chunk.eventsDuration === 0 && !node.Is025Ver1)) {
      p.skip(4);
    }

    return chunk;
  }
}