class Shiannel {
    constructor(game, x, y, isSolid, pose = "idle") {
        this.game = game;
        this.x = x || 50;
        this.y = y || 400;
        this.scale = 0.45;
        this.isSolid = isSolid;
        this.pose = pose;
        this.removeFromWorld = false;

        const sheet = ASSET_MANAGER.getAsset("./Sprites/Room2/Shiannel_SpriteSheet.png");

        // TOP ROW = IDLE
        this.idleAnimator = new Animator(
            sheet,
            100, 46,          // start at top-left
            342, 299,      // frame size
            2, 0.5        
        );

        // BOTTOM ROW = CROUCH
        this.crouchAnimator = new Animator(
            sheet,
            95, 438,        // bottom half
            337, 269,
            2, 0.5
        );

        this.width = 416 * this.scale;
        this.height = 416 * this.scale;

        this.bbOffset = {
            x: 40,
            y: 40,
            w: 80,
            h: 80
        };

        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );
    }

    update() {
        this.BB.x = this.x + this.bbOffset.x;
        this.BB.y = this.y + this.bbOffset.y;
    }

    get depth() {
        return this.BB.bottom;
    }

    draw(ctx) {
        let animator = (this.pose === "crouch")
            ? this.crouchAnimator
            : this.idleAnimator;

        animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}
