class RosePainting {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;         // world position
        this.y = y;
        this.width = 135;   // sprite width
        this.height = 135;  // sprite height
        this.depth = 150;

        this.keyTaken = this.game.sceneManager.puzzleStates.room1.hasKey;
        this.isSolid = false; // Not a collision object

        // Load sprites
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingWithKey.png");
        this.spriteNoKey = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingNoKey.png");
        this.removeFromWorld = false;

        // ===== ADDED: Zoom + Dialogue gating state =====
        // We want:
        // Press E -> open PaintingZoomView AND show dialogue on top,
        // then only allow examine inside the zoom after dialogue closes.
        this.zoomDialogueLockActive = false;
        this.zoomRef = null;
    }

    update() {
        const sm = this.game.sceneManager;

        // ===== ADDED: While dialogue is active for this zoom, manage it here =====
        // This makes the behavior reliable even if SceneManager has other E logic.
        if (this.zoomDialogueLockActive) {
            // Handle E to skip typing or close dialogue
            if (this.game.E) {
                if (sm.dialogueBox && sm.dialogueBox.active && sm.dialogueBox.isTyping) {
                    sm.dialogueBox.skipTyping();
                } else if (sm.dialogueBox && sm.dialogueBox.active) {
                    sm.dialogueBox.close();
                }
                this.game.E = false; // consume input
            }

            // If dialogue closed, unlock zoom interactions
            if (!sm.dialogueBox || !sm.dialogueBox.active) {
                if (this.zoomRef) {
                    // These flags must be respected in PaintingZoomView (recommended)
                    this.zoomRef.locked = false;
                    this.zoomRef.unlockWhenDialogueEnds = false;
                }

                this.zoomDialogueLockActive = false;
                this.zoomRef = null;

                // Still examining because zoom view is open
                // Zoom view should set examining to false when it closes
                this.game.examining = true;
            }

            return;
        }

        // Normal interaction: only when player is near and not already examining
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
    }

    isNearLily() {
        const lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;

        const distance = Math.sqrt(
            Math.pow((this.x + this.width / 2) - (lily.BB.x + lily.BB.width / 2), 2) +
            Math.pow((this.y + this.height / 2) - (lily.BB.y + lily.BB.height / 2), 2)
        );

        return distance < 100;
    }

    openZoomView() {
        const sm = this.game.sceneManager;

        // 1) Create and add the zoom view first (it will cover the screen)
        const zoom = new PaintingZoomView(this.game, this);

        // Lock zoom interactions until the dialogue finishes
        zoom.locked = true;
        zoom.unlockWhenDialogueEnds = true;

        this.zoomRef = zoom;
        this.zoomDialogueLockActive = true;

        this.game.addEntity(zoom);

        // 2) Open the dialogue immediately
        if (sm.dialogueBox) {
            sm.dialogueBox.open(
                "Looks like a beautiful painting of a fallen rose… but it looks like there is something stuck against it.",
                null,
                "Lily"
            );

            // 3) IMPORTANT: Bring dialogueBox to the front (top layer)
            // Most engines draw entities in array order, last drawn is on top.
            // We move dialogueBox to the end of the entities list.
            const idx = this.game.entities.indexOf(sm.dialogueBox);
            if (idx !== -1) {
                this.game.entities.splice(idx, 1);
                this.game.entities.push(sm.dialogueBox);
            } else {
                // If dialogueBox was not in entities for some reason, add it now
                this.game.addEntity(sm.dialogueBox);
            }
        }

        // 4) Set examining mode and consume E so it does not instantly skip dialogue
        this.game.examining = true;
        this.game.E = false;
    }

    // Called by PaintingZoomView when key is taken
    onKeyTaken() {
        this.keyTaken = true;
        this.game.sceneManager.puzzleStates.room1.hasKey = true;
    }

    draw(ctx) {
        // Use sprite without key if already taken
        const sprite = this.keyTaken ? this.spriteNoKey : this.sprite;

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if sprite is not loaded
            ctx.fillStyle = this.keyTaken ? "#6b345f" : "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Show interaction prompt only when not examining
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";

            const text = "Press E to Examine";
            const textX = this.x + this.width / 2 - ctx.measureText(text).width / 2 - 13;
            const textY = this.y + 178;

            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}