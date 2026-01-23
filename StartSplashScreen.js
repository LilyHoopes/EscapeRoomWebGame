class StartSplashScreen {
    constructor(game) {
        this.game = game;
        this.thumbPaths = [
            "./Sprites/Start/Jin_start.png",
            "./Sprites/Start/Lily_start.png",
            "./Sprites/Start/Shiannel_start.png",
            "./Sprites/Start/Victor_start.png"
        ];
        this.pulse = 0;
    }

    update() {
        this.pulse += this.game.clockTick;

        // On click or Enter key, switch to TitleScreen
        // (music playback is handled by the listener in main.js)
        if (this.game.click || (this.game.keys && this.game.keys["Enter"])) {
            this.game.click = null;
            if (this.game.keys) this.game.keys["Enter"] = false;
            this.goToTitle();
        }
    }

    goToTitle() {
        if (this.game.entities) {
            this.game.entities.length = 0;
        }
        this.game.addEntity(new TitleScreen(this.game));
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();

        const pw = 500, ph = 500;
        const px = Math.floor((cw - pw) / 2);
        const py = Math.floor((ch - ph) / 2);
        const rowY = py + 120, gap = 18;
        const slots = this.thumbPaths.length;
        const slotW = Math.floor((pw - gap * (slots - 1)) / slots);

        ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < this.thumbPaths.length; i++) {
            const img = ASSET_MANAGER.getAsset(this.thumbPaths[i]);
            if (!img) continue;
            const scale = Math.min(slotW / img.width, 190 / img.height);
            const dw = Math.floor(img.width * scale);
            const dh = Math.floor(img.height * scale);
            const x = px + i * (slotW + gap) + Math.floor((slotW - dw) / 2);
            const y = rowY + Math.floor((190 - dh) / 2);
            ctx.drawImage(img, x, y, dw, dh);
        }

        const t = 0.5 + 0.5 * Math.sin(this.pulse * 2.6);
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.3 * t})`;
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click to start the game", cw / 2, py + 340);
        ctx.restore();
    }
}
