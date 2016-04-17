import SpriteActor from 'engine/actors/sprite-actor';
import rnd from 'engine/rnd';

import { TEXTURES, GROUPS } from 'game/data';

const SPEED_MIN = 4;
const SPEED_MAX = 12;
const PI_2 = Math.PI * 2;

const LEVELS = [5, 4, 3, 2, 1];

export default class Meteor extends SpriteActor {
  constructor(x, y, lv = -1) {
    const level = (lv < 0) ? rnd.weightedPick(LEVELS) : lv;
    const tex = TEXTURES.METEORS[5 - level];

    super(tex, 'Box');

    this.alive = true;

    this.speed = rnd.between(SPEED_MIN, SPEED_MAX);
    this.lv = level;
    this.atk = 1;
    switch (this.lv) {
      case 5:
        this.health = 8;
        break;
      case 4:
        this.health = 3;
        break;
      case 3:
        this.health = 10;
        break;
      case 2:
        this.health = 5;
        break;
      case 1:
        this.health = 2;
        break;
    }

    this.position.set(x, y);
    this.velocity.set(this.speed, 0).rotate(rnd.realInRange(0, PI_2));
    this.collisionGroup = GROUPS.SOLID;
    this.collideAgainst = [GROUPS.SOLID, GROUPS.FOE, GROUPS.ME];
    this.body.collide = this.collide;
    this.body.parent = this;
  }
  update() {
    if (this.position.x < this.scene.left - this.sprite.width ||
      this.position.x > this.scene.right + this.sprite.width ||
      this.position.y < this.scene.top - this.sprite.height ||
      this.position.y > this.scene.bottom + this.sprite.height) {
      this.destroy();
    }
  }

  collide(other) {
    if (other.collisionGroup === GROUPS.SOLID) {
      return true;
    }
    other.parent.receiveDamage(this.parent.atk);
  }

  destroy() {
    this.emit('destroy');
    this.remove();
  }

  receiveDamage() {
    if (!this.alive) return;

    this.health -= 1;
    if (this.health <= 0) {
      this.alive = false;

      let newLv = 0;
      switch (this.lv) {
        case 5:
          newLv = 4;
          break;
        case 3:
        case 2:
        case 1:
          newLv = this.lv - 1;
          break;
      }
      if (newLv > 0) {
        let offsetX, offsetY;

        offsetX = rnd.between(-8, 8);
        offsetY = rnd.between(-8, 8);
        new Meteor(this.position.x + offsetX, this.position.y + offsetY, newLv)
          .addTo(this.scene, this.parent);

        offsetX = rnd.between(-8, 8);
        offsetY = rnd.between(-8, 8);
        new Meteor(this.position.x + offsetX, this.position.y + offsetY, newLv)
          .addTo(this.scene, this.parent);
      }

      this.destroy();
    }
  }
};
