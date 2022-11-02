import BufferReader from "buffer-reader";
import { parseBlocks } from "./blocks";
import { Sample } from "./nodes";
import MapParser from "./parser";
import { Transform, Vec3 } from './types';

export function parseChunk(p: MapParser, chunkId: number, extraData?: any): any {
  // CGameCtnMediaBlockTriangles
  if (chunkId === 0x03029001) {
    const times = p.list(() => p.float());

    const numTriangles = p.uint32();
    const numPoints = p.uint32();

    const groups: Vec3[][] = [];
    for (let i = 0; i < numTriangles; i++) {
      const vertexes: Vec3[] = [];

      for (let j = 0; j < numPoints; j++) {
        const pointPosition = p.vec3();
        vertexes.push(pointPosition);
      }

      groups.push(vertexes);
    }

    const colors = p.list(() => {
      const color = p.color();
      const opacity = p.float();
      return { color, opacity };
    });

    const triangles = p.list(() => {
      const vertex1 = p.uint32();
      const vertex2 = p.uint32();
      const vertex3 = p.uint32();
      return { vertex1, vertex2, vertex3 };
    });

    p.skip(28);

    return { times, groups, colors, triangles };
  }

  // CGameGhost
  else if (chunkId === 0x0303f005) {
    const data = p.compressedData("zlib");

    const g = new MapParser(data);

    const classId = g.uint32();

    if (classId === 0xffffffff) {
      return { classId };
    }

    const bSkipList2 = g.bool();

    g.skip(4);
    const samplePeriod = g.uint32();
    g.skip(4);

    const size = g.uint32();
    const sampleData = g.bytes(size);

    let firstSampleOffset, sizePerSample, sampleSizes;

    const numSamples = g.uint32();
    if (numSamples > 0) {
      firstSampleOffset = g.uint32();

      if (numSamples > 1) {
        sizePerSample = g.int32();
        if (sizePerSample === -1) {
          sampleSizes = [];
          for (let i = 0; i < numSamples - 1; i++) {
            sampleSizes.push(g.uint32());
          }
        }
      }
    }

    let sampleTimes;

    if (!bSkipList2) {
      sampleTimes = g.list(() => g.int32());
    }

    return {
      classId,
      samplePeriod,
      sampleData,
      firstSampleOffset,
      sizePerSample,
      sampleSizes,
      sampleTimes,
    };
  } else if (chunkId === 0x0303f006) {
    const isReplaying = p.bool();
    const chunk = parseChunk(p, 0x0303f005);
    return { isReplaying, ...chunk };
  }

  // Miscelaneous
  else if (chunkId === 0x0304300d) {
    const [vehicle, collection, author] = p.meta();
    return { vehicle, collection, author };
  } else if (chunkId === 0x03043011) {
    const collectorList = p.nodeRef();
    const challengeParameters = p.nodeRef();
    const kind = p.uint32();

    return { collectorList, challengeParameters, kind };
  } else if (chunkId === 0x0301b000) {
    // CGameCtnCollectorList
    const collectorList = p.list(() => {
      const [blockName, collection, author] = p.meta();
      const numPieces = p.uint32();

      return { blockName, collection, author, numPieces };
    });

    return { collectorList };
  } else if (chunkId === 0x0304301f || chunkId === 0x03043013) {
    const blocks = parseBlocks(p, chunkId);
    return blocks;
  } else if (chunkId === 0x03043022) {
    p.skip(4);
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
  } else if (chunkId === 0x03043028) {
    const chunk = parseChunk(p, 0x03043027);
    const comments = p.string();
    return { chunk, comments };
  } else if (chunkId === 0x0304302a) {
    p.skip(4);
  } else if (chunkId === 0x03043049) {
    // mediatracker
    const version = p.uint32();

    const clipInto = p.nodeRef();
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
      clipInto,
      clipPodium,
      clipGroupInGame,
      clipGroupEndRace,
      clipAmbiance,
      triggerSize,
    };
  }

  // CGameCtnBlockSkin
  else if (chunkId === 0x03059000) {
    const text = p.string();
    p.string();
    return { text };
  } else if (chunkId === 0x03059001) {
    const text = p.string();
    const packDesc = p.fileRef();
    return { text, packDesc };
  } else if (chunkId === 0x03059002) {
    const text = p.string();
    const packDesc = p.fileRef();
    const parentPackDesc = p.fileRef();
    return { text, packDesc, parentPackDesc };
  } else if (chunkId === 0x03059003) {
    const version = p.uint32();
    const secondaryPackDesc = p.fileRef();
    return { version, secondaryPackDesc };
  }

  // CGameCtnChallengeParameters
  else if (chunkId === 0x0305b001) {
    for (let i = 0; i < 4; i++) p.string();
  } else if (chunkId === 0x0305b004) {
    const bronzeTime = p.uint32();
    const silverTime = p.uint32();
    const goldTime = p.uint32();
    const authorTime = p.uint32();

    p.skip(4);

    return { bronzeTime, silverTime, goldTime, authorTime };
  } else if (chunkId === 0x0305b008) {
    const timeLimit = p.uint32();
    const authorScore = p.uint32();
    return { timeLimit, authorScore };
  } else if (chunkId === 0x0305b00d) {
    const raceValidateGhost = p.nodeRef();
    return { raceValidateGhost };
  }

  // CGameCtnMediaClip
  else if (chunkId === 0x03079002) {
    p.skip(4);

    const tracks = p.list(() => {
      return p.nodeRef();
    });

    const clipName = p.string();

    p.skip(4);

    return { tracks, clipName };
  } else if (chunkId === 0x03079003) {
    p.skip(4);

    const tracks = p.list(() => {
      return p.nodeRef();
    });

    const clipName = p.string();

    return { tracks, clipName };
  } else if (chunkId === 0x03079004) {
    p.skip(4);
  } else if (chunkId === 0x03079005) {
    p.skip(4);

    const tracks = p.list(() => {
      return p.nodeRef();
    });

    const clipName = p.string();

    return { tracks, clipName };
  } else if (chunkId === 0x03079007) {
    const localPlayerClipEntIndex = p.uint32();
    return { localPlayerClipEntIndex };
  } else if (chunkId === 0x0307900a) {
    const stopWhenLeave = p.bool();
    return { stopWhenLeave };
  } else if (chunkId === 0x0307900d) {
    const version = p.uint32();
    const listVersion = p.uint32();

    const tracks = p.list(() => {
      return p.nodeRef();
    });

    const clipName = p.string();

    if (p.uint32() !== 10) {
      p.parser.seek(p.parser.tell() - 4);
    }

    const stopWhenLeave = p.bool();
    p.skip(4);
    const stopWhenRespawn = p.bool();

    p.string();

    p.skip(4);

    const localPlayerClipEntIndex = p.uint32();

    return {
      version,
      listVersion,
      tracks,
      clipName,
      stopWhenLeave,
      stopWhenRespawn,
      localPlayerClipEntIndex,
    };
  }

  // CGameCtnMediaTrack
  else if (chunkId === 0x03078001) {
    const trackName = p.string();

    p.skip(4);

    const tracks = p.list(() => {
      return p.nodeRef();
    });

    p.skip(4);

    return { trackName, tracks };
  } else if (chunkId === 0x03078004) {
    const keepPlaying = p.bool();
    p.skip(4);
    return { keepPlaying };
  } else if (chunkId === 0x03078005) {
    const version = p.uint32();
    const isKeepPlaying = p.bool();
    const isReadOnly = p.bool();
    const isCycling = p.bool();

    if (version >= 1) {
      p.skip(8);
    }

    return { version, isKeepPlaying, isReadOnly, isCycling };
  }

  // CGameCtnMediaClipGroup
  else if (chunkId === 0x0307a003) {
    p.skip(4);

    const clips = p.list(() => {
      const clip = p.nodeRef();
      return clip;
    });

    const referenceClips = p.list(() => {
      const referenceFramePosition = p.vec3();
      const referenceFrameRotation = p.uint32();
      const triggerCondition = p.uint32(); // (0: None, 1: Time < arg, 2: Time > arg, 3: Already triggered, 4: Speed < arg, 5: Speed > arg, 6: Not already triggered)
      const triggerArgument = p.float();

      const numTriggers = p.uint32();
      const triggers: any[] = [];
      for (let j = 0; j < numTriggers; j++) {
        const position = p.vec3();
        triggers.push({ position });
      }

      return {
        referenceFramePosition,
        referenceFrameRotation,
        triggerCondition,
        triggerArgument,
        triggers,
      };
    });

    return { clips, referenceClips };
  }

  // CGameCtnMediaBlockCameraGame
  else if (chunkId === 0x03084007) {
    const version = p.uint32();
    const start = p.float();
    const end = p.float();

    let gameCam;
    if (version < 2) {
      gameCam = p.lookBackString();
    }

    if (version >= 2) {
      gameCam = p.uint32();
    }

    const clipEntId = p.uint32();

    const camPosition = p.vec3();
    const camPitchYawRoll = p.vec3();

    const camFov = p.float() || 90;

    p.skip(8);

    const camNearClipPlane = p.float();
    const camFarClipPlane = p.float();

    p.skip(12);

    if (version >= 1) {
      p.skip(4);

      if (version >= 3) {
        p.skip(4);
      }
    }

    return {
      version,
      start,
      end,
      gameCam,
      clipEntId,
      camPosition,
      camPitchYawRoll,
      camFov,
      camNearClipPlane,
      camFarClipPlane,
    };
  }

  // CGameCtnGhost
  else if (chunkId === 0x03092000) {
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
  } else if (chunkId === 0x0309200e) {
    const uid = p.lookBackString(true);
    return { uid };
  } else if (chunkId === 0x0309200f) {
    const ghostLogin = p.string();
    return { ghostLogin };
  } else if (chunkId === 0x03092010) {
    p.lookBackString();
  } else if (chunkId === 0x03092011) {
    const eventsDuration = p.int32();
    if (eventsDuration === 0 && !extraData?.Is025Ver1) return { eventsDuration };

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
  } else if (chunkId === 0x03092014) {
    p.skip(4);
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
  } else if (chunkId === 0x03092019) {
    const chunk = parseChunk(p, 0x03092011, extraData);

    if (!(chunk.eventsDuration === 0 && !extraData?.Is025Ver1)) p.skip(4);

    return chunk;
  } else if (chunkId === 0x0309201c) {
    p.skip(32);
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
    const Is025Ver1 = version >= 1;

    const chunk = parseChunk(p, 0x03092019, {Is025Ver1});

    if (!(chunk.eventsDuration === 0 && !Is025Ver1)) {
      p.skip(4);
    }

    return chunk;
  }

  // CGameCtnReplayRecord
  else if (chunkId === 0x03093002) {
    const challengeData = p.bytes(p.int32());
    return {challengeData};
  } else if (chunkId === 0x03093014) {
    const version = p.int32();
    const ghosts = p.list(() => p.nodeRef());
    p.skip(4);
    p.list(() => p.skip(8));
    return {version, ghosts};
  } else if (chunkId === 0x03093015) {
    const clip = p.nodeRef();
    return {clip};
  } else if (chunkId === 0x03093018) {
    const titleId = p.lookBackString();
    const authorVersion = p.int32();
    const authorLogin = p.string();
    const authorNickname = p.string();
    const authorZone = p.string();
    const authorExtraInfo = p.string();
    return {titleId, authorVersion, authorLogin, authorNickname, authorZone, authorExtraInfo};
  } else if (chunkId === 0x03093024) {
    const version = p.int32();
    p.skip(4);
    const recordData = p.nodeRef();
    return {version, recordData};
  }

  // CGameCtnMediaBlockCameraCustom
  else if (chunkId === 0x030a2006) {
    const version = 6 + p.uint32();

    const keys = p.list(() => {
      const time = p.float();
      const interpolation = p.uint32();

      let position, pitchYawRoll, fov;
      let targetPosition;
      let leftTangent, rightTangent;

      if (version < 6) {
        p.skip(8);
        position = p.vec3();
        pitchYawRoll = p.vec3();
        fov = p.float();
      }

      const anchorRot = p.bool();
      const anchor = p.uint32();
      const anchorVis = p.bool();
      const target = p.uint32();

      if (version < 6) {
        targetPosition = p.vec3();

        if (version === 1) {
          p.skip(8);
          return;
        }

        leftTangent = parseMediaBlockCameraInterpVal(p, version);
        rightTangent = parseMediaBlockCameraInterpVal(p, version);

        if (version === 3) {
          p.skip(20);
        }
      }

      let nearZ;

      if (version >= 6) {
        position = p.vec3();
        pitchYawRoll = p.vec3();
        fov = p.float();
        targetPosition = p.vec3();

        if (version >= 7) {
          nearZ = p.float();
        }

        leftTangent = parseMediaBlockCameraInterpVal(p, version);
        rightTangent = parseMediaBlockCameraInterpVal(p, version);

        if (version === 8) {
          p.skip(8);
        }

        if (version >= 10) {
          throw new Error("Unsupported CGameCtnMediaBlockCameraCustom version");
        }
      }

      return {
        time,
        interpolation,
        anchorRot,
        anchor,
        anchorVis,
        target,
        nearZ,
        position,
        pitchYawRoll,
        fov,
        targetPosition,
        leftTangent,
        rightTangent,
      };
    });

    return { version, keys };
  }

  // CGameCtnMediaBlockImage
  else if (chunkId === 0x030a5000) {
    const effect = p.nodeRef();
    const image = p.fileRef();
    return { effect, image };
  }

  // CGameCtnMediaBlockText
  else if (chunkId === 0x030a8001) {
    const text = p.string();
    const effect = p.nodeRef();
    return { text, effect };
  } else if (chunkId === 0x030a8002) {
    const textColor = p.color();
    return { textColor };
  }

  // CGameCtnMediaBlockTransitionFade
  else if (chunkId === 0x030ab000) {
    const numKeys = p.uint32();
    const keys: any[] = [];
    for (let i = 0; i < numKeys; i++) {
      const time = p.float();
      const opacity = p.float();
      keys.push({ time, opacity });
    }

    const transitionColor = p.color();

    p.skip(4);

    return { keys, transitionColor };
  }

  // CGameCtnMacroBlockInfo
  else if (chunkId === 0x0310d000) {
    const blockSpawns = p.list(() => {
      const version = p.uint32();
      const blockModel = p.meta();

      let coord, direction, absolutePositionInMap, pitchYawRoll, waypoint;

      if (version < 2) {
        coord = p.int3();
        direction = p.uint32();

        throw new Error(
          "CGameCtnMacroBlockInfo version not supported " + version
        );
      }

      if (version >= 2) {
        if (version < 5) {
          coord = p.byte3();
          direction = p.byte();
        }

        const flags = p.uint32();

        if (version >= 3) {
          if (version >= 5) {
            if (((flags >> 26) & 1) !== 0) {
              absolutePositionInMap = p.vec3();
              pitchYawRoll = p.vec3();
            } else {
              coord = p.byte3();
              direction = p.byte();
            }
          }

          waypoint = p.nodeRef();

          if (version >= 4) {
            if (version >= 6 && version < 8) {
              throw new Error(
                "CGameCtnMacroBlockInfo version not supported " + version
              );
            }

            if (version < 6) {
              const unsupported = p.nodeRef();

              if (unsupported) {
                throw new Error("Not implemented");
              }
            }

            if (version >= 8) {
              p.skip(2);
            }
          }
        }
      }

      return {
        version,
        blockModel,
        coord,
        direction,
        absolutePositionInMap,
        pitchYawRoll,
        waypoint,
      };
    });

    return { blockSpawns };
  } else if (chunkId === 0x0310d001) {
    const blockSkinSpawns = p.list(() => {
      const version = p.uint32();
      const skin = p.nodeRef();

      if (version === 0) {
        p.int3();
      }

      const blockSpawnIndex = p.uint32();

      return { version, skin, blockSpawnIndex };
    });

    return { blockSkinSpawns };
  } else if (chunkId === 0x0310d002) {
    const cardEventsSpawns = p.list(() => {
      const version = p.uint32();
      p.list(() => p.meta());
      p.int3();

      return { version };
    });

    return { cardEventsSpawns };
  } else if (chunkId === 0x0310d006) {
    p.uint32();
    const size = p.uint32();
    p.skip(size);
  } else if (chunkId === 0x0310d007) {
    p.list(() => p.nodeRef());
  } else if (chunkId === 0x0310d008) {
    const listVersion = p.uint32();
    const autoTerrains = p.list(() => p.nodeRef());
    p.uint32();
    p.bool();
    return { listVersion, autoTerrains };
  } else if (chunkId === 0x0310d00e) {
    const version = p.uint32();
    const objectSpawns = p.list(() => {
      const ver = p.uint32();
      const itemModel = p.meta();

      let quarterY, additionalDir, pitchYawRoll;
      let pivotPosition, waypointSpecialProperty;
      let scale;

      if (ver < 3) {
        quarterY = p.byte();

        if (ver >= 1) {
          additionalDir = p.byte();
        }
      } else {
        pitchYawRoll = p.vec3();
      }

      const blockCoord = p.int3();
      const anchorTreeId = p.lookBackString();
      const absolutePositionInMap = p.vec3();

      if (ver < 5) {
        p.uint32();
      }

      if (ver < 6) {
        p.uint32();
      }

      let packDesc, foregroundPackDesc;

      if (ver >= 6) {
        p.uint16();

        if (ver >= 7) {
          pivotPosition = p.vec3();

          if (ver >= 8) {
            waypointSpecialProperty = p.nodeRef();

            if (ver >= 9) {
              scale = p.float();

              if (ver >= 10) {
                p.int3();

                if (ver >= 11 && ver < 14) {
                  throw new Error("Version not supported: " + ver);
                }

                if (ver >= 14) {
                  p.uint32();
                  const ignored = p.byte();

                  if (ignored === 1) {
                    packDesc = p.fileRef();
                    foregroundPackDesc = p.fileRef();
                  }

                  const ignored2 = p.uint32();

                  if (ignored2 !== -1) {
                    throw new Error("U08 !== -1");
                  }
                }
              }
            }
          }
        }
      }

      return {
        ver,
        itemModel,
        quarterY,
        additionalDir,
        pitchYawRoll,
        blockCoord,
        anchorTreeId,
        absolutePositionInMap,
        pivotPosition,
        waypointSpecialProperty,
        scale,
        packDesc,
        foregroundPackDesc,
      };
    });

    if (version < 3) {
      if (version >= 1) {
        p.list(() => p.int2());
      }
    }

    if (version >= 3) {
      p.list(() => p.int4());
    }

    return { version, objectSpawns };
  } else if (chunkId === 0x0310d00f) {
    const version = p.uint32();
    p.int3();

    p.int3();
    p.list(() => p.int3());

    return { version };
  }

  // CGameCtnAutoTerrain
  else if (chunkId === 0x03120001) {
    const offset = p.int3();
    const genealogy = p.nodeRef();
    return { offset, genealogy };
  }

  // CGameWaypointSpecialProperty
  else if (chunkId === 0x0313b000 || chunkId === 0x2e009000) {
    const version = p.uint32();

    if (version === 1) {
      const spawn = p.uint32();
      const order = p.uint32();

      return { version, spawn, order };
    } else if (version === 2) {
      const tag = p.string();
      const order = p.uint32();

      return { tag, order };
    } else {
      throw new Error(
        "Invalid CGameWaypointSpecialProperty version: " + version
      );
    }
  }

  // CGameCtnZoneGenealogy
  else if (chunkId === 0x0311d002) {
    const zoneIds = p.list(() => p.lookBackString());
    const currentIndex = p.uint32();
    const dir = p.uint32();
    const currentZoneId = p.lookBackString();
    return { zoneIds, currentIndex, dir, currentZoneId };
  }

  // MediaTracker block - Entity
  else if (chunkId === 0x0329f000) {
    const version = p.uint32();
    const recordData = p.nodeRef();

    if (version > 3) {
      p.skipUntilFacade();
      return;
    }

    p.skip(12);
    p.list(() => p.uint32());

    if (version >= 2) {
      p.skip(28);

      if (version >= 3) {
        p.meta();
        p.skip(16);
        const ignored = p.bool();

        if (ignored === true) {
          const ignored2 = p.uint32();

          p.skip(12);

          if (ignored2 === 0) {
            p.skip(4);
            p.string();
          }

          p.list(() => {
            p.string();
            p.string();
          });

          p.list(() => p.string());
        }
      }
    }

    return { version, recordData };
  }

  // CControlEffectSimi
  else if (chunkId === 0x07010003) {
    const frames = p.list(() => {
      const timestamp = p.float();
      const position = p.vec2();
      const rotation = p.float();
      const scaleX = p.float();
      const scaleY = p.float();
      const opacity = p.float();
      const depth = p.float();
      return {
        timestamp,
        position,
        rotation,
        scaleX,
        scaleY,
        opacity,
        depth,
      };
    });

    const centered = p.bool();

    return { frames, centered };
  } else if (chunkId === 0x07010004) {
    const frames = p.list(() => {
      const timestamp = p.float();
      const position = p.vec2();
      const rotation = p.float();
      const scaleX = p.float();
      const scaleY = p.float();
      const opacity = p.float();
      const depth = p.float();

      p.skip(4);
      const isContinousEffect = p.float();
      p.skip(8);

      return {
        timestamp,
        position,
        rotation,
        scaleX,
        scaleY,
        opacity,
        depth,
        isContinousEffect,
      };
    });

    const centered = p.bool();
    const colorBlendMode = p.uint32();
    const isContinousEffect = p.bool();

    return { frames, centered, colorBlendMode, isContinousEffect };
  } else if (chunkId === 0x07010005) {
    const chunk = parseChunk(p, 0x07010004);
    const isInterpolated = p.bool();
    return { ...chunk, isInterpolated };
  }

  // CPlugEntRecordData
  else if (chunkId === 0x0911f000) {
    const version = p.uint32();
    const data = p.compressedData("zlib");

    const g = new MapParser(data);

    g.skip(4);
    const ghostLength = g.int32();

    const objects = g.list(() => {
      const nodeId = g.uint32();
      g.skip(12);
      const mwbuffer = g.int32();
      g.skip(4);
      return {nodeId, mwbuffer};
    });

    if (version >= 2) {
      const objects2 = g.list(() => {
        g.skip(8);

        let clas;
        if (version >= 4) {
          clas = g.uint32();
        }

        return {clas};
      });
    }

    const samples: Sample[] = [];

    let u04 = g.byte();
    while (u04 != 0) {
      const bufferType = g.int32();
      g.skip(8);
      const ghostLengthFinish = g.int32();

      if (version >= 6) g.skip(4);

      for (let x; (x = g.byte()) != 0;) {
        const timestamp = g.int32();

        const bufferSize = g.int32();
        if (bufferSize === 0) continue;

        const sample: Sample = {timestamp};

        const buffer = g.bytes(bufferSize);
        const r = new MapParser(buffer);

        if (bufferType === 2) {
          r.skip(5);

          sample.transform = r.transform();
        } else if (bufferType === 4 || bufferType === 6) {
          r.skip(5);

          sample.rpm = r.byte();

          r.skip(8);

          const steerByte = r.byte();
          sample.steer = ((steerByte / 255) - 0.5) * 2;

          const u15 = r.byte();
          r.skip(2);
          const brakeByte = r.byte();
          sample.brake = brakeByte / 255;
          sample.gas = u15 / 255 + sample.brake;

          r.skip(28);
          sample.transform = r.transform();

          r.goto(91);
          const gearByte = r.byte();
          sample.gear = gearByte / 5;
        }

        samples.push(sample);
      }

      u04 = g.byte();

      if (version >= 2) {
        while (g.byte() != 0) {
          g.skip(8);
          g.skip(g.int32());
        }
      }
    }

    if (version >= 3) {
      while (g.byte() != 0) {
        g.skip(8);
        g.skip(g.int32());
      }

      if (version === 7) {
        while (g.byte() != 0) {
          g.skip(4);
          g.skip(g.int32());
        }
      }

      if (version >= 8) {
        const u23 = g.int32();

        if (u23 === 0) {
          return {version, samples};
        }

        if (version === 8) {
          while (g.byte() != 0) {
            const u = g.int32();
            g.skip(g.int32());
          }
        } else {
          while (g.byte() != 0) {
            g.skip(4);
            g.skip(g.int32());
            g.skip(g.int32());
          }

          if (version >= 10) {
            g.skip(4);
          }
        }
      }
    }

    return { version, samples };
  }

  // CGameCtnCollector
  else if (chunkId === 0x2e001009) {
    const pageName = p.string();
    const hasIconFid = p.bool();

    let iconFid;
    if (hasIconFid) {
      iconFid = p.nodeRef();
    }

    p.lookBackString();

    return { pageName, iconFid };
  } else if (chunkId === 0x2e00100b) {
    return p.meta();
  } else if (chunkId === 0x2e00100c) {
    const collectorName = p.string();
    return { collectorName };
  } else if (chunkId === 0x2e00100d) {
    const description = p.string();
    return { description };
  } else if (chunkId === 0x2e00100e) {
    const iconUseAutoRender = p.bool();
    const iconQuarterRotationY = p.uint32();
    return { iconUseAutoRender, iconQuarterRotationY };
  } else if (chunkId === 0x2e001010) {
    const version = p.uint32();
    p.nodeRef();
    const skinDirectory = p.string();

    if (version >= 2 && skinDirectory.length === 0) {
      p.skip(4);
    }

    return { version, skinDirectory };
  } else if (chunkId === 0x2e001011) {
    const version = p.uint32();
    const isInternal = p.bool();
    const isAdvanced = p.bool();
    const catalogPosition = p.uint32();

    let prodState;
    if (version >= 1) {
      prodState = p.byte();
    }

    return { version, isInternal, isAdvanced, catalogPosition, prodState };
  }

  // Unknown chunk
  else {
    throw new Error("Unknown chunk " + chunkId.toString(16));
  }
}

function parseMediaBlockCameraInterpVal(p: MapParser, version: number) {
  const position = p.vec3();

  if (version < 6) {
    return { position };
  }

  const pitchYawRoll = p.vec3();
  const fov = p.float();
  const targetPosition = p.vec3();

  let nearZ;
  if (version >= 7) {
    nearZ = p.float();
  }

  return { position, pitchYawRoll, fov, targetPosition, nearZ };
}
