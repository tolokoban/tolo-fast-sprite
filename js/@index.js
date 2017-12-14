/**********************************************************************
 require( 'require' )
 -----------------------------------------------------------------------
 @example

 var Path = require("node://path");  // Only in NodeJS/NW.js environment.
 var Button = require("tfw.button");

 **********************************************************************/

window.require = function() {
    var modules = {};
    var definitions = {};
    var nodejs_require = typeof window.require === 'function' ? window.require : null;

    var f = function(id, body) {
        if( id.substr( 0, 7 ) == 'node://' ) {
            // Calling for a NodeJS module.
            if( !nodejs_require ) {
                throw Error( "[require] NodeJS is not available to load module `" + id + "`!" );
            }
            return nodejs_require( id.substr( 7 ) );
        }

        if( typeof body === 'function' ) {
            definitions[id] = body;
            return;
        }
        var mod;
        body = definitions[id];
        if (typeof body === 'undefined') {
            var err = new Error("Required module is missing: " + id);   
            console.error(err.stack);
            throw err;
        }
        mod = modules[id];
        if (typeof mod === 'undefined') {
            mod = {exports: {}};
            var exports = mod.exports;
            body(f, mod, exports);
            modules[id] = mod.exports;
            mod = mod.exports;
            //console.log("Module initialized: " + id);
        }
        return mod;
    };
    return f;
}();
function addListener(e,l) {
    if (window.addEventListener) {
        window.addEventListener(e,l,false);
    } else {
        window.attachEvent('on' + e, l);
    }
};

addListener(
    'DOMContentLoaded',
    function() {
        document.body.parentNode.$data = {};
        // Attach controllers.
        APP = require('main');
setTimeout(function (){if(typeof APP.start==='function')APP.start()});

    }
);
<<<<<<< HEAD
require("$",function(r,t,n){n.config={name:'"tolo-fast-sprite"',description:'"Low-level versatile yet powerfull library to paint sprites on WebGL context"',author:'"tolokoban"',version:'"0.0.8"',major:"0",minor:"0",revision:"8",date:"2017-12-14T12:51:33.000Z",consts:{}};var o=null;n.lang=function(r){return void 0===r&&(window.localStorage&&(r=window.localStorage.getItem("Language")),r||(r=window.navigator.language)||(r=window.navigator.browserLanguage)||(r="fr"),r=r.substr(0,2).toLowerCase()),o=r,window.localStorage&&window.localStorage.setItem("Language",r),r},n.intl=function(r,t){var o,e,a,i,l,g,s,u=r[n.lang()],w=t[0];for(s in r)break;if(!s)return w;if(!u&&!(u=r[s]))return w;if(o=u[w],o||(u=r[s],o=u[w]),!o)return w;if(t.length>1){for(e="",l=0,a=0;a<o.length;a++)i=o.charAt(a),"$"===i?(e+=o.substring(l,a),a++,g=o.charCodeAt(a)-48,g<0||g>=t.length?e+="$"+o.charAt(a):e+=t[g],l=a+1):"\\"===i&&(e+=o.substring(l,a),a++,e+=o.charAt(a),l=a+1);e+=o.substr(l),o=e}return o}});
=======
require("$",function(r,t,n){n.config={name:'"tolo-fast-sprite"',description:'"Low-level versatile yet powerfull library to paint sprites on WebGL context"',author:'"tolokoban"',version:'"0.0.7"',major:"0",minor:"0",revision:"7",date:"2017-09-23T14:23:04.000Z",consts:{}};var o=null;n.lang=function(r){return void 0===r&&(window.localStorage&&(r=window.localStorage.getItem("Language")),r||(r=window.navigator.language)||(r=window.navigator.browserLanguage)||(r="fr"),r=r.substr(0,2).toLowerCase()),o=r,window.localStorage&&window.localStorage.setItem("Language",r),r},n.intl=function(r,t){var o,e,a,i,l,g,s,u=r[n.lang()],w=t[0];for(s in r)break;if(!s)return w;if(!u&&!(u=r[s]))return w;if(o=u[w],o||(u=r[s],o=u[w]),!o)return w;if(t.length>1){for(e="",l=0,a=0;a<o.length;a++)i=o.charAt(a),"$"===i?(e+=o.substring(l,a),a++,g=o.charCodeAt(a)-48,g<0||g>=t.length?e+="$"+o.charAt(a):e+=t[g],l=a+1):"\\"===i&&(e+=o.substring(l,a),a++,e+=o.charAt(a),l=a+1);e+=o.substr(l),o=e}return o}});
>>>>>>> dc2365dbc72900a85b369c3324c4a408d0d177b1
//# sourceMappingURL=$.js.map
require("main",function(e,n,r){var o=function(){function n(){return o(r,arguments)}var r={en:{welcome:"Welcome in the world of"},fr:{welcome:"Bienvenue dans le monde de"}},o=e("$").intl;return n.all=r,n}();n.exports._=o});
//# sourceMappingURL=main.js.map
