import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';

import { TEXTURES } from 'game/data';

import Ship from 'game/ship';

class Space extends Scene {
  constructor() {
    super();

    // Setup layers
    this.bgLayer = new PIXI.Container().addTo(this.stage);
    this.actLayer = new PIXI.Container().addTo(this.stage);
    this.uiLayer = new PIXI.Container().addTo(this.stage);

    // Background
    this.bg = new PIXI.extras.TilingSprite(TEXTURES.BG, 64, 64).addTo(this.bgLayer);
  }
  awake() {
    const s = new Ship().addTo(this, this.actLayer);
  }
}

engine.addScene('Space', Space);
