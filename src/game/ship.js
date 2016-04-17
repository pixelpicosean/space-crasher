import engine from 'engine/core';
import PIXI from 'engine/pixi';
import SpriteActor from 'engine/actors/sprite-actor';
import AnimatedActor from 'engine/actors/animated-actor';
import keyboard from 'engine/keyboard';
import Vector from 'engine/vector';

import Health from 'behaviors/health';

import { TEXTURES, GROUPS } from 'game/data';

const LEFT = Vector.create(-1, 0);
const RIGHT = Vector.create(1, 0);
const UP = Vector.create(0, -1);
const DOWN = Vector.create(0, 1);

/* bullet */
const LV1 = {
  texture: 0,
  speed: 30,
  cooldown: 180,
  offset: 6,
  push: 20,
};
/* lazer */
const LV2 = {
  texture: 1,
  speed: 80,
  cooldown: 200,
  offset: 8,
  push: 10,
};
/* missile */
const LV3 = {
  texture: 2,
  speed: 16,
  cooldown: 700,
  offset: 8,
  push: 16,
};
/* super */
const LV4 = {
  texture: 3,
  speed: 24,
  cooldown: 300,
  offset: 5,
  push: 40,
};

const FX_ANIMS = [
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5, 6, 7],
];
const effect = (idx, x, y) => {
  const spr = new PIXI.extras.AnimatedSprite(TEXTURES.FX[idx]);
  spr.addAnim('a', FX_ANIMS[idx], {
    speed: 12,
    loop: false,
  });
  spr.play('a').once('finish', spr.remove, spr);
  spr.anchor.set(0.5);
  spr.position.set(x, y);
  return spr;
};

class Bullet extends AnimatedActor {
  constructor(tex, pos, dir, speed) {
    super(tex, 'Box');
    this.addAnim('a', tex.length === 1 ? [0] : [2, 1, 0], {
      speed: 8,
    });
    this.play('a');
    this.sprite.rotation = dir.angle();

    this.speed = speed || 40;
    this.atk = 1;

    this.position.copy(pos);
    this.velocity.copy(dir).multiply(this.speed);
    this.collisionGroup = GROUPS.ME_DMG;
    this.collideAgainst = [GROUPS.SOLID, GROUPS.FOE, GROUPS.FOE_DMG];
    this.body.collide = this.collide;
    this.body.parent = this;
  }
  update() {
    if (this.position.x < this.scene.left - this.sprite.width ||
      this.position.x > this.scene.right + this.sprite.width ||
      this.position.y < this.scene.top - this.sprite.height ||
      this.position.y > this.scene.bottom + this.sprite.height) {
      this.remove();
    }
  }

  collide(other) {
    other.parent.receiveDamage(this.parent.atk);
    this.parent.remove();

    // Effect
    effect(1, this.position.x, this.position.y)
      .addTo(this.parent.parent);
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
    new Bullet(TEXTURES.SHOOTS[this.shotTex], this.emitPoint, this.dir, this.speed)
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
      right: new Weapon(this, RIGHT).setup(LV1),
      up: new Weapon(this, UP).setup(LV1),
      down: new Weapon(this, DOWN).setup(LV1),
    };

    // Setup physics
    this.collisionGroup = GROUPS.ME;
    this.velocityLimit.set(20);
    this.damping = 0.85;

    this.body.parent = this;

    this.position.set(16, 16);
  }
  addTo(scene, layer) {
    super.addTo(scene, layer);

    new Health({
        startHealth: 10,
        maxHealth: 10,
        damageInvincibleTime: 1000,
      })
      .addTo(this, scene)
      .once('kill', this.remove, this)
      .activate();

    return this;
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
