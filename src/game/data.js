import loader from 'engine/loader';
import filmstrip from 'engine/tilemap/filmstrip';

loader.addAsset('KenPixel.fnt');
loader.addAsset('sprites.json', 'sprites');

export const TEXTURES = {};
loader.on('complete', () => {

  const sprites = loader.resources['sprites'].textures;

  TEXTURES.BG = sprites['backgrounds/1'];
  TEXTURES.METEORS = [
    sprites['backgrounds/meteor-1'],
    sprites['backgrounds/meteor-2'],
    sprites['backgrounds/meteor-3'],
    sprites['backgrounds/meteor-4'],
    sprites['backgrounds/meteor-5'],
  ];

  TEXTURES.SHIP = [
    sprites['ship1'],
    sprites['ship1-flash'],
  ];
  TEXTURES.SHOOTS = [
    [sprites['shots/0']],
    [sprites['shots/1']],
    filmstrip(sprites['shots/2'], 16, 5),
    filmstrip(sprites['shots/3'], 9, 8),
  ];

  TEXTURES.FX = [
    filmstrip(sprites['effects/2'], 23, 22),
    filmstrip(sprites['effects/3'], 16, 16),
    filmstrip(sprites['effects/fx-7'], 41, 36),
    filmstrip(sprites['effects/4'], 16, 16),
  ];

});

import { getGroupMask } from 'engine/physics';

export const GROUPS = {
  SOLID:    getGroupMask(1),

  ME:       getGroupMask(2),
  ME_DMG:   getGroupMask(3),

  FOE:      getGroupMask(4),
  FOE_DMG:  getGroupMask(5),
};
