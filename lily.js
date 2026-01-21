class Lily {
    constructor(game, x, y) { // Add x, y parameters
        this.game = game;
        this.x = x || 50; // Default to 50 if not provided
        this.y = y || 400; // Default to 400 if not provided
        this.scale = .2; // Add scale property (40% of original size)
        this.width = 230 * this.scale; // Add hitbox size
        this.height = 225 * this.scale;
        this.speed = 90;
        this.velocity = { x: 0, y: 0 };
        
        this.animator = new Animator(
            // these values are for 's' movement moving down 
            ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 0, 0, 768, 744, 4, 0.5
            // x start position of image, y start position of image, width, height, frame count, frame duration
            // DO NOT CHANGE 768 AND 744 NUMBERS
        );

        // make an animator for each direction
        this.animations = {
            idle: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 0,      // x, y position in spritesheet
                230, 225,  // frame width, height
                4, 0.5     // frame count, duration
            ),
            walkDown: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 225,    // Second row (y = 225)
                230, 225, 
                4, 0.15    // Faster animation for walking
            ),
            walkUp: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 450,    // Third row (y = 450)
                230, 225, 
                4, 0.15
            ),
            walkLeft: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 675,    // Fourth row (y = 675)
                230, 225, 
                4, 0.15
            ),
            walkRight: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 900,    // Fifth row (y = 900)
                230, 225, 
                4, 0.15
            )
        };
        
        // Track current state
        this.currentAnimation = this.animations.idle;
        this.facing = "down"; // Track which way Lily is facing
    }

    update() {
        let moving = false;
        
        // Handle movement and set appropriate animation
        if (this.game.left) {
            this.x -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkLeft;
            this.facing = "left";
            moving = true;
        }
        if (this.game.right) {
            this.x += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkRight;
            this.facing = "right";
            moving = true;
        }
        if (this.game.up) {
            this.y -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkUp;
            this.facing = "up";
            moving = true;
        }
        if (this.game.down) {
            this.y += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkDown;
            this.facing = "down";
            moving = true;
        }
        
        // If not moving, use idle animation
        if (!moving) {
            this.currentAnimation = this.animations.idle;
        }
    }

    draw(ctx) {
        // Draw the current animation
        this.currentAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        
        // Debug rectangle
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
