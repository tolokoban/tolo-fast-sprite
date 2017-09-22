"use strict";

var FastSprite = require("webgl.fast-sprite");


var sequences = {
  BuildLevel: require("game1.sequence.buildlevel"),
  PlayTime: require("game1.sequence.playtime")
};


function Runtime( gl, resolution, atlas ) {
  // Level index.
  this.levelIndex = 0;
  // Current level.
  this.level = null;
  // WebGL.
  this.gl = gl;
  this.resolution = resolution;
  // Grid of 4x4 sprites.
  this.atlas = atlas;
  // Sprite API.
  this.playground = createPlayground( gl, atlas );
  this.legend = createPlayground( gl, atlas );
  // Characters.
  this.hero = null;
  this.monsters = null;
  // These  three  variables  are  used  internally  to  manage  the
  // relative time and delta used in a sequence.
  this.absoluteTime = 0;
  this.baseTime = 0;
  this.lastTime = -1;
  // Time relative to the beginning of the sequence.
  this.time = 0;
  // Delta time between two subsequent calls of animationFrame.
  this.delta = 0;
  // The  sequence is  a function  which  will be  called with  this
  // runtime.
  this.sequence = null;
  // Object used as a context for current sequence.
  this.context = {};
};


Runtime.prototype.setNextSequence = function( sequenceName ) {
  var sequence = sequences[sequenceName];
  if( typeof sequence !== 'function' ) {
    throw Error("Unknown sequence name: " + sequenceName);
  }
  console.log( "Next sequence: ", sequenceName );
  this.sequence = sequence;
  // The time of a new sequence always starts at zero.
  this.baseTime = this.absoluteTime;
  this.deltaTime = 0;
  this.time = 0;
  if( typeof sequence.init === 'function' ) {
    // There is an initialization function for this sequence.
    sequence.init( this );
  }
};



module.exports = Runtime;



function createLegend( gl, atlas ) {
  return new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/4, cellSrcH: 1/4,
    cellDstW: 128, cellDstH: 128
  });
}

function createPlayground( gl, atlas ) {
  return new FastSprite({
    gl: gl, atlas: atlas,
    cellSrcW: 1/4, cellSrcH: 1/4,
    cellDstW: 128, cellDstH: 128
  });
}
