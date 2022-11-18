import { Sample } from "../nodes";
import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0911f000) {
    const version = p.uint32();
    const data = p.compressedData("zlib");

    const g = new GameBoxParser(data);

    g.skip(4);
    const ghostLength = g.int32();

    const objects = g.list(() => {
      const nodeId = g.uint32();
      g.skip(12);
      const mwbuffer = g.int32();
      g.skip(4);
      return {nodeId, mwbuffer};
    });

    if (version >= 2) {
      const objects2 = g.list(() => {
        g.skip(8);

        let clas;
        if (version >= 4) {
          clas = g.uint32();
        }

        return {clas};
      });
    }

    const samples: Sample[] = [];

    let u04 = g.byte();
    while (u04 != 0) {
      const bufferType = g.int32();
      g.skip(8);
      const ghostLengthFinish = g.int32();

      if (version >= 6) g.skip(4);

      for (let x; (x = g.byte()) != 0;) {
        const timestamp = g.int32();

        const bufferSize = g.int32();
        if (bufferSize === 0) continue;

        const sample: Sample = {timestamp};

        const buffer = g.bytes(bufferSize);
        const r = new GameBoxParser(buffer);

        if (bufferType === 2) {
          r.skip(5);

          sample.transform = r.transform();
        } else if (bufferType === 4 || bufferType === 6) {
          r.skip(5);

          sample.rpm = r.byte();

          r.skip(8);

          const steerByte = r.byte();
          sample.steer = ((steerByte / 255) - 0.5) * 2;

          const u15 = r.byte();
          r.skip(2);
          const brakeByte = r.byte();
          sample.brake = brakeByte / 255;
          sample.gas = u15 / 255 + sample.brake;

          r.skip(28);
          sample.transform = r.transform();

          r.goto(91);
          const gearByte = r.byte();
          sample.gear = gearByte / 5;
        }

        samples.push(sample);
      }

      u04 = g.byte();

      if (version >= 2) {
        while (g.byte() != 0) {
          g.skip(8);
          g.skip(g.int32());
        }
      }
    }

    if (version >= 3) {
      while (g.byte() != 0) {
        g.skip(8);
        g.skip(g.int32());
      }

      if (version === 7) {
        while (g.byte() != 0) {
          g.skip(4);
          g.skip(g.int32());
        }
      }

      if (version >= 8) {
        const u23 = g.int32();

        if (u23 === 0) {
          return {samples};
        }

        if (version === 8) {
          while (g.byte() != 0) {
            const u = g.int32();
            g.skip(g.int32());
          }
        } else {
          while (g.byte() != 0) {
            g.skip(4);
            g.skip(g.int32());
            g.skip(g.int32());
          }

          if (version >= 10) {
            g.skip(4);
          }
        }
      }
    }

    return { version, samples };
  }
}