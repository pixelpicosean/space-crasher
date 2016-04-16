import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';
import loader from 'engine/loader';

import 'game/loading';
import 'game/space';

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

class Main extends Scene {
  awake() {
    engine.setScene('Space');
  }
};
engine.addScene('Main', Main);

engine.startWithScene('Loading');
