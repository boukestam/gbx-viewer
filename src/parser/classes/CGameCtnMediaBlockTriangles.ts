import GameBoxParser from "../parser";
import { Node } from "../types";
import { Vec3 } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03029001) {
    const times = p.list(() => p.float());

    const numTriangles = p.uint32();
    const numPoints = p.uint32();

    const groups: Vec3[][] = [];
    for (let i = 0; i < numTriangles; i++) {
      const vertexes: Vec3[] = [];

      for (let j = 0; j < numPoints; j++) {
        const pointPosition = p.vec3();
        vertexes.push(pointPosition);
      }

      groups.push(vertexes);
    }

    const colors = p.list(() => {
      const color = p.color();
      const opacity = p.float();
      return { color, opacity };
    });

    const triangles = p.list(() => {
      const vertex1 = p.uint32();
      const vertex2 = p.uint32();
      const vertex3 = p.uint32();
      return { vertex1, vertex2, vertex3 };
    });

    p.skip(28);

    return { times, groups, colors, triangles };
  }
}