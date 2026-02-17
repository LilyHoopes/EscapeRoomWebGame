class Victor {
    constructor(game, x, y, isSolid) {
        this.game = game;
        this.scale = 0.45;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Room3/Alive_VictorSpriteSheet.png"), 
            186, 134,      // xStart, yStart (bottom row)
            383, 340,     // width, height of each frame
            2, 0.6      // 2 frames, 0.6 seconds per frame
        );
        
        this.x = x || 50;
        this.y = y || 400;
        this.width = 338 * this.scale;
        this.height = 319 * this.scale;


        this.bbOffset = {//bictor bb offset
            x: -28,       
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
        // victor just stands in place breathing
        this.BB.x = this.x + this.bbOffset.x;
        this.BB.y = this.y + this.bbOffset.y;
    }
    get depth() {
        return this.BB.bottom;
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}