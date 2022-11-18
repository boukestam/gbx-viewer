import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03078001) {
    const trackName = p.string();
    const version = p.int32();

    const blocks = p.list(() => p.nodeRef());

    p.skip(4);

    return { version, trackName, blocks };
  } else if (chunkId === 0x03078002) {
    const keepPlaying = p.bool();
    return { keepPlaying };
  } else if (chunkId === 0x030780043) {
    const isReadOnly = p.bool();
    return { isReadOnly };
  } else if (chunkId === 0x03078004) {
    const keepPlaying = p.bool();
    const isReadOnly = p.bool();
    return { keepPlaying, isReadOnly };
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
}