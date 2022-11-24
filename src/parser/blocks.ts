import { Block, CGameCtnChallenge } from "./nodes";
import GameBoxParser from "./parser";
import { Vec3 } from "./types";

function parseBlock(p: GameBoxParser, version: number, blocks: Block[]) {
  const blockName = p.lookBackString();

    const rotation = p.byte(); // north, east, south, west
    let coord = p.byte3();

    const flags = version === 0 ? p.uint16() : p.uint32();

    if (flags === 0xffffffff) {
      blocks.push({name: blockName, rotation, coord, flags})
      return false;
    }

    if (version >= 6) {
      coord = coord.sub(new Vec3(1, 0, 1));
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

    if (flags & 0x20000000) {
      coord = coord.sub(new Vec3(0, 1, 0));
    }

    blocks.push({
      name: blockName,
      rotation,
      coord,
      flags,
      author,
      skin,
      blockParameters,
    })

    return true;
}

export function parseBlocks(p: GameBoxParser, chunkId: number) {
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
    const isNormalBlock = parseBlock(p, version, blocks);
    if (isNormalBlock) continue;
    i--;
  }

  while ((p.peekUint32() & 0xC0000000) > 0) {
    parseBlock(p, version, blocks);
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
