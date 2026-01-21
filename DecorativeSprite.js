//this is a generic slass for decorative objects that don't have interaction
//make an instance of this class in the loadRoom method to specify location, image and size for an object

class DecorativeSprite {
    constructor(game, x, y, imagePath, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.sprite = ASSET_MANAGER.getAsset(imagePath);
        this.width = width;
        this.height = height;
    }
    
    update() {
        // Does nothing - it's just decoration
    }
    
    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}