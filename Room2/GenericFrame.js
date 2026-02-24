// this is a generic class, like an abstract class in java, or maybe like a factory? but basically it lets us make 7 frame objects using the same class
// we just pass in the sprite paths, and adjust sizes from this class bc they all the same 

class GenericFrame {
    constructor(game, x, y, spritePath, width = 10, height = 10, depthOverride = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.depthOverride = depthOverride;
        
        // Load spriteswd
        this.sprite = ASSET_MANAGER.getAsset(spritePath);
        
        // State
        this.hasBeenViewed = false; // Track if player has looked at it (optional)
        this.isSolid = false;
        this.removeFromWorld = false;
    }
    
    update() {

    if (
        this.isNearLily() &&
        this.game.E &&
        !this.game.examining &&
        !this.game.sceneManager.dialogueBox.active // prevent retrigger during dialogue
    ) {
        this.openZoomView();
    }
}
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 100;
    }
    
    openZoomView() {

    this.hasBeenViewed = true;

    this.game.examining = true;
    this.game.E = false;

    // First description dialogue
    this.game.sceneManager.dialogueBox.openLine(
        "It looks like an expensive painting...",
        null,
        "Lily",
        () => {

            // After first dialogue closes, show interaction choice
            this.game.sceneManager.dialogueBox.openChoice(
                "Interact with it?",
                [
                    {
    label: "Yes",
    onSelect: () => {

        // Reduce HP
        this.game.sceneManager.takeDamage();

        this.game.addEntity(new FrameZoomView(this.game, this));
        this.game.examining = true;
    }
},
                    {
                        label: "No",
                        onSelect: () => {
                            this.game.examining = false;
                        }
                    }
                ],
                "Prompt"
            );

        }
    );
}
    
    draw(ctx) {
        // Draw the frame sprite
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = "#8B7355";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText("Frame", this.x + 10, this.y + this.height/2);
        }
        
        // Show interaction prompt
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2 + 80;
            let textY = this.y - 20;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }

    // needs to override the depth of the invis wall stuff so its always infront of it
    get depth() {
        return this.depthOverride !== null ? this.depthOverride : this.y + this.height;
    }
}