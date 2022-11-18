import { Block, CGameCtnChallenge } from "./nodes";
import GameBoxParser from "./parser";

export function parseBlocks(p: GameBoxParser, chunkId: number): CGameCtnChallenge {
  const [trackUID, environment, mapAuthor] = p.meta();

  const trackName = p.string();

  const [timeOfDay, decorationEnvironment, decorationAuthor] = p.meta();

  const size = p.int3();

  const needUnlock = p.bool();

  let version = 0;
  if (chunkId !== 0x03043013) {
    version = p.uint32();
  }

  const blocks: Block[] = [];

  const numBlocks = p.uint32();
  for (let i = 0; i < numBlocks; i++) {
    const blockName = p.lookBackString();

    const rotation = p.byte(); // north, east, south, west
    const x = p.byte();
    const y = p.byte();
    const z = p.byte();

    let flags = 0;
    if (version === 0) {
      flags = p.parser.nextUInt16LE();
    }
    if (version > 0) {
      flags = p.uint32();
    }

    if (flags === 0xffffffff) {
      i--;
      continue;
    }

    let author;
    let skin;
    if ((flags & 0x8000) !== 0) {
      // custom block
      author = p.lookBackString();
      skin = p.nodeRef();
    }

    let blockParameters;
    if (flags & 0x100000) {
      blockParameters = p.nodeRef();
    }

    const block = {
      blockName,
      rotation,
      x,
      y,
      z,
      author,
      skin,
      blockParameters,
    };

    blocks.push(block);
  }

  const result = {
    trackUID,
    environment,
    mapAuthor,
    trackName,
    timeOfDay,
    decorationAuthor,
    decorationEnvironment,
    size,
    needUnlock,
    blocks,
  };

  return result;
}
