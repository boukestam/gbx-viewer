import { Color } from "../parser/types";


export function linearToSrgb(x: number): number {
  if (x <= 0)
    return 0;
  else if (x >= 1)
    return 1;
  else if (x < 0.0031308)
    return x * 12.92;
  else
    return Math.pow(x, 1 / 2.4) * 1.055 - 0.055;
}

export function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r: 0, g: 0, b: 0};
}

export function hexToSrgb(hex: string): Color {
  const {r, g, b} = hexToRgb(hex);

  return new Color(
    Math.max((r / 255) - 0.2, 0),
    Math.max((g / 255) - 0.2, 0),
    Math.max((b / 255) - 0.2, 0)
  );
}