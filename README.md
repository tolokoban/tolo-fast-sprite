<p style="color:red; background:pink; box-shadow: 0 2px 4px rgba(0,0,0,.5)">
  This is still a work in progress...
</p>

----

# tolo-fast-sprite

WebGL is fast executing orders, but sending it an order is time consumming.
That's why you'd better give it a lot of work at once.

That's the purpose of this library: painting a lot of sprites at once.

Here is a basic example:

``` js
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

## API
### `new ToloFastSprite( options )`

* __gl__ (mandatory): the [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) on which to paint.
* __atlas__ (mandatory): an image, or canvas, or video in which you have all the sprites you want to use.

### `clear()`

Remove all the sprites.

### `add( x1, y1, z1, u1, v1, ..., x4, y4, z4, u4, v4, [a1, ..., a4, b1, ..., b4, c1, ..., c4] )`

This is the most generic function of this library.

### `updateXYZ( ptr, x1, y1, z1, ..., x4, y4, z4 )`

### `updateUV( ptr, u1, v1, ..., u4, v4 )`

### `remove( prt )`

### `paint( time )`

### `setAtlas( img )`

__Warning!__ This is a time consuming function.
