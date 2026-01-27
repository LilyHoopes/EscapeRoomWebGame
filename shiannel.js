class Shiannel {
    constructor(game, x, y, isSolid) {
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
        this.width = 338 * this.scale;
        this.height = 319 * this.scale;


        this.bbOffset = {//cocoshiannel bb offset
            x: 30,       
            y: 20,     
            w: 40,       
            h: 40     
        };

        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );



        this.isSolid = isSolid;
        this.removeFromWorld = false;
    }

    update() {
        // Shiannel just stands in place breathing
        this.BB.x = this.x + this.bbOffset.x;
        this.BB.y = this.y + this.bbOffset.y;
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}