# tolo-fast-sprite

WebGL is fast executing orders, but sending it an order is time consumming.
That's why you'd better give it a lot of work at once.

That's the purpose of this library: painting a lot of sprites at once.

Here is a basic example:

```
var painter = new ToloFastSprite({
  gl: webglContext,
  atlas: imageWithAllTheSprites,
  spriteW: 0.5, spriteH: 0.5
});

painter.addSpriteXY( 128, 200, 0 );
painter.addSpriteXY( 196, 100, 1 );
painter.x = 320;
painter.y = 480;

painter.paint( time );
```
