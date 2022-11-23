import { Bezier } from "bezier-js";
import { Vec3 } from "../parser/types";
import { bezierAtX } from "../utils/bezier";

export type StepFunction = (ratio: number, t: number) => number;

export interface CurveDescription {
  curves: {
    bezier?: Bezier;
    f?: StepFunction;
    ratio?: StepFunction;
    axis: Vec3;
    right?: boolean;
    xAsStep?: boolean;
  }[];
  size: Vec3;
  offset: Vec3;
  rotation?: Vec3;
  pivot?: Vec3;
}

export function curve() {
  const bezier = new Bezier(
    -1, -1, 
    -1, 0,
    0, 1, 
    1, 1
  );

  return {
    bezier, 
    axis: new Vec3(1, 0, 2),
    right: true
  };
}

export function chicane(left: boolean) {
  const bezier = left ? new Bezier(
    -0.5, -1, 
    -0.5, 0.2,
    0.5, -0.2,
    0.5, 1,
  ) : new Bezier(
    0.5, -1, 
    0.5, 0.2,
    -0.5, -0.2,
    -0.5, 1,
  );

  return {
    bezier, 
    axis: new Vec3(1, 0, 2)
  };
}

export function slope(reverse?: boolean, ratio?: StepFunction) {
  const bezier = !reverse ? 
    new Bezier(
      -1, 1, 
      -0.2, 1,
      0.2, 0,
      1, 0,
    ) : 
    new Bezier(
      -1, 0, 
      -0.2, 0,
      0.2, 1,
      1, 1,
    );

  return {
    bezier, 
    axis: new Vec3(0, 4, 3),
    ratio
  };
}

export function loop(reverse?: boolean, ratio?: StepFunction) {
  const bezier = !reverse ? 
    new Bezier(
      -1, 1, 
      -1, 0.5,
      0, 0,
      1, 0,
    ) : 
    new Bezier(
      -1, 1, 
      0, 1,
      1, 0.5,
      1, 0,
    );

  return {
    bezier, 
    axis: new Vec3(0, 4, 3),
    ratio
  };
}

export function pipe(flipHorizontal?: boolean, flipVertical?: boolean, ratio?: StepFunction) {
  const bezier = !flipHorizontal ? 
    (!flipVertical ? 
      new Bezier(
        -1, 1, 
        -1, 0.5,
        0, 0,
        1, 0,
      ) :
      new Bezier(
        -1, 1, 
        0, 1,
        1, 0.5,
        1, 0,
      )
    ) :
    (!flipVertical ? 
      new Bezier(
        1, 1,
        1, 0.5,
        0, 0,
        -1, 0, 
      ) : 
      new Bezier(
        1, 1,
        0, 1,
        -1, 0.5,
        -1, 0, 
      )
    );

  return {
    f: (x: number, t: number) => bezierAtX(bezier, x), 
    axis: new Vec3(0, 1, 0),
    ratio,
    xAsStep: true,
  };
}

export function concave(amount: number = 2, ratio?: StepFunction) {
  const bezier = new Bezier(
    -1, 0, 
    -0.2, amount * 0.2,
    0.2, amount * 0.2,
    1, 0,
  );

  return {
    bezier, 
    axis: new Vec3(0, 4, 0),
    ratio
  };
}

export function convex(amount: number = 2, ratio?: StepFunction) {
  const bezier = new Bezier(
    -1, 0, 
    -0.2, amount * -0.2,
    0.2, amount * -0.2,
    1, 0,
  );

  return {
    bezier, 
    axis: new Vec3(0, 4, 0),
    ratio
  };
}

export function tilt (reverse?: boolean, direction?: "TopLeftUp" | "BottomLeftUp" | "BottomLeftDown" | "TopLeftDown") {
  const height = 0.5;

  let f;

  if (direction === "TopLeftUp") {
    f = (ratio: number, t: number) => (height + (reverse ? ratio * -1 : ratio) * -height) * (1 - t);
  } else if (direction === "BottomLeftUp") {
    f = (ratio: number, t: number) => (height + (reverse ? ratio * -1 : ratio) * -height) * t;
  } else if (direction === "BottomLeftDown") {
    f = (ratio: number, t: number) => 1 - (height + (reverse ? ratio * -1 : ratio) * -height) * t;
  } else if (direction === "TopLeftDown") {
    f = (ratio: number, t: number) => 1 - (height + (reverse ? ratio * -1 : ratio) * -height) * (1 - t);
  } else {
    f = (ratio: number, t: number) => height + (reverse ? ratio * -1 : ratio) * -height;
  }

  return {
    f,
    axis: new Vec3(0, 1, 0)
  };
}

export function straight (ratio?: StepFunction) {
  const bezier = new Bezier(
    0, -1, 
    0, 0, 
    0, 1
  );

  return {
    bezier, 
    axis: new Vec3(1, 0, 2),
    ratio
  };
}

export function flat (ratio?: StepFunction) {
  const bezier = new Bezier(
    -1, 0,
    0, 0,
    1, 0,
  );

  return {
    bezier, 
    axis: new Vec3(0, 4, 3),
    ratio
  };
}

export function raised (height: number, ratio?: StepFunction) {
  const bezier = height < 0 ? 
    new Bezier(
      -1, 0, 
      0, height * -0.5,
      1, height * -1,
    ) : 
    new Bezier(
      -1, height, 
      0, height * 0.5,
      1, 0,
    );

  return {
    bezier, 
    axis: new Vec3(0, 4, 0),
    ratio
  };
}

export function up (height: number, ratio?: StepFunction) {
  return {
    f: (ratio: number, t: number) => height, 
    axis: new Vec3(0, 1, 0),
    ratio
  };
}