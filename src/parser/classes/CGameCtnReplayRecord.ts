import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03093002) {
    const challengeData = p.bytes(p.int32());
    return {challengeData};
  } else if (chunkId === 0x03093014) {
    const version = p.int32();
    const ghosts = p.list(() => p.nodeRef());
    p.skip(4);
    p.list(() => p.skip(8));
    return {ghosts};
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
    return {recordData};
  }
}