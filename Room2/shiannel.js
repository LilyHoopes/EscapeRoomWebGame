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
            100, 39,          // start at top-left
            350, 320,      // frame size
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

        // Dialogue data lives with the NPC, SceneManager decides when to play it.
    static getDialogue(stage) {
        // stage 0: first conversation
        if (stage === 0) {
            return [
            { speaker: "Shiannel", text: ". . ." },

            { speaker: "Lily", text: "Hello? Are you okay?" },

            // Narration line
            { speaker: "", text: "*Shiannel stands up*" },

            { speaker: "Shiannel", text: "Another survivor! Thank g-goodness, I have been stuck in this room for so long! It’s f-freezing!" },

            { speaker: "Lily", text: "It's good im not alone!" },

            { speaker: "Shiannel", text: "Yes! But, we have a problem, T-the exit door has a lock and it’s frozen s-solid! I tried to break it with my h-hands but it wont budge!" },

            { speaker: "Lily", text: "I guess we need something harder to hit it with then" },

            { speaker: "Shiannel", text: "!!" },

            { speaker: "Shiannel", text: "The k-killer! He hides a weapon here within this room. But he a-always makes me close my eyes before he puts it away. I havent been able to f-find it yet, I can’t move as fast anymore, the cold is getting to me. It’s so… c-cold!" },

            { speaker: "Lily", text: "You just stay there, i’ll start looking. But where should I even begin? I don’t want to waste time." },

            { speaker: "Shiannel", text: "I’m not sure, b-but whenever he’s home, he always play’s c-classical music. It’s c-creepy!" },

            { speaker: "Lily", text: "Hm…" }
        ];
    }

        // stage 1: after first convo, before door opens
        if (stage === 1) {
            return [
                { speaker: "Shiannel", text: "It's so cold here." }
            ];
        }

        // stage 2: after door opens
        return [
            { speaker: "Shiannel", text: "Yes! You did it! Keep going, i’ll keep watch in case he comes back!" }
        ];
    }

    
}
