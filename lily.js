class Lily {
    constructor(game, x, y) { // Add x, y parameters
        this.game = game;
        this.x = x || 50; // Default to 50 if not provided
        this.y = y || 400; // Default to 400 if not provided
        this.width = 230; // Add hitbox size
        this.height = 225;
        this.speed = 90;
        this.velocity = { x: 0, y: 0 };
        
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
            0, 0, 230, 225, 4, 0.5
        );
    }

    update() {
        // Handle movement based on keys
        if (this.game.left) this.x -= this.speed * this.game.clockTick;
        if (this.game.right) this.x += this.speed * this.game.clockTick;
        if (this.game.up) this.y -= this.speed * this.game.clockTick;
        if (this.game.down) this.y += this.speed * this.game.clockTick;
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
}