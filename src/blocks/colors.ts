import { Color } from "../parser/types";
import { hexToSrgb } from "../utils/color";

export const Colors = {
  edgeColor: hexToSrgb("#444444"),
  bottomColor: new Color(0, 0, 0),
  
  borderColor: hexToSrgb('#ffffff'),
  borderSideColor: hexToSrgb('#000000'),

  trackLine: hexToSrgb('#ffffff'),

  dirtColor: hexToSrgb('#BD6A51'),

  techColor: hexToSrgb('#B2ACAF'),

  grassColor: hexToSrgb('#668444'),
  waterColor: hexToSrgb('#8EE4F2', 0),
  iceColor: hexToSrgb('#ffffff'),
  platformColor: hexToSrgb('#B2ACAF'),
  trackWallColor: new Color(0, 0, 0),

  bumpColorTop: hexToSrgb('#C5BBB4'),
  bumpColorMiddle: hexToSrgb('#5D585B'),
  bumpColorLeft: hexToSrgb('#3E3D3B'),
  bumpBorderColor: hexToSrgb('#B32022'),
  
  difficulty: {
    default: hexToSrgb('#ffffff'),
    white: hexToSrgb('#ffffff'),
    green: hexToSrgb('#55946D'),
    blue: hexToSrgb('#3C6EA3'),
    red: hexToSrgb('#B22D27'),
    black: hexToSrgb('#2B2C30'),
  },
  plastic: {
    default: hexToSrgb('#F1DC52'),
    white: hexToSrgb('#E7DAD7'),
    green: hexToSrgb('#4AD487'),
    blue: hexToSrgb('#2FA0C9'),
    red: hexToSrgb('#DF4144'),
    black: hexToSrgb('#212227'),
  },
  wood: {
    default: hexToSrgb('#E8BE94'),
    white: hexToSrgb('#E7DAD7'),
    green: hexToSrgb('#4AD487'),
    blue: hexToSrgb('#4072A3'),
    red: hexToSrgb('#DF4144'),
    black: hexToSrgb('#40342D'),
  }
}