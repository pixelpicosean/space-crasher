import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';

import { TEXTURES } from 'game/data';

class Menu extends Scene {
  constructor() {
    super();

    let bg = new PIXI.Sprite(TEXTURES.MENU.TITLE).addTo(this.stage);

    let btn = new PIXI.Sprite(TEXTURES.MENU.TITLE_BTN).addTo(this.stage);
    btn.anchor.set(0.5);
    btn.position.set(48, 45);

    btn.interactive = true;
    btn.on('mousedown', this.start, this);

    let text = new PIXI.extras.BitmapText('By Sean', {
      font: '8px KenPixel',
    }).addTo(this.stage);
    text.position.set(30, 54);
  }
  start() {
    engine.setScene('Space');
  }
}

engine.addScene('Menu', Menu);
