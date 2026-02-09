//this is a generic class for decorative objects that don't have interaction
//make an instance of this class in the loadRoom method to specify location, image and size for an object

class DecorativeSprite {
    constructor(game, x, y, imagePath, width, height, isSolid = true, bbOffset = {x: 0, y: 0, w: 0, h: 0}, flipHorizontal = false, depthOverride = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.sprite = ASSET_MANAGER.getAsset(imagePath);
        this.width = width;
        this.height = height;
        this.isSolid = isSolid; //true = has bounds, false = no bounds(no collision)
        this.bbOffset = bbOffset; //use this to adjust BB of each sprite
        this.flipHorizontal = flipHorizontal; // Add flip parameter
        this.depthOverride = depthOverride; //depth override (basically if ur stacking sprites on each other)

        this.updateBB();
    }
    
    update() {
        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(this.x + this.bbOffset.x, this.y + this.bbOffset.y, this.width - this.bbOffset.w, this.height - this.bbOffset.h);
    }
    get depth() {
        return this.depthOverride ?? (this.BB ? this.BB.bottom : this.y + this.height);
    }

    
draw(ctx) {
    // ✅ Safety check: Is sprite loaded?
    if (!this.sprite) {
        console.error("❌ DecorativeSprite: sprite is null/undefined!");
        console.error("   Path:", this.spritePath);
        console.error("   Position:", this.x, this.y);
        console.error("   Size:", this.width, this.height);
        
        // Draw magenta placeholder so you can see where it should be
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("MISSING SPRITE", this.x + 5, this.y + 15);
        ctx.fillText(this.spritePath, this.x + 5, this.y + 30);
        return;
    }
    
    // ✅ Check if still loading
    if (!this.sprite.complete) {
        console.warn("⏳ DecorativeSprite still loading:", this.spritePath);
        // Skip drawing this frame - it will draw next frame when loaded
        return;
    }
    
    // ✅ Check if failed to load
    if (this.sprite.naturalWidth === 0 || this.sprite.naturalHeight === 0) {
        console.error("❌ DecorativeSprite: sprite FAILED to load!");
        console.error("   Path:", this.spritePath);
        console.error("   naturalWidth:", this.sprite.naturalWidth);
        console.error("   naturalHeight:", this.sprite.naturalHeight);
        console.error("   Position:", this.x, this.y);
        
        // Draw red placeholder so you can see it failed
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("FAILED TO LOAD", this.x + 5, this.y + 15);
        ctx.fillText(this.spritePath, this.x + 5, this.y + 30);
        return;
    }
    
    // ✅ All checks passed - safe to draw!
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    
    // Debug bounding box (if debug mode is on)
    if (this.game.debug && this.BB) {
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
}
}