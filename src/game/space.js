import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';
import Camera from 'engine/camera';

import { TEXTURES } from 'game/data';

import Ship from 'game/ship';

const SPACE_WIDTH = 128;
const SPACE_HEIGHT = 128;

class Space extends Scene {
  constructor() {
    super();

    // Setup layers
    this.bgLayer = new PIXI.Container().addTo(this.stage);
    this.actLayer = new PIXI.Container().addTo(this.stage);
    this.uiLayer = new PIXI.Container().addTo(this.stage);

    // Background
    this.bg = new PIXI.extras.TilingSprite(TEXTURES.BG, 64, 64).addTo(this.bgLayer);

    // Setup camera
    this.camera = new Camera().addTo(this, this.actLayer);
    this.camera.minX = -SPACE_WIDTH * 0.5 + 32;
    this.camera.maxX = SPACE_WIDTH * 0.5 - 32;
    this.camera.minY = -SPACE_HEIGHT * 0.5 + 32;
    this.camera.maxY = SPACE_HEIGHT * 0.5 - 32;
    this.camera.sensor.width = 8;
    this.camera.sensor.height = 8;
    this.camera.rounding = true;

    Object.defineProperty(this, 'left', {
      get: function() { return -SPACE_WIDTH * 0.5 }
    });
    Object.defineProperty(this, 'right', {
      get: function() { return SPACE_WIDTH * 0.5 }
    });
    Object.defineProperty(this, 'top', {
      get: function() { return -SPACE_HEIGHT * 0.5 }
    });
    Object.defineProperty(this, 'bottom', {
      get: function() { return SPACE_HEIGHT * 0.5 }
    });
  }
  awake() {
    const s = new Ship().addTo(this, this.actLayer);
    this.camera.setTarget(s.sprite);
  }
  update() {
    this.bg.tilePosition.copy(this.actLayer.pivot).multiply(-1);
  }
}

engine.addScene('Space', Space);
