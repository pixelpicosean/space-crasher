import engine from 'engine/core';
import PIXI from 'engine/pixi';
import SpriteActor from 'engine/actors/sprite-actor';
import AnimatedActor from 'engine/actors/animated-actor';
import keyboard from 'engine/keyboard';
import Vector from 'engine/vector';

import { TEXTURES, GROUPS } from 'game/data';

const LEFT = Vector.create(-1, 0);
const RIGHT = Vector.create(1, 0);
const UP = Vector.create(0, -1);
const DOWN = Vector.create(0, 1);

const LV1 = {
  texture: 0,
  speed: 30,
  cooldown: 160,
  offset: 8,
  push: 20,
};
const LV2 = {
  texture: 1,
  speed: 36,
  cooldown: 200,
  offset: 8,
  push: 30,
};
const LV3 = {
  texture: 2,
  speed: 20,
  cooldown: 300,
  offset: 8,
  push: 16,
};
const LV4 = {
  texture: 3,
  speed: 24,
  cooldown: 200,
  offset: 8,
  push: 36,
};

class Bullet extends AnimatedActor {
  constructor(tex, pos, dir) {
    super(tex, 'Box');
    this.addAnim('a', tex.length === 1 ? [0] : [0, 1, 2], {
      speed: 6,
    });
    this.play('a');
    this.sprite.rotation = dir.angle();

    this.speed = 40;
    this.atk = 1;

    this.position.copy(pos);
    this.velocity.copy(dir).multiply(this.speed);
    this.collisionGroup = GROUPS.DMG;
    this.collideAgainst = [GROUPS.SOLID, GROUPS.FOE, GROUPS.FOE_DMG];
    this.collide = this.collide;
    this.body.parent = this;
  }
  update() {
    if (this.position.x < -this.sprite.width ||
      this.position.x > engine.width + this.sprite.width ||
      this.position.y < -this.sprite.height ||
      this.position.y > engine.height + this.sprite.height) {
      this.remove();
    }
  }

  collide(other) {
    other.parent.receiveDamager(this.parent.atk);
  }
}

class Weapon {
  constructor(ship, dir) {
    this.ship = ship;

    this.dir = dir.clone();
    this.emitPoint = Vector.create();

    // Config
    this.shotTex = null;
    this.speed = 0;
    this.cooldown = 0;
    this.offset = 0;
    this.push = 0;

    // Private
    this.timer = 0;

    // Component
    this.sprite = new PIXI.Sprite().addTo(this.ship.sprite);
  }
  setup({ texture, speed, cooldown, offset, push }) {
    this.shotTex = texture;
    this.speed = speed;
    this.offset = offset;
    this.cooldown = cooldown;
    this.push = push;

    return this;
  }
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
    }
  }

  fire() {
    if (this.timer > 0) return false;

    // Increase cooldown
    this.timer = this.cooldown;

    // Fire bullet
    this.emitPoint
      .copy(this.dir).multiply(this.offset)
      .add(this.ship.position);
    new Bullet(TEXTURES.SHOOTS[this.shotTex], this.emitPoint, this.dir)
      .addTo(this.ship.scene, this.ship.scene.actLayer);

    // Request a push back
    return true;
  }
}

export default class Ship extends SpriteActor {
  constructor() {
    super(TEXTURES.SHIP, 'Circle');

    // States
    this.weapon = {
      left: new Weapon(this, LEFT).setup(LV1),
      right: new Weapon(this, RIGHT).setup(LV2),
      up: new Weapon(this, UP).setup(LV3),
      down: new Weapon(this, DOWN).setup(LV4),
    };

    // Setup physics
    this.collisionGroup = GROUPS.ME;
    this.velocityLimit.set(20);
    this.damping = 0.85;

    this.position.set(16, 16);
  }
  update(dt) {
    this.weapon.left.update(dt);
    this.weapon.right.update(dt);
    this.weapon.up.update(dt);
    this.weapon.down.update(dt);

    if (keyboard.down('UP')) {
      this.shoot(UP);
    }
    if (keyboard.down('DOWN')) {
      this.shoot(DOWN);
    }
    if (keyboard.down('LEFT')) {
      this.shoot(LEFT);
    }
    if (keyboard.down('RIGHT')) {
      this.shoot(RIGHT);
    }
  }

  shoot(dir) {
    if (dir.x < 0) {
      if (this.weapon.left.fire()) {
        this.velocity.x = this.weapon.left.push;
      }
    }
    if (dir.x > 0) {
      if (this.weapon.right.fire()) {
        this.velocity.x = -this.weapon.right.push;
      }
    }
    if (dir.y < 0) {
      if (this.weapon.up.fire()) {
        this.velocity.y = this.weapon.up.push;
      }
    }
    if (dir.y > 0) {
      if (this.weapon.down.fire()) {
        this.velocity.y = -this.weapon.down.push;
      }
    }
  }
}
