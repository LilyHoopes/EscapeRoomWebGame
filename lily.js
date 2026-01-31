class Lily {
    constructor(game, x, y) { // Add x, y parameters
        this.game = game;
        this.x = x || 400; // Default to 50 if not provided
        this.y = y || 400; // Default to 400 if not provided
        this.scale = .2; // Add scale property (40% of original size)
        this.width = 100; // Add hitbox size
        this.height = 125;
        this.speed = 500;
        //this.velocity = { x: 0, y: 0 };
        
        // DO NOT CHANGE THESE NUMBERS
        // make an animator for each direction
        this.animations = {
            idle: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 60,      // x, y position in spritesheet
                803, 928,  // frame width, height
                4, 0.6     // frame count, duration
            ),
            walkDown: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 928,    
                803, 830, 
                4, 0.15    
            ),
            walkLeft: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"),  
                0, 1760,   
                830, 744, 
                4, 0.15
            ),
            walkRight: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 2525,    
                830, 744, 
                4, 0.15
            ),
            walkUp: new Animator(
                ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet.png"), 
                0, 3270,    
                803, 744, 
                4, 0.15
            )
        };
        
        // Track current state
        this.currentAnimation = this.animations.idle;
        this.facing = "down"; // Track which way Lily is facing

        //initial bounding box
        this.updateBB();
        this.lastBB = this.BB;
    }

    updateBB() {
        this.offsetX = 55; // shifts to right
        this.offsetY = 80; // shifts down 

        //lilys boundingbox 
        const bbWidth = 80; 
        const bbHeight = 30; 
        this.BB = new BoundingBox( this.x + this.offsetX, this.y + this.offsetY, bbWidth, bbHeight );
    
    }

    updateLastBB() {
        this.lastBB = this.BB;
    }

    update() {
        let dx = 0;
        let dy = 0;
        //console.log("Keys:", this.game.left, this.game.right, this.game.up, this.game.down);

        let moving = false;
        
        // Handle movement and set appropriate animation
        if (this.game.left) {
            dx -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkLeft;
            this.facing = "left";
            moving = true;
            //console.log("Moving left!");

        }
        if (this.game.right) {
            dx += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkRight;
            this.facing = "right";
            moving = true;
            //console.log("Moving right!");
        }
        if (this.game.up) {
            dy -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkUp;
            this.facing = "up";
            moving = true;
            //console.log("Moving up!");            
        }
        if (this.game.down) {
            dy += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkDown;
            this.facing = "down";
            moving = true;
            //console.log("Moving down!");            
        }
        
        // If not moving, use idle animation
        if (!moving) {
            this.currentAnimation = this.animations.idle;
        }

        // X movement 
        this.x += dx;
        this.updateLastBB();
        this.updateBB();
        this.handleHorizontalCollisions();

        // Y movement
        this.y += dy;
        this.updateLastBB();
        this.updateBB();
        this.handleVerticalCollisions();

        //to keep lily detained in room
        this.x = Math.max(-50, Math.min(this.x, 1290 - this.width));
        this.y = Math.max(100, Math.min(this.y, 850 - this.height));
    }

   handleHorizontalCollisions() { 
        for (let entity of this.game.entities) { 
            if (entity !== this && entity.isSolid && entity.BB) { 
                if (this.BB.collide(entity.BB)) { 
                    if (this.lastBB.right <= entity.BB.left) { 
                        // hit from left 
                        this.x = entity.BB.left - this.BB.width - this.offsetX; 
                    } 
                    else if (this.lastBB.left >= entity.BB.right) { 
                        // hit from right 
                        this.x = entity.BB.right - this.offsetX; 
                    } 
                    this.updateBB(); 
                } 
            } 
        } 
    }

    handleVerticalCollisions() {
        // Resolve up/down collisions
        for (let entity of this.game.entities) {
            if (entity !== this && entity.isSolid && entity.BB) {
                if (this.BB.collide(entity.BB)) {
                    if (this.lastBB.bottom <= entity.BB.top) {
                        // Lily hit object from above
                        this.y = entity.BB.top - this.BB.height - this.offsetY;
                    }
                    else if (this.lastBB.top >= entity.BB.bottom) {
                        // Lily hit object from below
                        this.y = entity.BB.bottom - this.offsetY;
                    }
                    this.updateBB();
                }
            }
        }
    }
    get depth() {
        return this.BB.bottom;
    }


    draw(ctx) {
        // Draw the current animation
        this.currentAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        
        // // Debug rectangle
        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}