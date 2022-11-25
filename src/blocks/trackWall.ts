import { DifficultyColor } from "../parser/classes/CGameCtnChallenge";
import { Block } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { BlockMesh } from "./block";
import { Colors } from "./colors";
import {
  concave,
  convex,
  curve,
  CurveDescription,
  flat,
  loop,
  pipe,
  raised,
  slope,
  straight,
  tilt,
  up,
} from "./curve";
import { platforms } from "./platform";
import { roads } from "./road";
import {
  createSurface,
  getDifficultyColor,
  getMiddlePointCount,
  getMiddlePoints,
  getTrackSurface,
  Surface,
  trackHeight,
} from "./surface";

export const trackWalls: { [name: string]: () => CurveDescription } = {
  
};

export function getTrackWallSurface(block: Block): Surface {
  const surface = getTrackSurface(block.name, -1, 1, block.color, 'platform');
  for (const point of surface.points) {
    point.y += 1 - trackHeight;
  }

  const points = [new Vec3(-1, 1, 0), ...surface.points, new Vec3(1, 1, 0), ...getMiddlePoints(1, -1, 0)];

  const edgeColor = getDifficultyColor(block.color, Colors.wood);

  const colors = [
    edgeColor,

    ...surface.colors,

     ...new Array(getMiddlePointCount(1, -1) + 1).fill(edgeColor),

    edgeColor,
  ];

  return { ...surface, points, colors };
}

export function getTrackWallCurve(name: string): (block: Block) => CurveDescription {
  name = name.replace(/TrackWall/, "");

  if (name in roads) return roads[name];
  if (name in platforms) return platforms[name];
  if (name in trackWalls) return trackWalls[name];

  return (block) => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, 0, 0),
  });
}