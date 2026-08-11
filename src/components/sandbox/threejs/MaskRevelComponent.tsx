import { Canvas } from "@react-three/fiber";

import FluidMaskReveal from "./FluidMaskReveal";

export default function App() {
	return (
		<div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
			<Canvas>
				<FluidMaskReveal
					baseImage="https://picsum.photos/id/1040/1200/1000"
					revealImage="/vids/2.mp4"
				/>
			</Canvas>
		</div>
	);
}
