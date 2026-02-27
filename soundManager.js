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
        // if not set, it jsut defaults to 0.5
        audio.muted = !!gameEngine.muted;
        audio.volume = typeof gameEngine.volume === "number" ? gameEngine.volume : 0.5;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

const SOUND_MANAGER = new SoundManager();