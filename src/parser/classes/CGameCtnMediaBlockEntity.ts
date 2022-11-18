import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0329f000) {
    const version = p.uint32();
    const recordData = p.nodeRef();

    if (version > 3) {
      p.skipUntilFacade();
      return true;
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
}