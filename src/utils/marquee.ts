export function ensureMarqueeFillsViewport(
	track: HTMLElement,
	minWidth: number,
) {
	const originalItems = Array.from(track.children) as HTMLElement[];
	if (!originalItems.length) return;

	let safety = 0;
	while (track.scrollWidth < minWidth && safety < 20) {
		originalItems.forEach((item) => {
			const clone = item.cloneNode(true) as HTMLElement;
			clone.setAttribute("aria-hidden", "true");
			track.appendChild(clone);
		});
		safety++;
	}
}
