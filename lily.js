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
            ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 0, 0, 768, 744, 4, 0.5
            // x start position of image, y start position of image, width, height, frame count, frame duration
            // DO NOT CHANGE 768 AND 744 NUMBERS
        );
    }

    update() {
        // Handle movement based on keys
        if (this.game.left) this.x -= this.speed * this.game.clockTick;
        if (this.game.right) this.x += this.speed * this.game.clockTick;
        if (this.game.up) this.y -= this.speed * this.game.clockTick;
        if (this.game.down) this.y += this.speed * this.game.clockTick;

        console.log("Lily position:", this.x, this.y); // Debug line

    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    // // DEBUG: Draw a bright rectangle where Lily should be
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // // DEBUG: Draw Lily's position as text
    // ctx.fillStyle = "yellow";
    // ctx.font = "20px Arial";
    // ctx.fillText(`Lily: ${Math.floor(this.x)}, ${Math.floor(this.y)}`, this.x, this.y - 10);

    }
}