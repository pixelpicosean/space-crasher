import PIXI from 'engine/pixi';

import { TEXTURES } from 'game/data';

const FX_ANIMS = [
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5, 6, 7],
  [0, 1, 2, 3, 4, 5],
];
export default (idx, x, y) => {
  const spr = new PIXI.extras.AnimatedSprite(TEXTURES.FX[idx]);
  spr.addAnim('a', FX_ANIMS[idx], {
    speed: 14,
    loop: false,
  });
  spr.play('a').once('finish', spr.remove, spr);
  spr.anchor.set(0.5);
  spr.position.set(x, y);
  return spr;
};
