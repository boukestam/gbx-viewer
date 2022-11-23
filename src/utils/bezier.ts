import { Bezier } from "bezier-js";

export function bezierAtX(bezier: Bezier, x: number) {
  const intersections = bezier.intersects({p1: {x: x, y: -1}, p2: {x: x, y: 1}});
  const pt = bezier.get(intersections[0] as number);
  return pt.y;
}