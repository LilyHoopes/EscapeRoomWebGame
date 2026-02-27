class PushableBookshelf {
    constructor(game, x, y) {
        this.game = game;

        this.x = x;
        this.y = y;
        this.width = 220;
        this.height = 240;

        this.nudgeDistance = 80;
        this.slideSpeed = 120;
        this.maxNudges = 3;
        this.nudgeCount = 0;

        // Target x position the shelf is currently sliding toward
        // null means shelf is at rest
        this.targetX = null;

        this.isSliding = false;
        this.isBlocked = false; // it is at final position?

        this.killerSpawned = false;
        this.killerSpawnDelay = 2.0;
        this.killerSpawnTimer = 0;

        this.isSolid = true;
        this.removeFromWorld = false;

        this.sprite = ASSET_MANAGER.getAsset("./Sprites/FillerFurniture/BackOfBookshelf.png");

        this.bbOffset = { x: 0, y: 0, w: 0, h: 40 };
        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );
    }

    get depth() {
        return this.BB.bottom;
    }

    isLilyOnRightSide() {
        const lily = this.game.sceneManager.lily;
        if (!lily || !lily.BB) return false;

        // Lily's center
        const lilyCX = lily.BB.x + lily.BB.width / 2;
        const lilyCY = lily.BB.y + lily.BB.height / 2;

        // Shelf right edge + small trigger zone (80px to the right)
        const triggerLeft = this.x + this.width;
        const triggerRight = this.x + this.width + 80;
        const triggerTop = this.y;
        const triggerBot = this.y + this.height;

        return (
            lilyCX >= triggerLeft && lilyCX <= triggerRight &&
            lilyCY >= triggerTop && lilyCY <= triggerBot
        );
    }

    update() {
        // Sliding logic
        if (this.isSliding && this.targetX !== null) {
            const step = this.slideSpeed * this.game.clockTick;
            const dist = this.targetX - this.x;

            if (Math.abs(dist) <= step) {
                // Snap to target, sliding done
                this.x = this.targetX;
                this.targetX = null;
                this.isSliding = false;

                // If this was the final nudge, mark as blocked and notify SceneManager
                if (this.nudgeCount >= this.maxNudges) {
                    this.isBlocked = true;

                    // Tell SceneManager the bookshelf finished closing/moving
                    if (
                        this.game.sceneManager &&
                        this.game.sceneManager.puzzleStates &&
                        this.game.sceneManager.puzzleStates.room5
                    ) {
                        this.game.sceneManager.puzzleStates.room5.bookshelfClosed = true;
                    }
                }
            } else {
                // Keep sliding left (targetX is smaller than current x)
                this.x -= step;
            }

            this.updateBB();
            return; // Don't allow input while sliding
        }

        // Killer spawn timer
        if (!this.killerSpawned) {
            this.killerSpawnTimer += this.game.clockTick;
            if (this.killerSpawnTimer >= this.killerSpawnDelay) {
                this.spawnKiller();
            }
        }

        // Interaction: push shelf
        if (
            !this.isBlocked &&
            !this.isSliding &&
            this.isLilyOnRightSide() &&
            this.game.E &&
            !this.game.examining
        ) {
            this.nudge();
            this.game.E = false; // consume the key press
        }
    }

    nudge() {
        if (this.nudgeCount >= this.maxNudges) return;

        this.nudgeCount++;
        this.targetX = this.x - this.nudgeDistance;
        this.isSliding = true;
    }

    spawnKiller() {
        this.killerSpawned = true;
        const killer = new Killer(this.game, 200, 650, this.game.sceneManager.lily);
        killer.isRoom5Killer = true;
        this.game.addEntity(killer);
    }

    draw(ctx) {
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }

        // "Press E to push" prompt
        if (this.isLilyOnRightSide() && !this.isBlocked && !this.isSliding && !this.game.examining) {
            const text = this.nudgeCount === 0
                ? "Press E to push"
                : `Press E to push (${this.nudgeCount}/${this.maxNudges})`;

            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";

            const textX = this.x + this.width / 2 - ctx.measureText(text).width / 2;
            const textY = this.y - 10;

            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}