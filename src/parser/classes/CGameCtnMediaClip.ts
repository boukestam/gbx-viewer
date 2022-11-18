import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03079002) {
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
    const version = p.int32();
    const listVersion = p.int32();

    const tracks = p.list(() => p.nodeRef());

    const clipName = p.string();

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
}