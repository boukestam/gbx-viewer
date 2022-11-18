import { Color } from "../parser/types";
import { hexToSrgb } from "../utils/color";

export const Colors = {
  edgeColor: hexToSrgb("#444444"),
  bottomColor: new Color(0, 0, 0),
  
  borderColor: hexToSrgb('#ffffff'),
  borderSideColor: hexToSrgb('#000000'),

  trackLine: hexToSrgb('#ffffff'),

  dirtColor: hexToSrgb('#D07B5D'),

  techColor: hexToSrgb('#B2ACAF'),
  techBorderColor: hexToSrgb('#437E5A'),

  grassColor: hexToSrgb('#6A8642'),
  waterColor: hexToSrgb('#8EE4F2'),
  iceColor: hexToSrgb('#ffffff'),

  bumpColorTop: hexToSrgb('#C5BBB4'),
  bumpColorMiddle: hexToSrgb('#5D585B'),
  bumpColorLeft: hexToSrgb('#3E3D3B'),
  bumpBorderColor: hexToSrgb('#B32022')
}