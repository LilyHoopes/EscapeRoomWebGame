class TitleScreen {
    constructor(game) {
        this.game = game;

        // ===== ASSETS =====
        this.bgPath = "./Sprites/Start/TitleScreen.png";
        this.lightningSheetPath = "./Sprites/Start/LightningSheet.png";

        // TitleScreen.png 안에서 실제 보이는 영역
        this.cropX = 35;
        this.cropY = 277;
        this.cropW = 939;
        this.cropH = 588;

        // 번개 스프라이트 시트
        this.lightningCols = 8;
        this.lightningRows = 4;
        this.lightningCellW = 256;
        this.lightningCellH = 307;

        // 번개 상태
        this.lightningPhase = "idle";
        this.lightningPhaseTime = 0;
        this.lightningAlpha = 0;

        this.nextLightning = this.randRange(2.2, 2.8);
        this.nextLightningAfter = () => this.randRange(6.0, 9.0);

        this.lightningSequence = [0, 2, 4, 6, 8, 6, 4, 2, 0];
        this.lightningFps = 14;

        // START 버튼
        this.button = { width: 340, height: 92, x: 0, y: 0 };

        this.bgRect = null;

        if (this.game.introAudio && this.game.introAudio.paused) {
            this.game.introAudio.play().catch(() => {});
        }
    }

    update() {
        this.updateLightning();
        this.recomputeButton();

        if (this.game.keys && this.game.keys["Enter"]) {
            this.game.keys["Enter"] = false;
            this.startGame();
            return;
        }

        if (this.game.click) {
            const { x, y } = this.game.click;
            this.game.click = null;
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

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

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

        this.drawLightning(ctx);

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

    drawStartButton(ctx, x, y, w, h, hovering) {
        ctx.save();
        ctx.fillStyle = hovering ? "rgba(200,0,0,0.85)" : "rgba(120,0,0,0.75)";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("START GAME", x + w / 2, y + h / 2);
        ctx.restore();
    }

    recomputeButton() {
        const r = this.bgRect || {
            x: 0,
            y: 0,
            w: this.game.ctx.canvas.width,
            h: this.game.ctx.canvas.height
        };
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
