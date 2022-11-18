import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0305b001) {
    for (let i = 0; i < 4; i++) p.string();
    return true;
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
}