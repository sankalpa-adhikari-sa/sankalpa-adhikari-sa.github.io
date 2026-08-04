interface TocLinkItem {
	link: HTMLAnchorElement;
	target: HTMLElement;
	li: HTMLLIElement;
}

/**
 * Base scroll-spy behaviour for a table of contents:
 *  - tracks which heading the reader is "in" (last heading scrolled past a
 *    reading threshold near the top of the viewport)
 *  - marks the corresponding link as active / aria-current
 *  - if a `.toc-marker path` SVG is present, animates it to trace alongside
 *    the active link (desktop only -- the mobile dropdown simply omits the
 *    SVG and this part becomes a no-op)
 *
 * Extend this class and override the `current` setter to layer on
 * extra behaviour (see `MobileTocTracker` below).
 */
export class TocTracker extends HTMLElement {
	protected items: TocLinkItem[] = [];
	protected tocPath: SVGPathElement | null = null;

	private linkStarts = new WeakMap<HTMLAnchorElement, number>();
	private linkEnds = new WeakMap<HTMLAnchorElement, number>();
	private resizeObserver: ResizeObserver | null = null;
	private _current: HTMLAnchorElement | null = null;

	protected set current(link: HTMLAnchorElement) {
		if (link === this._current) return;

		if (this._current) {
			this._current.classList.remove("active");
			this._current.closest("li")?.classList.remove("visible");
			this._current.removeAttribute("aria-current");
		}

		link.classList.add("active");
		link.closest("li")?.classList.add("visible");
		link.setAttribute("aria-current", "true");
		this._current = link;

		this.updatePath();
	}

	connectedCallback() {
		this.init();
	}

	disconnectedCallback() {
		window.removeEventListener("scroll", this.sync);
		this.resizeObserver?.disconnect();
	}

	private init() {
		const links = Array.from(
			this.querySelectorAll<HTMLAnchorElement>("a.toc-link"),
		);
		if (links.length === 0) return;

		this.tocPath = this.querySelector<SVGPathElement>(".toc-marker path");

		this.items = links.reduce<TocLinkItem[]>((acc, link) => {
			const targetId = link.getAttribute("href")?.slice(1);
			const target = targetId ? document.getElementById(targetId) : null;
			const li = link.closest("li");
			if (target && li) acc.push({ link, target, li });
			return acc;
		}, []);

		this.resizeObserver = new ResizeObserver(() => {
			this.drawPath(links);
			this.updatePath();
		});
		this.resizeObserver.observe(this);

		window.addEventListener("scroll", this.sync, { passive: true });

		this.drawPath(links);
		this.sync();
	}

	/** Traces the connector line through every link's position, in DOM order. */
	private drawPath(links: HTMLAnchorElement[]) {
		if (!this.tocPath) return;

		const pathData: (string | number)[] = [];
		let left = 0;

		links.forEach((link, i) => {
			const x = link.offsetLeft;
			const y = link.offsetTop;
			const height = link.offsetHeight;

			if (i === 0) {
				this.linkStarts.set(link, 0);
				pathData.push("M", x, y, "L", x, y + height);
			} else {
				if (left !== x) pathData.push("L", left, y);
				pathData.push("L", x, y);
				this.tocPath?.setAttribute("d", pathData.join(" "));
				this.linkStarts.set(link, this.tocPath.getTotalLength());
				pathData.push("L", x, y + height);
			}

			left = x;
			this.tocPath!.setAttribute("d", pathData.join(" "));
			this.linkEnds.set(link, this.tocPath!.getTotalLength());
		});
	}

	/** Shows only the segment of the path belonging to the active link. */
	private updatePath() {
		if (!this.tocPath) return;

		const pathLength = this.tocPath.getTotalLength();
		const activeLink =
			this.querySelector<HTMLAnchorElement>("a.toc-link.active");

		if (activeLink) {
			const start = this.linkStarts.get(activeLink) ?? 0;
			const end = this.linkEnds.get(activeLink) ?? 0;
			this.tocPath.style.display = "inline";
			this.tocPath.setAttribute(
				"stroke-dasharray",
				`1 ${start} ${end - start} ${pathLength}`,
			);
		} else {
			this.tocPath.style.display = "none";
		}
	}

	/** Reading threshold: ~33% from the top of the viewport. */
	private sync = () => {
		const threshold = window.innerHeight * 0.33;

		// Headings are in document order, so the last one whose top has
		// scrolled past the threshold is the section we're currently "in".
		let active: TocLinkItem | null = null;
		for (const item of this.items) {
			const rect = item.target.getBoundingClientRect();
			if (rect.top <= threshold) {
				active = item;
			} else {
				break;
			}
		}

		if (active) this.current = active.link;
	};
}

/**
 * Mobile variant: on top of the shared scroll-spy behaviour, keeps the
 * `<summary>` label in sync with the active heading, and closes the
 * `<details>` dropdown on link click, outside click, or Escape.
 */
export class MobileTocTracker extends TocTracker {
	protected override set current(link: HTMLAnchorElement) {
		super.current = link;
		const display = this.querySelector<HTMLSpanElement>(".display-current");
		if (display) display.textContent = link.textContent;
	}

	override connectedCallback() {
		super.connectedCallback();

		const details = this.querySelector("details");
		if (!details) return;

		const close = () => {
			details.open = false;
		};

		details
			.querySelectorAll("a")
			.forEach((a) => a.addEventListener("click", close));

		window.addEventListener("click", (e) => {
			if (!details.contains(e.target as Node)) close();
		});

		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && details.open) {
				const hadFocus = details.contains(document.activeElement);
				close();
				if (hadFocus) details.querySelector("summary")?.focus();
			}
		});
	}
}
