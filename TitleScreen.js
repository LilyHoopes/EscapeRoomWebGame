class TitleScreen {
    constructor(game) {
        this.game = game;

        // ===== ASSETS =====
        this.bgPath = "./Sprites/Start/TitleScreen.png";
        this.lightningSheetPath = "./Sprites/Start/LightningSheet.png";

        // Menu sign assets
        this.startSignPath = "./Sprites/Start/StartSign.png";
        this.controlsSignPath = "./Sprites/Start/ControlsSign.png";
        this.selectorSignPath = "./Sprites/Start/SelectorSign.png";

        // Menu layout (bottom-left area)
        this.menuX = 70;
        this.menuY = 520;
        this.menuSpacing = 75;

        // Menu state
        // 0 = Start, 1 = Controls
        this.selectedIndex = 0;

        // Prevent rapid key repeat
        this.menuCooldown = 0;

        // Controls overlay flag
        this.showControls = false;

        // Visible crop region inside TitleScreen.png
        this.cropX = 35;
        this.cropY = 277;
        this.cropW = 939;
        this.cropH = 588;

        // Lightning sprite sheet layout
        this.lightningCols = 8;
        this.lightningRows = 4;
        this.lightningCellW = 256;
        this.lightningCellH = 307;

        // Lightning state
        this.lightningPhase = "idle";
        this.lightningPhaseTime = 0;
        this.lightningAlpha = 0;

        // Lightning timing
        this.nextLightning = this.randRange(2.2, 2.8);
        this.nextLightningAfter = () => this.randRange(6.0, 9.0);

        // Lightning animation sequence
        this.lightningSequence = [0, 2, 4, 6, 8, 6, 4, 2, 0];
        this.lightningFps = 14;

        // Cached background draw rectangle
        this.bgRect = null;

        // Keep intro BGM playing if possible
        if (this.game.introAudio && this.game.introAudio.paused) {
            this.game.introAudio.play().catch(() => {});
        }
    }

    update() {
        this.updateLightning();

        // Handle cooldown timer
        if (this.menuCooldown > 0) this.menuCooldown--;

        // If controls screen is open, Enter closes it
        if (this.showControls) {
            if (this.game.keys && this.game.keys["Enter"] && this.menuCooldown === 0) {
                this.game.keys["Enter"] = false;
                this.showControls = false;
                this.menuCooldown = 12;
            }
            return;
        }

        // Menu navigation (ArrowUp/ArrowDown + Enter)
        if (this.game.keys && this.menuCooldown === 0) {
            if (this.game.keys["ArrowDown"]) {
                this.game.keys["ArrowDown"] = false;
                this.selectedIndex = Math.min(1, this.selectedIndex + 1);
                this.menuCooldown = 10;
            } else if (this.game.keys["ArrowUp"]) {
                this.game.keys["ArrowUp"] = false;
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.menuCooldown = 10;
            } else if (this.game.keys["Enter"]) {
                this.game.keys["Enter"] = false;

                if (this.selectedIndex === 0) {
                    this.startGame();
                } else {
                    this.showControls = true;
                }

                this.menuCooldown = 12;
            }
        }
    }

    updateLightning() {
        this.nextLightning -= this.game.clockTick;

        // Trigger lightning flash
        if (this.lightningPhase === "idle" && this.nextLightning <= 0) {
            this.lightningPhase = "flash";
            this.lightningPhaseTime = 0;
            this.lightningAlpha = 1;
        }

        // Animate lightning fade-out
        if (this.lightningPhase !== "idle") {
            this.lightningPhaseTime += this.game.clockTick;
            const total = this.lightningSequence.length / this.lightningFps;
            const t = Math.min(1, this.lightningPhaseTime / total);
            this.lightningAlpha = (1 - t) * 0.85 + 0.15;

            if (this.lightningPhaseTime >= total) {
                this.lightningPhase = "idle";
                this.lightningPhaseTime = 0;
                this.lightningAlpha = 0;
                this.nextLightning = this.nextLightningAfter();
            }
        }
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // Clear screen
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        // Draw background title image
        const bg = ASSET_MANAGER.getAsset(this.bgPath);
        if (bg) {
            const scale = Math.max(cw / this.cropW, ch / this.cropH);
            const dw = Math.ceil(this.cropW * scale);
            const dh = Math.ceil(this.cropH * scale);
            const dx = Math.floor((cw - dw) / 2);
            const dy = Math.floor((ch - dh) / 2);

            this.bgRect = { x: dx, y: dy, w: dw, h: dh };

            ctx.drawImage(
                bg,
                this.cropX, this.cropY, this.cropW, this.cropH,
                dx, dy, dw, dh
            );
        } else {
            this.bgRect = { x: 0, y: 0, w: cw, h: ch };
        }

        // Draw lightning overlay
        this.drawLightning(ctx);

        // Draw menu signs
        const startSign = ASSET_MANAGER.getAsset(this.startSignPath);
        const controlsSign = ASSET_MANAGER.getAsset(this.controlsSignPath);
        const selectorSign = ASSET_MANAGER.getAsset(this.selectorSignPath);

        if (startSign) ctx.drawImage(startSign, this.menuX, this.menuY);
        if (controlsSign) ctx.drawImage(controlsSign, this.menuX, this.menuY + this.menuSpacing);

        // Draw selector right next to the menu text (stable pixel offset)
        if (selectorSign) {
            const gap = 10; // space between selector and the sign
            const selectorX = this.menuX - 22 - gap; // move it close to the sign

            const selectedSign = (this.selectedIndex === 0) ? startSign : controlsSign;

    let selY = this.menuY + this.menuSpacing * this.selectedIndex; // fallback
    if (selectedSign) {
        selY += Math.floor((selectedSign.height - selectorSign.height) / 2);
    }

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(selectorSign, selectorX, selY);
    ctx.restore();
}

        // Controls overlay
        if (this.showControls) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, cw, ch);
            ctx.restore();

            ctx.fillStyle = "#fff";
            ctx.font = "28px Arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Controls", 80, 120);

            ctx.font = "20px Arial";
            ctx.fillText("WASD: Move selector", 80, 170);
            ctx.fillText("E: Interact", 80, 205);
            ctx.fillText("I: Inventory", 80, 240);
        }
    }

    drawLightning(ctx) {
        if (this.lightningPhase === "idle") return;

        const sheet = ASSET_MANAGER.getAsset(this.lightningSheetPath);
        if (!sheet) return;

        const idx = Math.min(
            this.lightningSequence.length - 1,
            Math.floor(this.lightningPhaseTime * this.lightningFps)
        );
        const frame = this.lightningSequence[idx];

        const col = frame % this.lightningCols;
        const row = Math.floor(frame / this.lightningCols);

        const sx = col * this.lightningCellW;
        const sy = row * this.lightningCellH;

        const r = this.bgRect;
        const drawW = Math.floor(r.w * 0.5);
        const drawH = Math.floor(r.h * 1.25);
        const dx = Math.floor(r.x - r.w * 0.1);
        const dy = Math.floor(r.y - r.h * 0.1);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = this.lightningAlpha * 0.2;
        ctx.drawImage(
            sheet,
            sx, sy, this.lightningCellW, this.lightningCellH,
            dx, dy, drawW, drawH
        );
        ctx.restore();
    }

    startGame() {
        if (this.game.introAudio) {
            this.game.introAudio.pause();
            this.game.introAudio.currentTime = 0;
        }
        this.game.sceneManager.loadRoom("room1", 200, 200);
    }

    randRange(min, max) {
        return min + Math.random() * (max - min);
    }
}
