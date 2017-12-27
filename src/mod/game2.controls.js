"use strict";

/**
 * Chaque  action est  transformée en  propriété en  lecture seule  du
 * module.
 * Il  s'agit  d'une  valeur  comprise  entre 0  et  1.  Elle  exprime
 * l'intention du  joueur qui peut  avoir utilisé le  clavier, l'écran
 * tactile, le gamepad, ...
 */
var ACTIONS = {
  NE: 0, SE: 0, SW: 0, NW: 0,
  E: 0, W: 0, N: 0, S: 0,
  JUMP: 0
};

// Association de touches et d'actions.
var KEYS = {
  '9': 'NE',
  '6': 'E',
  '3': 'SE',
  '2': 'S',
  '1': 'SW',
  '4': 'W',
  '7': 'NW',
  '5': 'JUMP',
  'Enter': 'JUMP',
  'Space': 'JUMP',
  ' ': 'JUMP',
  'ArrowLeft': 'W',
  'ArrowUp': 'N',
  'ArrowRight': 'E',
  'ArrowDown': 'S'
};

var ACTIONS_keys = [];
for( var key in ACTIONS ) {
  ACTIONS_keys.push( key );
}

ACTIONS_keys.forEach(function (action) {
  Object.defineProperty( module.exports, action, {
    set: function() {},
    get: function() {
      return ACTIONS[action] || 0;
    },
    enumerable: true,
    configurable: false
  });
});

document.addEventListener("keydown", function(evt) {
  var action = getKeyboardAction( evt );
  if( action ) ACTIONS[action] = 1;
});

document.addEventListener("keyup", function(evt) {
  var action = getKeyboardAction( evt );
  if( action ) ACTIONS[action] = 0;
});

/**
 * @return L'action associée à la touche qui a déclenché l'événement.
 */
function getKeyboardAction( evt ) {
  var key = evt.key;
  var action = KEYS[key];
  //console.info("[controls] key=", key, action);
  if( action ) {
    evt.preventDefault();
  }
  return action;
}


module.exports.loop = function( time, delta ) {
  var gamepads = navigator.getGamepads ? navigator.getGamepads()
        : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  if( !gamepads ) return;
  var pad = gamepads[0];
  if( !pad ) return;

  var h = pad.axes[0];
  var v = pad.axes[1];

  ACTIONS.NE = ACTIONS.NW = ACTIONS.SE = ACTIONS.SW =
    ACTIONS.N = ACTIONS.S = ACTIONS.E = ACTIONS.W = 0;
  var absH = Math.abs(h);
  var absV = Math.abs(v);
  if( absH < .001 || absV < .001 ) return;

  if( Math.min(absH, absV) / Math.max(absH, absV) > .5 ) {
    // N, S, E or W.
    if( absH > absV ) {
      // Horizonzal.
      if( h > 0 ) ACTIONS.E = 1;
      else ACTIONS.W = 1;
    } else {
      // Vertical.
      if( v > 0 ) ACTIONS.N = 1;
      else ACTIONS.S = 1;      
    }
  } else {
    // NE, SE, NW or SW.
    if( h > 0 ) {
      // Right.
      if( v > 0 ) {
        // Down.
        ACTIONS.SE = 1;
      } else {
        // Up.
        ACTIONS.NE = 1;
      }
    } else {
      // Left.
      if( v > 0 ) {
        // Down.
        ACTIONS.SW = 1;
      } else {
        // Up.
        ACTIONS.NW = 1;
      }
    }
  }

  /*
   pad.axes.forEach(function (axe, idx) {
   if( axe === 0 ) return;
   console.info("[controls] idx, axe=", idx, axe);
   });
   */
};


window.addEventListener("gamepadconnected", function(e) {
  console.info("[controls] e.gamepad=", e.gamepad);

});
