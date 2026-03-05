class GhostNPC {
  constructor(game, x, y, spritePath, cfg = {}) {
    this.game = game;
    this.x = x;
    this.y = y;

    this.depth = 9999;

    this.spritePath = spritePath;
    this.sprite = null;

    this.frames = cfg.frames ?? 2;
    this.startX = cfg.startX ?? 0;
    this.startY = cfg.startY ?? 0;
    this.frameWidth = cfg.frameWidth ?? 64;
    this.frameHeight = cfg.frameHeight ?? 64;
    this.frameDuration = cfg.frameDuration ?? 0.25;

    this.scale = cfg.scale ?? 0.4;

    this.anim = null;

    this.removeFromWorld = false;
    this.isSolid = false;
    this.isPopup = false;
  }

  update() {
    if (!this.sprite) {
      this.sprite = ASSET_MANAGER.getAsset(this.spritePath);
      if (this.sprite) {
        this.anim = new Animator(
          this.sprite,
          this.startX,
          this.startY,
          this.frameWidth,
          this.frameHeight,
          this.frames,
          this.frameDuration
        );
      }
    }
  }

  draw(ctx) {
    if (!this.anim) return;
    this.anim.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
  }
}

window.GhostNPC = GhostNPC;