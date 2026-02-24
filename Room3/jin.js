class Jin {
    constructor(game, x, y, isSolid) {
        this.game = game;
        this.scale = 0.45;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Room3/Alive_JinSpriteSheet.png"), 
            186, 134,      // xStart, yStart (bottom row)
            400, 340,     // width, height of each frame
            2, 0.6      // 2 frames, 0.6 seconds per frame
        );
        
        this.x = x || 50;
        this.y = y || 400;
        this.width = 338 * this.scale;
        this.height = 319 * this.scale;


        this.bbOffset = {//jin bb offset
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
        // jin just stands in place breathing
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
    static getDialogue(stage) {

    if (stage === 0) {
        return [
            "Hello, it is good to see another survivor.",
            "Stay calm, the room is designed to confuse you.",
            "Look for patterns, not objects."
        ];
    }

    if (stage === 1) {
        return [
            "!!!",
            "Yes, we do! Here, I found a codex with the same colors as the candles.",
            "There’s a riddle on it, but we weren’t quick enough to solve it before the killer came.",
            "Hurry, take it!",
            "*Lily obtained a codex for the colored candles*",
            "Hm, let me see if I can solve it…"
        ];
    }

    if (stage === 2) {
        return [
            "I gotta get out of here soon."
        ];
    }

    return [
        "You’re doing great. Don’t stop now."
    ];
}
}