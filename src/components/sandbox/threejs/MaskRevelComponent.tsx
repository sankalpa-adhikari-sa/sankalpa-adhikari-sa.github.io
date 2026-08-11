import { Canvas } from "@react-three/fiber";

import FluidMaskReveal from "./FluidMaskReveal";

export default function App() {
	return (
		<div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
			<Canvas>
				<FluidMaskReveal
					baseImage="https://cdn.prod.website-files.com/6a2679b9acc91890e34df140/6a319bf45a0a1fa70477531a_work-vignette-haptify-V2.webp"
					revealImage="https://noth-in.b-cdn.net/nothin-sharp-high.mp4"
				/>
			</Canvas>
		</div>
	);
}
