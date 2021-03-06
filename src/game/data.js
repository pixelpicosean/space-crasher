import loader from 'engine/loader';
import audio from 'engine/audio';
import filmstrip from 'engine/tilemap/filmstrip';

loader.addAsset('KenPixel.fnt');
loader.addAsset('sprites.json', 'sprites');

audio.addSound(['fire.ogg', 'fire.m4a'], 'fire');
audio.addSound(['death.ogg', 'death.m4a'], 'death');
audio.addSound(['explo.ogg', 'explo.m4a'], 'explo');
audio.addSound(['hit.ogg', 'hit.m4a'], 'hit');
audio.addSound(['shoot.ogg', 'shoot.m4a'], 'shoot');
audio.addSound(['bgm.ogg', 'bgm.m4a'], 'bgm');

export const TEXTURES = {};
loader.on('complete', () => {

  const sprites = loader.resources['sprites'].textures;

  // Background
  TEXTURES.BG = sprites['backgrounds/1'];

  // Actors
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

  // Eye candy
  TEXTURES.FX = [
    filmstrip(sprites['effects/2'], 23, 22),
    filmstrip(sprites['effects/3'], 16, 16),
    filmstrip(sprites['effects/fx-7'], 41, 36),
    filmstrip(sprites['effects/4'], 16, 16),
  ];

  // HUD
  TEXTURES.HUD = {
    HEALTH_BOX: sprites['hud/life-box'],
    HEALTH_SEG: sprites['hud/life-rectangle'],
    PANEL: sprites['hud/panel'],
  };

  TEXTURES.MENU = {
    TITLE: sprites['title'],
    TITLE_BTN: sprites['title-btn'],
  };

});

import { getGroupMask } from 'engine/physics';

export const GROUPS = {
  SOLID:    getGroupMask(1),

  ME:       getGroupMask(2),
  ME_DMG:   getGroupMask(3),

  FOE:      getGroupMask(4),
  FOE_DMG:  getGroupMask(5),
};
