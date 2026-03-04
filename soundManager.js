class SoundManager {

    constructor() {
        // cache that stores the loaded sounds
        this.cache = {};
    }

    // loads a sound file
    load(path, volume = 0.7) {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.preload = "auto";
        this.cache[path] = audio;
    }

    // plays a sound file
    play(path, gameEngine) {
        const audio = this.cache[path];
        if (!audio) return;

        // checks if the game is muted or not
        // sets the volume to whatever user set it to
        // if not set, it just defaults to 0.5
        audio.muted = !!gameEngine.muted;
        audio.volume = typeof gameEngine.sfxVolume === "number" ? gameEngine.sfxVolume : 0.5;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    // plays a sound file on repeatt
    playLoop(path, gameEngine) {
        const audio = this.cache[path];
        if (!audio) return;

        // reloads source so it restarts when done/stopped
        audio.src = path;
        audio.load();

        audio.muted = !!gameEngine.muted;
        audio.volume = typeof gameEngine.sfxVolume === "number" ? gameEngine.sfxVolume : 0.5;
        audio.loop = true;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    // stops the looping sound
    stop(path) {
        const audio = this.cache[path];
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
    }
}

const SOUND_MANAGER = new SoundManager();
