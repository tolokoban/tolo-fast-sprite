"use strict";

require("polyfill.promise");
var $ = require("dom");


/**
 * Display a splash screen while loading images in background
 * @param {object} images  - Key/values dictionary. The key  is a name
 * and the value is the image URL.
 * @return {Promise}  The `resolve`  function accepts one  argument: a
 * copy of `images`  where the values are the loaded  images or `null`
 * if the loading failed.
 */
module.exports = function( images ) {
  var splash = $.div( "splash", [$.div(["TOLOKOBAN"])] );
  $.add( document.body, splash );
  return new Promise(function (resolve, reject) {
    window.setTimeout(function() {
      $.addClass( splash, "show" );
    });
    var loader = new Promise(function(resolve, reject) {
      var result = {};
      var key, url, img, count = 0;

      for( key in images ) count++;
      var next = function() {
        count--;
        if( count <= 0 ) {
          resolve( result );
        }
      };
      for( key in images ) {
        url = images[key];
        img = new Image();
        img.$key = key;
        img.src = url;
        img.onload = function() {
          result[this.$key] = this;
          next();
        };
        img.onerror = function() {
          console.error("Unable to load image: ", images[this.$key]);
          result[this.$key] = null;
          next();
        };
      }
    });

    window.setTimeout(function() {
      loader.then(function( result ) {
        resolve( result );
        $.addClass( splash, "hide" );
        window.setTimeout(function() {
          $.detach( splash );
        }, 300);
      });
    }, 1000);
  });
};
