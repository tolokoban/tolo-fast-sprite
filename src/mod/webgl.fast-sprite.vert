uniform mat3 uniTransform;
uniform float uniWidth;
uniform float uniHeight;

attribute vec3 attPosition;
attribute vec3 attUV;
varying vec3 varUV;

void main() {
  varUV = attUV;
  
  vec3 pos = uniTransform * vec3( attPosition.xy, 1.0 );
  gl_Position = vec4( pos.xy, attPosition.z, 1.0 );

  // Convert pixels to WebGL space coords.
  gl_Position.x = 2.0 * gl_Position.x / uniWidth - 1.0;
  gl_Position.y = 1.0 - 2.0 * gl_Position.y / uniHeight;
}
