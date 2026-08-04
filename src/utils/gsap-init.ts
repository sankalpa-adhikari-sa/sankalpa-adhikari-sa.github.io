import gsap from "gsap";
import { GSDevTools } from "gsap/GSDevTools";
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
);

export {
	gsap,
	ScrollTrigger,
	SplitText,
	ScrambleTextPlugin,
	Observer,
	GSDevTools,
};
