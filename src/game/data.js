import loader from 'engine/loader';
import filmstrip from 'engine/tilemap/filmstrip';

loader.addAsset('KenPixel.fnt');
loader.addAsset('sprites.json', 'sprites');

export const TEXTURES = {};
loader.on('complete', () => {

  const sprites = loader.resources['sprites'].textures;

  TEXTURES.SHIP = sprites['ship'];

  TEXTURES.SHOOTS = [
    [sprites['shots/0']],
    [sprites['shots/1']],
    filmstrip(sprites['shots/2'], 16, 7),
    [sprites['shots/3']],
  ];

});

import { getGroupMask } from 'engine/physics';

export const GROUPS = {
  SOLID:    getGroupMask(0),

  ME:       getGroupMask(1),
  ME_DMG:   getGroupMask(2),

  FOE:      getGroupMask(3),
  FOE_DMG:  getGroupMask(4),
};
