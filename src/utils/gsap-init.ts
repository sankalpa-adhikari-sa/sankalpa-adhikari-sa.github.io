import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { GSDevTools } from "gsap/GSDevTools";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(
	ScrollTrigger,
	SplitText,
	ScrambleTextPlugin,
	Observer,
	GSDevTools,
	CustomEase,
	MotionPathPlugin,
);

export {
	gsap,
	ScrollTrigger,
	SplitText,
	ScrambleTextPlugin,
	Observer,
	GSDevTools,
	CustomEase,
	MotionPathPlugin,
};
