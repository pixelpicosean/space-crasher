import engine from 'engine/core';
import Scene from 'engine/scene';
import PIXI from 'engine/pixi';
import loader from 'engine/loader';
import { session, persistent } from 'engine/storage';

import 'game/loading';
import 'game/menu';
import 'game/space';

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

session.addInt('score', 0);
session.addInt('time', 0);

class Main extends Scene {
  awake() {
    engine.setScene('Menu');
  }
};
engine.addScene('Main', Main);

engine.startWithScene('Loading');
