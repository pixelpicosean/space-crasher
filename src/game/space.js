import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';
import rnd from 'engine/rnd';
import Timer from 'engine/timer';
import Camera from 'engine/camera';

import { TEXTURES } from 'game/data';

import Meteor from 'game/meteor';
import Ship from 'game/ship';

const SPACE_WIDTH = 128;
const SPACE_HEIGHT = 128;

const METEOR_SPAWN_TIME_MIN = 2000;
const METEOR_SPAWN_TIME_MAX = 5000;
const METEOR_MAX = 6;

class Space extends Scene {
  constructor() {
    super();

    // States
    this.meteorCount = 0;

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
    this.meteorCount = 0;

    const s = new Ship().addTo(this, this.actLayer);
    this.camera.setTarget(s.sprite);

    this.spawnMeteor();
  }
  update() {
    this.bg.tilePosition.copy(this.actLayer.pivot).multiply(-1);
  }

  spawnMeteor() {
    if (this.meteorCount < METEOR_MAX) {
      new Meteor(rnd.between(this.left, this.right), rnd.between(this.top, this.bottom))
        .addTo(this, this.actLayer)
        .once('destroy', this.meteorDestroyed, this);

      this.meteorCount += 1;
    }

    Timer.later(rnd.between(METEOR_SPAWN_TIME_MIN, METEOR_SPAWN_TIME_MAX), this.spawnMeteor, this);
  }
  meteorDestroyed() {
    this.meteorCount -= 1;
  }
}

engine.addScene('Space', Space);
