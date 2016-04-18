import engine from 'engine/core';
import PIXI from 'engine/pixi';
import Timer from 'engine/timer';
import 'engine/animation';
import { session, persistent } from 'engine/storage';

import { TEXTURES } from 'game/data';

function msToString(ms) {
  let sec = Math.floor(ms / 1000);
  let min = Math.floor(sec / 60);

  min = (min < 10) ? `0${min}` : `${min}`;
  sec = (sec < 10) ? `0${sec}` : `${sec}`;

  return `${min}:${sec}`;
}

export default class GameOverPanel {
  constructor() {
    this.panel = new PIXI.Sprite(TEXTURES.HUD.PANEL);
    this.panel.interactive = true;

    const title = this.addText('Game Over', 32, 10, true);

    this.score = this.addText('Score: 32', 10, 22);
    this.time = this.addText('Time: 03:16', 10, 32);

    this.continue = this.addText('CONTINUE', 32, 48, true);
  }
  addTo(scene) {
    this.scene = scene;
    this.panel.addTo(this.scene.uiLayer);
    this.panel.visible = false;

    return this;
  }

  show() {
    this.panel.visible = true;

    // Update information
    this.score.text = `Score: ${session.get('score')}`;
    this.time.text = `Time: ${msToString(Timer.now - session.get('time'))}`;

    // Animation
    this.anim = this.scene.tween(this.continue)
      .wait(800)
      .to({ alpha: 0 }, 100)
      .wait(800)
      .to({ alpha: 1 }, 100)
      .repeat(Number.MAX_VALUE);

    // Touch to hide
    this.panel.once('mousedown', this.hide, this);
  }
  hide() {
    this.panel.visible = false;

    // Stop animation
    this.anim.stop();

    // Go to title scene
    engine.setScene('Menu');
  }

  addText(content, x, y, centerAlign = false) {
    const text = new PIXI.extras.BitmapText(content, {
      font: `8px KenPixel`,
    }).addTo(this.panel);

    text.position.set(x, y);
    if (centerAlign) {
      text.position.subtract(text.width * 0.5, text.height * 0.5);
    }

    return text;
  }
}
