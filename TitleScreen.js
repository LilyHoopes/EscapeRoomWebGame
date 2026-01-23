class TitleScreen {
    constructor(game) {
        this.game = game;

        // assets
        this.bgPath = "./Sprites/TitleScreen.png";
        this.lightningSheetPath = "./Sprites/LightningSheet.png";

        // background crop region
        this.cropX = 35; this.cropY = 277; this.cropW = 939; this.cropH = 588;

        // lightning sprite sheet
        this.lightningCols = 8;
        this.lightningRows = 4;
        this.lightningCellW = 256;
        this.lightningCellH = 307;

        // lightning timing / state
        this.lightningPhase = "idle";
        this.lightningPhaseTime = 0;
        this.lightningAlpha = 0;

        this.nextLightning = this.randRange(2.8, 3.2);
        this.nextLightningAfter = () => this.randRange(6.0, 9.0);

        // frame sequence
        this.lightningSequence = [0, 2, 4, 6, 8, 6, 4, 2, 0];
        this.lightningFps = 14;

        // START button
        this.button = { width: 340, height: 92, x: 0, y: 0 };

        // try to keep BGM playing
        if (this.game.introAudio && this.game.introAudio.paused) {
            this.game.introAudio.play().catch(() => {});
        }
    }

    update() {
        this.updateLightning();
        this.recomputeButton();

        // start with Enter key
        if (this.game.keys && this.game.keys["Enter"]) {
            this.game.keys["Enter"] = false;
            this.startGame();
            return;
        }

        // start with mouse click
        if (this.game.click) {
            const { x, y } = this.game.click;
            this.game.click = null;

            if (this.game.introAudio && this.game.introAudio.paused) {
                this.game.introAudio.play().catch(() => {});
            }

            if (this.isInsideButton(x, y)) {
                this.startGame();
            }
        }
    }

    updateLightning() {
        this.nextLightning -= this.game.clockTick;

        if (this.lightningPhase === "idle" && this.nextLightning <= 0) {
            this.lightningPhase = "flash";
            this.lightningPhaseTime = 0;
            this.lightningAlpha = 1;
        }

        if (this.lightningPhase !== "idle") {
            this.lightningPhaseTime += this.game.clockTick;

            const total = this.lightningSequence.length / this.lightningFps;
            const t = Math.min(1, this.lightningPhaseTime / total);

            // fade from strong to weak
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
        const cw = ctx.canvas.width, ch = ctx.canvas.height;

        // black background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        // render cropped background image
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

        // lightning effect
        this.drawLightningSprite(ctx);

        // button
        const hovering =
            this.game.mouse &&
            this.isInsideButton(this.game.mouse.x, this.game.mouse.y);

        this.drawStartButton(
            ctx,
            this.button.x,
            this.button.y,
            this.button.width,
            this.button.height,
            hovering
        );
    }

    drawLightningSprite(ctx) {
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

        const baseSX = col * this.lightningCellW;
        const baseSY = row * this.lightningCellH;

        // crop deeper into the frame to remove square borders
        const pad = 8; // usually between 6 and 10
        const ssx = baseSX + pad;
        const ssy = baseSY + pad;
        const sw = this.lightningCellW - pad * 2;
        const sh = this.lightningCellH - pad * 2;

        const cw = ctx.canvas.width, ch = ctx.canvas.height;
        const r = this.bgRect || { x: 0, y: 0, w: cw, h: ch };

        // left-side area, stretched vertically
        const leftAreaW = Math.floor(r.w * 0.48);
        const drawW = Math.floor(leftAreaW * 1.05);
        const drawH = Math.floor(r.h * 1.25);
        const dx = Math.floor(r.x - r.w * 0.12);
        const dy = Math.floor(r.y - r.h * 0.12);

        // soft mask to fade out rectangle edges
        // draw lightning on an offscreen canvas, then apply a gradient mask
        if (!this._boltCanvas) {
            this._boltCanvas = document.createElement("canvas");
            this._boltCtx = this._boltCanvas.getContext("2d");
        }
        const oc = this._boltCanvas;
        const octx = this._boltCtx;

        // offscreen size matches lightning draw size
        if (oc.width !== drawW || oc.height !== drawH) {
            oc.width = drawW;
            oc.height = drawH;
        }

        // draw lightning on offscreen canvas
        octx.clearRect(0, 0, drawW, drawH);
        octx.imageSmoothingEnabled = false;
        octx.globalCompositeOperation = "source-over";
        octx.globalAlpha = 1;
        octx.drawImage(sheet, ssx, ssy, sw, sh, 0, 0, drawW, drawH);

        // horizontal gradient mask
        octx.globalCompositeOperation = "destination-in";
        const g = octx.createLinearGradient(0, 0, drawW, 0);
        g.addColorStop(0.00, "rgba(0,0,0,0.00)");
        g.addColorStop(0.12, "rgba(0,0,0,1.00)");
        g.addColorStop(0.88, "rgba(0,0,0,1.00)");
        g.addColorStop(1.00, "rgba(0,0,0,0.00)");
        octx.fillStyle = g;
        octx.fillRect(0, 0, drawW, drawH);

        // vertical gradient mask
        const g2 = octx.createLinearGradient(0, 0, 0, drawH);
        g2.addColorStop(0.00, "rgba(0,0,0,0.00)");
        g2.addColorStop(0.10, "rgba(0,0,0,1.00)");
        g2.addColorStop(0.90, "rgba(0,0,0,1.00)");
        g2.addColorStop(1.00, "rgba(0,0,0,0.00)");
        octx.fillStyle = g2;
        octx.fillRect(0, 0, drawW, drawH);

        // composite onto main canvas
        ctx.save();

        // clip to background area
        ctx.beginPath();
        ctx.rect(r.x, r.y, r.w, r.h);
        ctx.clip();

        ctx.globalCompositeOperation = "screen";
        ctx.imageSmoothingEnabled = false;

        // main lightning
        ctx.globalAlpha = this.lightningAlpha * 0.18;
        ctx.drawImage(oc, dx, dy);

        // afterglow
        ctx.globalAlpha = this.lightningAlpha * 0.08;
        ctx.drawImage(oc, dx + 10, dy + 6);

        ctx.restore();

        // flash only on the left side
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = this.lightningAlpha * 0.06;
        ctx.fillStyle = "#fff";
        ctx.fillRect(r.x, r.y, Math.floor(r.w * 0.55), r.h);
        ctx.restore();
    }

    drawStartButton(ctx, x, y, w, h, hovering) {
        ctx.save();

        ctx.globalAlpha = 1;
        ctx.fillStyle = hovering ? "rgba(200, 0, 0, 0.85)" : "rgba(120, 0, 0, 0.75)";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("START GAME", x + w / 2, y + h / 2);

        ctx.restore();
    }

    startGame() {
        // stop intro BGM
        if (this.game.introAudio) {
            this.game.introAudio.pause();
            this.game.introAudio.currentTime = 0;
        }

        // enter Room1
        if (this.game.sceneManager && typeof this.game.sceneManager.loadRoom === "function") {
            this.game.sceneManager.loadRoom("room1", 200, 200);
        }
    }

    recomputeButton() {
        const cw = this.game.ctx.canvas.width, ch = this.game.ctx.canvas.height;
        const r = this.bgRect || { x: 0, y: 0, w: cw, h: ch };

        this.button.x = Math.floor(r.x + (r.w - this.button.width) / 2);
        this.button.y = Math.floor(r.y + r.h * 0.78);
    }

    isInsideButton(x, y) {
        return (
            x >= this.button.x &&
            x <= this.button.x + this.button.width &&
            y >= this.button.y &&
            y <= this.button.y + this.button.height
        );
    }

    randRange(min, max) {
        return min + Math.random() * (max - min);
    }
}
