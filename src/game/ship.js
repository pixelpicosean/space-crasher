import engine from 'engine/core';
import PIXI from 'engine/pixi';
import Actor from 'engine/actor';
import keyboard from 'engine/keyboard';
import Vector from 'engine/vector';
import Timer from 'engine/timer';
import audio from 'engine/audio'

import Health from 'behaviors/health';

import { TEXTURES, GROUPS } from 'game/data';

import effect from './effect';

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

const SHOT_FX_MAP = [3, 0, 2, 1];

class Bullet extends Actor {
  canEverTick = true;

  constructor({ texId, dir, speed }) {
    super();

    let tex = TEXTURES.SHOOTS[texId];

    this.initAnimation({
      textures: tex,
      anims: [
        { name: 'a', frames: tex.length === 1 ? [0] : [2, 1, 0], settings: { speed: 8 } }
      ],
    });
    this.sprite.play('a');

    this.initBody({
      shape: 'Box',
      collisionGroup: GROUPS.ME_DMG,
      collideAgainst: [GROUPS.SOLID, GROUPS.FOE, GROUPS.FOE_DMG],
      collide: this.collide,
    });

    this.speed = speed || 40;
    this.atk = 1;

    this.shotType = texId;

    this.rotation = dir.angle();
    this.body.velocity.copy(dir).multiply(this.speed);
  }
  update() {
    if (this.position.x < this.scene.camera.left - this.sprite.width ||
      this.position.x > this.scene.camera.right + this.sprite.width ||
      this.position.y < this.scene.camera.top - this.sprite.height ||
      this.position.y > this.scene.camera.bottom + this.sprite.height) {
      this.remove();
    }
  }

  collide(other) {
    // Effect
    effect(SHOT_FX_MAP[this.parent.shotType], this.position.x, this.position.y)
      .addTo(this.parent.scene.actLayer);
    audio.sounds['hit'].play();

    // Apply damage to target
    other.parent.receiveDamage(this.parent.atk);

    // Remove from the scene
    this.parent.remove();
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
    this.ship.scene.spawnActor(Bullet, this.emitPoint.x, this.emitPoint.y, 'actLayer', { texId: this.shotTex, dir: this.dir, speed: this.speed });

    audio.sounds['shoot'].play();

    // Request a push back
    return true;
  }
}

class HealthHUD {
  constructor(healthBhv) {
    this.sprite = new PIXI.Sprite(TEXTURES.HUD.HEALTH_BOX);
    this.sprite.position.set(1, 1);

    let i, seg;
    for (i = 0; i < healthBhv.maxHealth; i++) {
      seg = new PIXI.Sprite(TEXTURES.HUD.HEALTH_SEG).addTo(this.sprite);
      seg.position.set(i * 2, 0).add(3, 3);
    }
    healthBhv.on('health', (v) => {
      for (i = 0; i < v; i++) {
        this.sprite.children[i].visible = true;
      }
      for (i = v; i < healthBhv.maxHealth; i++) {
        this.sprite.children[i].visible = false;
      }
    });
  }
  addTo(scene) {
    this.sprite.addTo(scene.uiLayer);
    return this;
  }
  remove() {
    this.sprite.remove();
  }
}

export default class Ship extends Actor {
  canEverTick = true;

  constructor() {
    super();

    // Setup animation
    this.initAnimation({
      textures: TEXTURES.SHIP,
      anims: [
        { name: 'a', frames: [0] },
        { name: 'flash', frames: [0, 1], settings: { speed: 8 } },
      ],
    });

    // Setup physics
    this.initBody({
      shape: 'Circle',
      damping: 0.85,
      collisionGroup: GROUPS.ME,
      collideAgainst: [GROUPS.SOLID],
      collide: (other, res) => {
        if (other.collisionGroup === GROUPS.SOLID) {
          this.body.velocity.add(res.overlapN.clone().multiply(8));
          return true;
        }
      },
    });
    this.body.velocityLimit.set(20);
  }
  prepare() {
    this.weapon = {
      left: new Weapon(this, LEFT).setup(LV1),
      right: new Weapon(this, RIGHT).setup(LV1),
      up: new Weapon(this, UP).setup(LV1),
      down: new Weapon(this, DOWN).setup(LV1),
    };

    this.behave(Health, {
        startHealth: 12,
        maxHealth: 12,
        damageInvincibleTime: 2000,
      })
      .on('kill', this.destroy, this)
      .on('receiveDamage', this.beginFlash, this);

    this.hud = new HealthHUD(this.behaviors['Health'])
      .addTo(this.scene);

    this.sprite.play('a');
  }
  update(dt) {
    if (this.health <= 0) return;

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
        this.body.velocity.x = this.weapon.left.push;
      }
    }
    if (dir.x > 0) {
      if (this.weapon.right.fire()) {
        this.body.velocity.x = -this.weapon.right.push;
      }
    }
    if (dir.y < 0) {
      if (this.weapon.up.fire()) {
        this.body.velocity.y = this.weapon.up.push;
      }
    }
    if (dir.y > 0) {
      if (this.weapon.down.fire()) {
        this.body.velocity.y = -this.weapon.down.push;
      }
    }
  }
  beginFlash() {
    this.sprite.play('flash');
    Timer.later(this.behaviors['Health'].damageInvincibleTime, this.endFlash, this);

    this.scene.camera.shake(4, 40, 2, false);
  }
  endFlash() {
    this.sprite.play('a');
  }

  destroy() {
    effect(2, this.position.x, this.position.y);

    Timer.later(1000, () => {
      this.hud.remove();
      this.remove();
      this.scene.shipDestroyed();
    });
  }
}
