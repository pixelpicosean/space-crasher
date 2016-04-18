import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';

class Menu extends Scene {
  constructor() {
    super();

    this.stage.interactive = true;
    this.stage.containsPoint = () => true;
    this.stage.on('mousedown', this.start, this);
  }
  start() {
    engine.setScene('Space');
  }
}

engine.addScene('Menu', Menu);
