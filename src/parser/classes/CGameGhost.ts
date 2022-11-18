import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0303f005) {
    const data = p.compressedData("zlib");

    const g = new GameBoxParser(data);

    const classId = g.uint32();

    if (classId === 0xffffffff) {
      return true;
    }

    const bSkipList2 = g.bool();

    g.skip(4);
    const samplePeriod = g.uint32();
    g.skip(4);

    const size = g.uint32();
    const sampleData = g.bytes(size);

    let firstSampleOffset, sizePerSample, sampleSizes;

    const numSamples = g.uint32();
    if (numSamples > 0) {
      firstSampleOffset = g.uint32();

      if (numSamples > 1) {
        sizePerSample = g.int32();
        if (sizePerSample === -1) {
          sampleSizes = [];
          for (let i = 0; i < numSamples - 1; i++) {
            sampleSizes.push(g.uint32());
          }
        }
      }
    }

    let sampleTimes;

    if (!bSkipList2) {
      sampleTimes = g.list(() => g.int32());
    }

    return {
      samplePeriod,
      sampleData,
      firstSampleOffset,
      sizePerSample,
      sampleSizes,
      sampleTimes,
    };
  } else if (chunkId === 0x0303f006) {
    const isReplaying = p.bool();
    const chunk = parseChunk(p, 0x0303f005, node);
    return { isReplaying, ...chunk };
  }
}