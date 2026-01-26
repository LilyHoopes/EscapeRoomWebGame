//this is a generic slass for decorative objects that don't have interaction
//make an instance of this class in the loadRoom method to specify location, image and size for an object

class DecorativeSprite {
    constructor(game, x, y, imagePath, width, height, isSolid = true, bbOffset = {x: 0, y: 0, w: 0, h: 0}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.sprite = ASSET_MANAGER.getAsset(imagePath);
        this.width = width;
        this.height = height;
        this.isSolid = isSolid; //true = has bounds, false = no bounds(no collision)
        this.bbOffset = bbOffset; //use this to adjust BB of each sprite

        this.updateBB();
    }
    
    update() {
        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(this.x + this.bbOffset.x, this.y + this.bbOffset.y, this.width - this.bbOffset.w, this.height - this.bbOffset.h);
    }
    
    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);


        //debug hitbox stuff
        if (this.game.debug) {
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.BB.x,this.BB.y, this.BB.width,this.BB.height);
        }
    }
}