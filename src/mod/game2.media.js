"use strict";

var $ = require("dom");
var Modal = require("wdg.modal");


exports.show = function( source, runtime ) {
  console.info("[game2.media] source=", source);
  if( hasSuffix( source, ".webm" ) ) showWebm( source, runtime );
};


function showWebm( source, runtime ) {
  var video = $.tag( "video", "hide", {
    src: "css/game2.gfx/" + source
  });

  var eventHandler = function(evt) {
    if( evt.key !== 'Escape' ) {
      console.info("[game2.media] evt.key=", evt.key);
      return;
    }
    confirm();
  };

  function confirm() {
    Modal.confirm({
      title: "Fin de la vidéo",
      content: "Voulez-vous revoir cette vidéo ?",
      yes: "Oui", no: "Non",
      onYes: function() {
        video.play();
      },
      onNo: function() {
        document.removeEventListener( "keyup", eventHandler );
        $.addClass(video, "hide");
        window.setTimeout(function() {
          console.log("C'est fini et on ne veut plus recommencer...");
          $.detach( video );
          delete runtime.pause;
        }, 500);
      }
    });
  };

  document.addEventListener( "keyup", eventHandler );
  
  $.add( document.body, video );
  window.setTimeout(function() {
    video.play();
  }, 500);
  window.setTimeout(function() {
    $.removeClass(video, "hide");
  }, 1);
  video.addEventListener( "ended", confirm );
}


function hasSuffix( name, suffix ) {
  return name.toLowerCase().substr( name.length - suffix.length ) === suffix;
}
