class StartSplashScreen {
    constructor(game) {
        this.game = game;

        // TitleScreen.png (2048x2048, 1024x1024 두 프레임)
        this.sheetPath = "./Sprites/Start/TitleScreen.png";
        this.sheet = ASSET_MANAGER.getAsset(this.sheetPath);

        this.frameW = 1024;
        this.frameH = 1024;

        // 네가 예전에 쓰던 crop 값 그대로
        this.cropX = 60;
        this.cropY = 277;
        this.cropW = 920;
        this.cropH = 588;

        // 왼쪽 프레임 고정
        this.frameIndex = 0;

        this.pulse = 0;
    }

    update() {
        this.pulse += this.game.clockTick;

        // 클릭 또는 Enter로 TitleScreen 이동
        if (this.game.click || (this.game.keys && this.game.keys["Enter"])) {
            this.game.click = null;
            if (this.game.keys) this.game.keys["Enter"] = false;
            this.goToTitle();
        }
    }

    goToTitle() {
        if (this.game.entities) this.game.entities.length = 0;
        this.game.addEntity(new TitleScreen(this.game));
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // 배경 검정
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();

        const sheet = this.sheet || ASSET_MANAGER.getAsset(this.sheetPath);
        if (!sheet) return;

        // 왼쪽 프레임의 crop 영역만 뽑아서 화면 꽉 채우기
        const sx = this.frameIndex * this.frameW + this.cropX;
        const sy = this.cropY;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            sheet,
            sx, sy, this.cropW, this.cropH,
            0, 0, cw, ch
        );

        // 깜빡이는 안내 문구
        const t = 0.5 + 0.5 * Math.sin(this.pulse * 2.6);
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.3 * t})`;
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText("CLICK IF YOU DARE", cw / 2, ch - 40);
        ctx.restore();
    }
}
