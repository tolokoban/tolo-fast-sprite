uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;
uniform float uniZoom;

attribute vec3 attPosition;
attribute vec2 attUV;
varying vec2 varUV;

void main() {
  varUV = attUV;
  
  vec3 pos = attPosition - vec3( uniX, uniY, uniZ );
  gl_Position = vec4( pos, 1.0 );

  // Convert pixels to WebGL space coords.
  gl_Position.x = (2.0 * gl_Position.x / uniWidth) * uniZoom;
  gl_Position.y = (-2.0 * gl_Position.y / uniHeight) * uniZoom;
}
