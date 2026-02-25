class Lily {
    constructor(game, x, y) { // Add x, y parameters
        this.game = game;
        this.x = x;
        this.y = y;
        this.scale = .2; // Add scale property (40% of original size)
        this.width = 100; // Add hitbox size
        this.height = 125;
        this.speed = 500;
        //this.velocity = { x: 0, y: 0 };
        
        const sheet = ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet2_0.png");

        this.animations = {
            idleDown:  new Animator(sheet, 0, 60,   803, 928, 2, 0.6),  // row 1: idle down
            walkDown:  new Animator(sheet, 0, 928,  803, 800, 4, 0.15), // row 2: walk down
            walkLeft:  new Animator(sheet, 0, 1760, 830, 744, 4, 0.15), // row 3: walk left
            walkRight: new Animator(sheet, 0, 2525, 830, 744, 4, 0.15), // row 4: walk right
            walkUp:    new Animator(sheet, 0, 3270, 830, 800, 4, 0.15), // row 5: walk up
            idleUp:    new Animator(sheet, 0, 4200, 830, 744, 2, 0.6),  // row 6: idle up
            idleLeft:  new Animator(sheet, 0, 5080, 830, 744, 2, 0.6),  // row 7: idle left
            idleRight: new Animator(sheet, 0, 5910, 830, 744, 2, 0.6),  // row 8: idle right
        };
        
        // Track current state
        this.currentAnimation = this.animations.idleDown;
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

         // Stop movement when dialogue or zoom is active
        const sm = this.game.sceneManager;
        if (this.game.examining || (sm && sm.dialogueBox && sm.dialogueBox.active)) {
        this.currentAnimation = this.animations.idleDown;
        return;
    }

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
            switch (this.facing) {
                case "up":    this.currentAnimation = this.animations.idleUp;    break;
                case "left":  this.currentAnimation = this.animations.idleLeft;  break;
                case "right": this.currentAnimation = this.animations.idleRight; break;
                default:      this.currentAnimation = this.animations.idleDown;      break; 
            }
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
        //this.x = Math.max(-50, Math.min(this.x, 1350 - this.width));
        //this.y = Math.max(100, Math.min(this.y, 850 - this.height));
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