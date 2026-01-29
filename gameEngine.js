class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Debug and volume stuff
        this.debug = false;
        this.muted = false;
        this.volume = 0.65;

        // Keyboard flags (used by gameplay and TitleScreen)
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.enter = false;
        this.E = false;
        this.I = false;

        // Track whether keyboard is being used
        this.keyboardActive = false;

        //this prevents movement while viewing interactive objects like the rose painting aka pauses the rest ... ?
        this.examing = false;
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startInput() {
        const that = this;

        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        // Make canvas focusable so it can receive keyboard events reliably
        this.ctx.canvas.tabIndex = 1;
        this.ctx.canvas.style.outline = "none";

        // Focus the canvas so ArrowUp does not get eaten by the browser/page
        this.ctx.canvas.addEventListener("mousedown", () => this.ctx.canvas.focus());
        this.ctx.canvas.focus();

        function keydownListener(e) {
            that.keyboardActive = true;

            // Prevent browser scrolling with arrow keys and space
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
                e.preventDefault();
            }

            // Keep both APIs in sync:
            // 1) boolean flags (that.up, that.down, etc.)
            // 2) key map (that.keys["ArrowUp"], that.keys["Enter"], etc.)
            that.keys[e.key] = true;

            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = true;
                    break;

                case "ArrowRight":
                case "KeyD":
                    that.right = true;
                    break;

                case "ArrowUp":
                case "KeyW":
                    that.up = true;
                    break;

                case "ArrowDown":
                case "KeyS":
                    that.down = true;
                    break;

                case "KeyE":
                    that.E = true;
                    break;

                case "KeyI":
                    that.I = true;
                    break;

                case "Enter":
                    that.enter = true;
                    break;
            }
        }

        function keyUpListener(e) {
            that.keyboardActive = false;

            that.keys[e.key] = false;

            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = false;
                    break;

                case "ArrowRight":
                case "KeyD":
                    that.right = false;
                    break;

                case "ArrowUp":
                case "KeyW":
                    that.up = false;
                    break;

                case "ArrowDown":
                case "KeyS":
                    that.down = false;
                    break;

                case "KeyE":
                    that.E = false;
                    break;

                case "KeyI":
                    that.I = false;
                    break;

                case "Enter":
                    that.enter = false;
                    break;
            }
        }

        // Keyboard
        this.ctx.canvas.addEventListener("keydown", keydownListener);
        this.ctx.canvas.addEventListener("keyup", keyUpListener);

        // Keep references (if other code expects them)
        that.keydown = keydownListener;
        that.keyup = keyUpListener;

        // Mouse move
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.debug) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        // Left click
        this.ctx.canvas.addEventListener("click", e => {
            if (this.debug) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);

            // Clicking also focuses canvas, helps keyboard input
            this.ctx.canvas.focus();
        });

        // Mouse wheel
        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.debug) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent scrolling
            this.wheel = e;
        });

        // Right click context menu
        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.debug) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent context menu
            this.rightclick = getXandY(e);
        });
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx, this);
        }
    }

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (entity && !entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i] && this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}
