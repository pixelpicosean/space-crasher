import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';

import { TEXTURES } from 'game/data';

import Ship from 'game/ship';

class Space extends Scene {
  constructor() {
    super();

    this.worldLayer = new PIXI.Container().addTo(this.stage);
      this.bgLayer = new PIXI.Container().addTo(this.worldLayer);
      this.actLayer = new PIXI.Container().addTo(this.worldLayer);
    this.uiLayer = new PIXI.Container().addTo(this.stage);
  }
  awake() {
    const s = new Ship().addTo(this, this.actLayer);
  }
}

engine.addScene('Space', Space);
