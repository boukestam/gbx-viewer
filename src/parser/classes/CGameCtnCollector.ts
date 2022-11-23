import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2e001009) {
    const pageName = p.string();
    const hasIconFid = p.bool();

    let iconFid;
    if (hasIconFid) {
      iconFid = p.nodeRef();
    }

    p.lookBackString();

    return { pageName, iconFid };
  } else if (chunkId === 0x2e00100b) {
    return {info: p.meta()};
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
  } else if (chunkId === 0x2e001012) {
    p.skip(16);
    return true;
  }
}