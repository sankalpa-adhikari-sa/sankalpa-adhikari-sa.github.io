import { gsap } from "@/utils/gsap-init";

export interface HorizontalLoopConfig {
	speed?: number;
	paused?: boolean;
	repeat?: number;
	reversed?: boolean;
	paddingRight?: number;
	snap?: number | boolean;
}

export type HorizontalLoopTimeline = gsap.core.Timeline & {
	next: (vars?: gsap.TweenVars) => gsap.core.Tween;
	previous: (vars?: gsap.TweenVars) => gsap.core.Tween;
	current: () => number;
	toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
	times: number[];
};

/**
 * Seamless, responsive horizontal loop.
 * Source: GSAP helper functions – https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/
 */
export function horizontalLoop(
	items: HTMLElement[] | NodeListOf<HTMLElement>,
	config: HorizontalLoopConfig = {},
): HorizontalLoopTimeline {
	const els = gsap.utils.toArray<HTMLElement>(items);

	const tl = gsap.timeline({
		repeat: config.repeat,
		paused: config.paused,
		defaults: { ease: "none" },
		onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
	}) as HorizontalLoopTimeline;

	const length = els.length;
	const startX = els[0].offsetLeft;
	const times: number[] = [];
	const widths: number[] = [];
	const xPercents: number[] = [];
	let curIndex = 0;
	const pixelsPerSecond = (config.speed || 1) * 100;
	const snap =
		config.snap === false
			? (v: number) => v
			: gsap.utils.snap((config.snap as number) || 1);

	let totalWidth: number,
		curX: number,
		distanceToStart: number,
		distanceToLoop: number,
		item: HTMLElement,
		i: number;

	gsap.set(els, {
		xPercent: (i: number, el: HTMLElement) => {
			const width = parseFloat(gsap.getProperty(el, "width", "px") as string);

			widths[i] = width;

			xPercents[i] = snap(
				(parseFloat(gsap.getProperty(el, "x", "px") as string) / width) * 100 +
					(gsap.getProperty(el, "xPercent") as number),
			);

			return xPercents[i];
		},
	});

	gsap.set(els, { x: 0 });

	totalWidth =
		els[length - 1].offsetLeft +
		(xPercents[length - 1] / 100) * widths[length - 1] -
		startX +
		els[length - 1].offsetWidth *
			(gsap.getProperty(els[length - 1], "scaleX") as number) +
		(parseFloat(String(config.paddingRight)) || 0);

	for (i = 0; i < length; i++) {
		item = els[i];
		curX = (xPercents[i] / 100) * widths[i];
		distanceToStart = item.offsetLeft + curX - startX;
		distanceToLoop =
			distanceToStart +
			widths[i] * (gsap.getProperty(item, "scaleX") as number);

		tl.to(
			item,
			{
				xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
				duration: distanceToLoop / pixelsPerSecond,
			},
			0,
		)
			.fromTo(
				item,
				{
					xPercent: snap(
						((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
					),
				},
				{
					xPercent: xPercents[i],
					duration:
						(curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
					immediateRender: false,
				},
				distanceToLoop / pixelsPerSecond,
			)
			.add("label" + i, distanceToStart / pixelsPerSecond);

		times[i] = distanceToStart / pixelsPerSecond;
	}

	function toIndex(index: number, vars: gsap.TweenVars = {}) {
		if (Math.abs(index - curIndex) > length / 2) {
			index += index > curIndex ? -length : length;
		}
		const newIndex = gsap.utils.wrap(0, length, index);
		let time = times[newIndex];

		if (time > tl.time() !== index > curIndex) {
			vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
			time += tl.duration() * (index > curIndex ? 1 : -1);
		}

		curIndex = newIndex;
		vars.overwrite = true;
		return tl.tweenTo(time, vars);
	}

	tl.next = (vars) => toIndex(curIndex + 1, vars);
	tl.previous = (vars) => toIndex(curIndex - 1, vars);
	tl.current = () => curIndex;
	tl.toIndex = (index, vars) => toIndex(index, vars);
	tl.times = times;

	tl.progress(1, true).progress(0, true);

	if (config.reversed) {
		tl.vars.onReverseComplete?.();
		tl.reverse();
	}

	return tl;
}
