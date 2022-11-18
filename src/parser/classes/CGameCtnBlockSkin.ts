import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03059000) {
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
}