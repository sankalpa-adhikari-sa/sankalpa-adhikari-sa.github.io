class AudioManager {
	private sounds = new Map<string, HTMLAudioElement>();
	private loadPromises: Promise<void>[] = [];

	constructor() {
		this.add("click", "/click.mp3", 0.8);
		this.add("hover", "/hover.mp3", 0.5);
		this.add("pop", "/pop.mp3", 0.04);
	}

	private add(name: string, src: string, volume = 1) {
		const audio = new Audio(src);
		audio.preload = "auto";
		audio.volume = volume;

		this.loadPromises.push(
			new Promise<void>((resolve) => {
				audio.addEventListener("canplaythrough", () => resolve(), {
					once: true,
				});
				audio.addEventListener("error", () => resolve(), { once: true }); // don't hang the loader on a 404
			}),
		);

		this.sounds.set(name, audio);
	}

	whenReady() {
		return Promise.all(this.loadPromises);
	}

	play(name: string) {
		const sound = this.sounds.get(name);
		if (!sound) return;
		sound.pause();
		sound.currentTime = 0;
		sound.play().catch(() => {});
	}

	setVolume(name: string, volume: number) {
		this.sounds.get(name)!.volume = volume;
	}
}

export const audio = new AudioManager();
