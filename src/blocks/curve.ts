import { Bezier } from "bezier-js";
import { Vec3 } from "../parser/types";

const RAISED: {[name: string]: number} = {
  RoadTechTiltCurve2DownLeft: 1,
  RoadTechTiltCurve2DownRight: -1,
  RoadTechTiltCurve2UpLeft: 2,
  RoadTechTiltCurve2UpRight: -2
};

export function getTrackCurve(name: string) {
  const curves = [];

  const size = new Vec3(1, 1, 1);
  const offset = new Vec3(0, -1, 0);

  if (name.includes("Curve")) {
    const amountIndex = name.indexOf("Curve") + 5;
    const amount = parseInt(name[amountIndex]);

    const bezier = new Bezier(
      -1, -1, 
      -1, 0,
      0, 1, 
      1, 1
    );

    size.x = amount;
    size.z = amount;

    curves.push({
      bezier, 
      axis: new Vec3(1, 0, 2),
      right: true
    });
  }

  if (name.includes("Chicane")) {
    const amountIndex = name.indexOf("X") + 1;
    const amount = parseInt(name[amountIndex]);

    const mul = name.includes("Left") ? -1 : 1;

    const bezier = new Bezier(
      -0.5, 1 * mul, 
      -0.5, -0.2 * mul,
      0.5, 0.2 * mul,
      0.5, -1 * mul,
    );

    size.x = 2;
    size.z = amount;

    if (amount === 3) {
      offset.x = 1;
      offset.z = -1;
    }

    curves.push({
      bezier, 
      axis: new Vec3(1, 0, 2)
    });
  }

  if (name.includes("Slope")) {
    const amount0Index = name.indexOf("Base") + 4;
    const amount1Index = name.indexOf("x") + 1;

    let heightAmount, lengthAmount;

    if (amount1Index === 0) {
      lengthAmount = 1;
      heightAmount = parseInt(name[amount0Index]) || 1;
    } else {
      lengthAmount = parseInt(name[amount0Index]);
      heightAmount = parseInt(name[amount1Index]);
    }

    const bezier = new Bezier(
      -1, 1, 
      -0.2, 1,
      0.2, 0,
      1, 0,
    );

    size.z = lengthAmount;
    size.y = heightAmount;

    offset.y = -heightAmount;

    if (lengthAmount === 2) {
      offset.x = 1;
      offset.z = -1;
    }

    curves.push({
      bezier, 
      axis: new Vec3(0, 4, 3)
    });
  }

  if (name.includes("Tilt")) {
    const height = 0.5;

    let f;

    if (name.includes("DownLeft")) {
      f = (ratio: number, t: number) => (height + ratio * -height) * (1 - t);
    } else if (name.includes("DownRight")) {
      f = (ratio: number, t: number) => (height + ratio * -height) * t;
    } else if (name.includes("UpLeft")) {
      f = (ratio: number, t: number) => 1 - (height + ratio * -height) * t;
    } else if (name.includes("UpRight")) {
      f = (ratio: number, t: number) => 1 - (height + ratio * -height) * (1 - t);
    } else {
      f = (ratio: number, t: number) => height + ratio * -height;
    }

    curves.push({
      f,
      axis: new Vec3(0, 1, 0)
    });
  }

  if (name in RAISED) {
    const height = RAISED[name];

    curves.push({
      f: (ratio: number, t: number) => (height > 0 ? 1 - t : t) * Math.abs(height), 
      axis: new Vec3(0, 1, 0)
    });
  }

  if (name.includes("Transition")) {
    const amountIndex = name.indexOf("Transition") + 10;
    const amount = parseInt(name[amountIndex]);

    const bezier = new Bezier(
      0, -1, 
      0, 0, 
      0, 1
    );

    size.z = amount;
    if (name.includes("Curve")) size.x = amount;

    curves.push({
      bezier, 
      axis: new Vec3(1, 0, 2)
    });
  }

  if (name.includes("Straight") || name.includes("Switch") || name.includes("Start") || name.includes("Finish")) {
    const bezier = new Bezier(
      0, -1, 
      0, 0, 
      0, 1
    );

    curves.push({
      bezier, 
      axis: new Vec3(1, 0, 2)
    });
  }

  let rotation = 0;

  if (name === 'RoadTechTiltTransition2UpLeftCurveIn') {
    rotation = Math.PI * 0.5;
  }

  return {curves, size, offset, rotation};
}