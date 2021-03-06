/**
 * @module engine/scene
 */

var EventEmitter = require('engine/eventemitter3');
var engine = require('engine/core');
var utils = require('engine/utils');
var config = require('game/config').default;

/**
 * Scene is the main hub for a game. A game made with LesserPanda
 * is a combination of different scenes(menu, shop, game, game-over .etc).
 * @class Scene
 * @constructor
 * @extends {EvenetEmitter}
 */
function Scene() {
  EventEmitter.call(this);

  /**
   * Desired FPS this scene should run
   * @property {Number} desiredFPS
   * @default 30
   */
  this.desiredFPS = config.desiredFPS || 30;

  /**
   * @property {Array} updateOrder
   * @private
   */
  this.updateOrder = [];

  var i, name, sys;
  for (i in Scene.updateOrder) {
    name = Scene.updateOrder[i];
    sys = Scene.systems[name];

    if (sys) {
      this.updateOrder.push(name);
      sys.init && sys.init(this);
    }
  }
}

Scene.prototype = Object.create(EventEmitter.prototype);
Scene.prototype.constructor = Scene;

/**
 * Called before activating this scene
 */
Scene.prototype._awake = function _awake() {
  for (var i in this.updateOrder) {
    sys = Scene.systems[this.updateOrder[i]];
    sys.awake && sys.awake(this);
  }

  this.emit('awake');
  this.awake();
};

/**
 * Called each single frame once or more
 */
Scene.prototype._update = function _update(deltaMS, deltaSec) {
  var i, sys;

  // Pre-update
  for (i in this.updateOrder) {
    sys = Scene.systems[this.updateOrder[i]];
    sys && sys.preUpdate && sys.preUpdate(this, deltaMS, deltaSec);
  }

  this.emit('preUpdate', deltaMS, deltaSec);
  this.preUpdate(deltaMS, deltaSec);

  // Update
  for (i in this.updateOrder) {
    sys = Scene.systems[this.updateOrder[i]];
    sys && sys.update && sys.update(this, deltaMS, deltaSec);
  }

  this.emit('update', deltaMS, deltaSec);
  this.update(deltaMS, deltaSec);

  // Post-update
  for (i in this.updateOrder) {
    sys = Scene.systems[this.updateOrder[i]];
    sys && sys.postUpdate && sys.postUpdate(this, deltaMS, deltaSec);
  }

  this.emit('postUpdate', deltaMS, deltaSec);
  this.postUpdate(deltaMS, deltaSec);
};

/**
 * Called before deactivating this scene
 */
Scene.prototype._freeze = function _freeze() {
  this.emit('freeze');
  this.freeze();

  var i, sys;
  for (i in this.updateOrder) {
    sys = Scene.systems[this.updateOrder[i]];
    sys && sys.freeze && sys.freeze(this);
  }
};

/**
 * Awake is called when this scene is activated.
 * @method awake
 */
Scene.prototype.awake = function awake() {};
/**
 * PreUpdate is called at the beginning of each frame
 * @method preUpdate
 */
Scene.prototype.preUpdate = function preUpdate() {};
/**
 * Update is called each frame, right after `preUpdate`.
 * @method update
 */
Scene.prototype.update = function update() {};
/**
 * PostUpdate is called at the end of each frame, right after `update`.
 * @method postUpdate
 */
Scene.prototype.postUpdate = function postUpdate() {};
/**
 * Freeze is called when this scene is deactivated(switched to another one)
 */
Scene.prototype.freeze = function freeze() {};

/**
 * System pause callback.
 */
Scene.prototype.pause = function pause() {};
/**
 * System resume callback.
 */
Scene.prototype.resume = function resume() {};

Object.assign(Scene, {
  /**
   *  @property desiredFPS
   * @default 30
   */
  desiredFPS: config.desiredFPS || 30,

  systems: {},
  /**
   * System updating order
   *  @property {Array} updateOrder
   */
  updateOrder: [
    'Actor',
    'Animation',
    'Physics',
    'Renderer',
  ],
  /**
   * Register a new sub-system.
   * @memberOf Scene
   * @static
   * @param  {String} name
   * @param  {Object} system
   */
  registerSystem: function registerSystem(name, system) {
    if (Scene.systems[name]) console.log('Warning: override [' + name + '] system!');

    Scene.systems[name] = system;
  },
});

// Actor system --------------------------------------------
Object.assign(Scene.prototype, {
  /**
   * Spawn an Actor to this scene
   * @method spawnActor
   * @memberOf Scene
   * @param  {Actor} actor      Actor class
   * @param  {Number} x
   * @param  {Number} y
   * @param  {String} layerName Name of the layer to add to(key of a PIXI.Container instance in this scene)
   * @param  {Object} settings  Custom settings
   * @param  {String} [settings.name] Name of this actor
   * @param  {String} [settings.tag]  Tag of this actor
   * @return {Actor}            Actor instance
   */
  spawnActor: function spawnActor(actor, x, y, layerName, settings) {
    var settings_ = settings || {};

    if (!this[layerName]) {
      console.log('Layer ' + layerName + ' does not exist!');
      return null;
    }

    var a = new actor(settings_).addTo(this, this[layerName]);
    a.position.set(x, y);
    this.addActor(a, settings_.tag);

    if (settings_.name) {
      a.name = settings_.name;
      this.namedActors[settings_.name] = a;
    }

    return a;
  },

  /**
   * Add actor to this scene, so its `update()` function gets called every frame.
   * @method addActor
   * @memberOf Scene
   * @param {Actor} actor   Actor you want to add
   * @param {String} tag    Tag of this actor, default is '0'
   */
  addActor: function addActor(actor, tag) {
    var t = tag || '0';

    actor.tag = t;

    if (!this.actorSystem.actors[t]) {
      // Create a new actor list
      this.actorSystem.actors[t] = [];

      // Active new tag by default
      this.actorSystem.activeTags.push(t);
    }

    if (this.actorSystem.actors[t].indexOf(actor) < 0) {
      actor.removed = false;
      this.actorSystem.actors[t].push(actor);
    }
  },

  /**
   * Remove actor from scene.
   * @method removeActor
   * @memberOf Scene
   * @param {Actor} actor
   */
  removeActor: function removeActor(actor) {
    // Will remove in next frame
    if (actor) actor.removed = true;

    // Remove name based reference
    if (actor.name) {
      if (this.actorSystem.namedActors[actor.name] === actor) {
        this.actorSystem.namedActors[actor.name] = null;
      }
    }
  },

  /**
   * Pause actors with a specific tag.
   * @param  {String} tag
   */
  pauseActorsTagged: function pauseActorsTagged(tag) {
    if (this.actorSystem.actors[tag]) {
      utils.removeItems(this.actorSystem.activeTags, this.actorSystem.activeTags.indexOf(tag), 1);
      this.actorSystem.deactiveTags.push(tag);
    }

    return this;
  },

  /**
   * Resume actors with a specific tag.
   * @param  {String} tag
   */
  resumeActorsTagged: function resumeActorsTagged(tag) {
    if (this.actorSystem.actors[tag]) {
      utils.removeItems(this.actorSystem.deactiveTags, this.actorSystem.deactiveTags.indexOf(tag), 1);
      this.actorSystem.activeTags.push(tag);
    }

    return this;
  },
});

Scene.registerSystem('Actor', {
  init: function init(scene) {
    /**
     * Actor system runtime data storage
     */
    scene.actorSystem = {
      activeTags: ['0'],
      deactiveTags: [],
      actors: {
        '0': [],
      },
      namedActors: {},
    };
  },
  update: function update(scene, deltaMS, deltaSec) {
    var i, key, actors, actor;
    for (key in scene.actorSystem.actors) {
      if (scene.actorSystem.activeTags.indexOf(key) < 0) continue;

      actors = scene.actorSystem.actors[key];
      for (i = 0; i < actors.length; i++) {
        actor = actors[i];

        if (!actor.removed) {
          if (actor.behaviorList.length > 0) {
            actor.updateBehaviors(deltaMS, deltaSec);
          }
          if (actor.canEverTick) {
            actor.update(deltaMS, deltaSec);
          }
        }

        if (actor.removed) {
          utils.removeItems(actors, i--, 1);
        }
      }
    }
  },
});

module.exports = Scene;
