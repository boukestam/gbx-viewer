import GameBoxParser from "../parser";
import { Node } from "../types";

function key(p: GameBoxParser, version: number) {
  const result: any = {};

  result.time = p.float();
  result.volume = p.float();
  result.pan = p.float();

  if (version >= 1) {
    result.position = p.vec3();
  }

  return result;
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030A7001) {
    const sound = p.fileRef();
    const keys = p.list(() => key(p, 0));
    return {sound, keys};
  } else if (chunkId === 0x030A7002) {
    const playCount = p.int32();
    const isLooping = p.bool();
    return {playCount, isLooping};
  } else if (chunkId === 0x030A7003) {
    const version = p.int32();

    const result: any = {};

    result.playCount = p.int32();
    result.isLooping = p.bool();
    result.isMusic = p.bool();

    if (version >= 1) {
      result.stopWithClip = p.bool();

      if (version >= 2) {
        result.audioToSpeech = p.bool();
        result.audioToSpeechTarget = p.int32();
      }
    }

    return result;
  } else if (chunkId === 0x030A7004) {
    const sound = p.fileRef();
    const version = p.int32();
    const keys = p.list(() => key(p, version));
    return {sound, keys};
  }
}