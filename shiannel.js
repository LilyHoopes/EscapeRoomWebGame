class Shiannel {
    constructor(game, x, y) {
        this.game = game;
        this.scale = 0.45;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Room2/Shiannel_SpriteSheet.png"), 
            63, 433,      // xStart, yStart (bottom row)
            338, 319,     // width, height of each frame
            2, 0.5      // 2 frames, 0.5 seconds per frame
        );
        
        this.x = x || 50;
        this.y = y || 400;
        
        this.removeFromWorld = false;
    }

    update() {
        // Shiannel just stands in place breathing
        // No movement needed
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }
}