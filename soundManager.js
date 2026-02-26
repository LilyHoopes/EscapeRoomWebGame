class SoundManager {
    constructor() {
        this.cache = {};
    }

    // ── Preload a sound so it's ready to play instantly when needed ────────
    load(path, volume = 0.7) {
        if (this.cache[path]) return; // already loaded, skip
        const audio = new Audio(path);
        audio.volume = volume;
        audio.preload = "auto";
        this.cache[path] = audio;
        console.log("SoundManager: Loaded " + path);
    }

    // ── Play a sound, respecting the global mute/volume sliders ───────────
    play(path, gameEngine) {
        const audio = this.cache[path];
        if (!audio) {
            console.warn("SoundManager: Sound not preloaded — " + path);
            return;
        }
        audio.muted       = !!gameEngine.muted;
        audio.volume      = typeof gameEngine.volume === "number" ? gameEngine.volume : 0.5;
        audio.currentTime = 0; // rewind so rapid calls always fire
        audio.play().catch(() => {}); // safe: browser may block before first user gesture
    }

    // ── Play a looping sound (e.g. ambient room tone) ─────────────────────
    playLoop(path, gameEngine) {
        const audio = this.cache[path];
        if (!audio) {
            console.warn("SoundManager: Sound not preloaded — " + path);
            return;
        }
        if (!audio.paused) return; // already looping, don't restart
        audio.muted       = !!gameEngine.muted;
        audio.volume      = typeof gameEngine.volume === "number" ? gameEngine.volume : 0.5;
        audio.loop        = true;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    // ── Stop a looping sound ───────────────────────────────────────────────
    stop(path) {
        const audio = this.cache[path];
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
    }

    // ── Sync mute state across all loaded sounds (call from your mute btn) ─
    setMuted(muted) {
        for (const path in this.cache) {
            this.cache[path].muted = muted;
        }
    }

    // ── Sync volume across all loaded sounds (call from your volume slider) ─
    setVolume(volume) {
        for (const path in this.cache) {
            this.cache[path].volume = volume;
        }
    }
}

const SOUND_MANAGER = new SoundManager();
