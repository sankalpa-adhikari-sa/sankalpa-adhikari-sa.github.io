import { useTexture, useVideoTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import advectionFrag from "@/components/sandbox/threejs/shaders/fluid/advectionFrag.frag";
import baseVertex from "@/components/sandbox/threejs/shaders/fluid/baseVertex.glsl";
import curlFrag from "@/components/sandbox/threejs/shaders/fluid/curlFrag.frag";
import displayFrag from "@/components/sandbox/threejs/shaders/fluid/displayFrag.frag";
import displayVertex from "@/components/sandbox/threejs/shaders/fluid/displayVertex.glsl";
import divergenceFrag from "@/components/sandbox/threejs/shaders/fluid/divergenceFrag.frag";
import gradientSubtractFrag from "@/components/sandbox/threejs/shaders/fluid/gradientSubtractFrag.frag";
import pressureFrag from "@/components/sandbox/threejs/shaders/fluid/pressureFrag.frag";
import splatFrag from "@/components/sandbox/threejs/shaders/fluid/splatFrag.frag";
import vorticityFrag from "@/components/sandbox/threejs/shaders/fluid/vorticityFrag.frag";

export interface FluidMaskRevealProps {
	baseImage?: string;
	revealImage?: string;
	simResolution?: number;
	dyeResolution?: number;
	velocityDissipation?: number;
	dyeDissipation?: number;
	pressureIterations?: number;
	curlStrength?: number;
	splatRadius?: number;
	splatForce?: number;
	revealSize?: number;
	edgeSoftness?: number;
	edgeWidth?: number;
}

export interface DoubleFBO {
	read: THREE.WebGLRenderTarget;
	write: THREE.WebGLRenderTarget;
	swap: () => void;
}

export interface PointerState {
	x: number;
	y: number;
	dx: number;
	dy: number;
	moved: boolean;
}

const createFBO = (
	w: number,
	h: number,
	type: THREE.TextureDataType = THREE.HalfFloatType,
): THREE.WebGLRenderTarget => {
	return new THREE.WebGLRenderTarget(w, h, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		type: type,
		depthBuffer: false,
		stencilBuffer: false,
	});
};

const createDoubleFBO = (
	w: number,
	h: number,
	type: THREE.TextureDataType = THREE.HalfFloatType,
): DoubleFBO => {
	const fbo: DoubleFBO = {
		read: createFBO(w, h, type),
		write: createFBO(w, h, type),
		swap: () => {
			const temp = fbo.read;
			fbo.read = fbo.write;
			fbo.write = temp;
		},
	};
	return fbo;
};

const createShaderMaterial = (
	fragmentShader: string,
	uniforms: { [uniform: string]: THREE.IUniform },
): THREE.ShaderMaterial => {
	return new THREE.ShaderMaterial({
		vertexShader: baseVertex,
		fragmentShader,
		uniforms,
		depthTest: false,
		depthWrite: false,
	});
};

export default function FluidMaskReveal({
	baseImage = "/path-to-base-image.jpg",
	revealImage = "/path-to-reveal-image.jpg",
	simResolution = 256,
	dyeResolution = 512,
	velocityDissipation = 0.962,
	dyeDissipation = 0.988,
	pressureIterations = 20,
	curlStrength = 0,
	splatRadius = 6e-5,
	splatForce = 5900,
	revealSize = 3.9,
	edgeSoftness = 0.5,
	edgeWidth = 0.01,
}: FluidMaskRevealProps) {
	const { gl, size, viewport } = useThree();
	const baseTex = useTexture(baseImage);
	const revealTex = useVideoTexture(revealImage, {
		muted: true,
		loop: true,
		start: true,
	});
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const pointer = useRef<PointerState>({
		x: 0.5,
		y: 0.5,
		dx: 0,
		dy: 0,
		moved: false,
	});

	const { simScene, simCamera, simQuad } = useMemo(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
		scene.add(quad);
		return { simScene: scene, simCamera: camera, simQuad: quad };
	}, []);

	const fbos = useMemo(() => {
		return {
			velocity: createDoubleFBO(
				simResolution,
				simResolution,
				THREE.HalfFloatType,
			),
			pressure: createDoubleFBO(simResolution, simResolution, THREE.FloatType), // Pressure needs high precision
			dye: createDoubleFBO(dyeResolution, dyeResolution, THREE.HalfFloatType),
			curl: createFBO(simResolution, simResolution, THREE.HalfFloatType),
			divergence: createFBO(simResolution, simResolution, THREE.HalfFloatType),
		};
	}, [simResolution, dyeResolution]);

	const materials = useMemo(() => {
		const simTexelSize = new THREE.Vector2(
			1 / simResolution,
			1 / simResolution,
		);

		return {
			advection: createShaderMaterial(advectionFrag, {
				uVelocity: { value: null },
				uSource: { value: null },
				uTexelSize: { value: simTexelSize },
				uDt: { value: 1.0 },
				uDissipation: { value: velocityDissipation },
			}),
			splat: createShaderMaterial(splatFrag, {
				uTarget: { value: null },
				uAspectRatio: { value: size.width / size.height },
				uPoint: { value: new THREE.Vector2() },
				uColor: { value: new THREE.Vector3() },
				uRadius: { value: splatRadius },
			}),
			curl: createShaderMaterial(curlFrag, {
				uVelocity: { value: null },
				uTexelSize: { value: simTexelSize },
			}),
			vorticity: createShaderMaterial(vorticityFrag, {
				uVelocity: { value: null },
				uCurl: { value: null },
				uTexelSize: { value: simTexelSize },
				uCurlStrength: { value: curlStrength },
				uDt: { value: 0.016 },
			}),
			divergence: createShaderMaterial(divergenceFrag, {
				uVelocity: { value: null },
				uTexelSize: { value: simTexelSize },
			}),
			pressure: createShaderMaterial(pressureFrag, {
				uPressure: { value: null },
				uDivergence: { value: null },
				uTexelSize: { value: simTexelSize },
			}),
			gradientSubtract: createShaderMaterial(gradientSubtractFrag, {
				uPressure: { value: null },
				uVelocity: { value: null },
				uTexelSize: { value: simTexelSize },
			}),
		};
	}, [simResolution, velocityDissipation, size, splatRadius, curlStrength]);

	const renderPass = (
		material: THREE.ShaderMaterial,
		target: THREE.WebGLRenderTarget,
	) => {
		simQuad.material = material;
		gl.setRenderTarget(target);
		gl.render(simScene, simCamera);
	};

	useFrame((_, delta) => {
		const dt = Math.min(delta, 0.016); // Clamp dt

		// 1. Advect Velocity
		materials.advection.uniforms.uVelocity.value = fbos.velocity.read.texture;
		materials.advection.uniforms.uSource.value = fbos.velocity.read.texture;
		materials.advection.uniforms.uDissipation.value = velocityDissipation;
		materials.advection.uniforms.uDt.value = dt;
		renderPass(materials.advection, fbos.velocity.write);
		fbos.velocity.swap();

		// 2. Advect Dye
		materials.advection.uniforms.uVelocity.value = fbos.velocity.read.texture;
		materials.advection.uniforms.uSource.value = fbos.dye.read.texture;
		materials.advection.uniforms.uDissipation.value = dyeDissipation;
		renderPass(materials.advection, fbos.dye.write);
		fbos.dye.swap();

		// 3. Apply Mouse Splats (Interactions)
		if (pointer.current.moved) {
			materials.splat.uniforms.uPoint.value.set(
				pointer.current.x,
				pointer.current.y,
			);

			// Splat Velocity
			materials.splat.uniforms.uTarget.value = fbos.velocity.read.texture;
			materials.splat.uniforms.uColor.value
				.set(pointer.current.dx, pointer.current.dy, 0.0)
				.multiplyScalar(splatForce);
			renderPass(materials.splat, fbos.velocity.write);
			fbos.velocity.swap();

			// Splat Dye
			materials.splat.uniforms.uTarget.value = fbos.dye.read.texture;
			materials.splat.uniforms.uColor.value.set(1.0, 1.0, 1.0); // White mask
			renderPass(materials.splat, fbos.dye.write);
			fbos.dye.swap();

			pointer.current.moved = false;
		}

		// 4. Calculate Vorticity
		materials.curl.uniforms.uVelocity.value = fbos.velocity.read.texture;
		renderPass(materials.curl, fbos.curl);

		materials.vorticity.uniforms.uVelocity.value = fbos.velocity.read.texture;
		materials.vorticity.uniforms.uCurl.value = fbos.curl.texture;
		materials.vorticity.uniforms.uDt.value = dt;
		renderPass(materials.vorticity, fbos.velocity.write);
		fbos.velocity.swap();

		// 5. Calculate Divergence
		materials.divergence.uniforms.uVelocity.value = fbos.velocity.read.texture;
		renderPass(materials.divergence, fbos.divergence);

		// 6. Calculate Pressure (Jacobi Iteration)
		materials.pressure.uniforms.uDivergence.value = fbos.divergence.texture;
		for (let i = 0; i < pressureIterations; i++) {
			materials.pressure.uniforms.uPressure.value = fbos.pressure.read.texture;
			renderPass(materials.pressure, fbos.pressure.write);
			fbos.pressure.swap();
		}

		// 7. Gradient Subtraction (Enforce incompressibility)
		materials.gradientSubtract.uniforms.uPressure.value =
			fbos.pressure.read.texture;
		materials.gradientSubtract.uniforms.uVelocity.value =
			fbos.velocity.read.texture;
		renderPass(materials.gradientSubtract, fbos.velocity.write);
		fbos.velocity.swap();

		// 8. Reset Render Target so R3F can draw the main scene
		gl.setRenderTarget(null);

		// 9. Update Final Material Uniforms
		if (materialRef.current) {
			materialRef.current.uniforms.uDye.value = fbos.dye.read.texture;
		}
	});

	const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
		// Ensure UV properties are available (almost always true for PlaneGeometry)
		if (e.uv) {
			const u = e.uv.x;
			const v = e.uv.y;
			pointer.current.dx = (u - pointer.current.x) * 10;
			pointer.current.dy = (v - pointer.current.y) * 10;
			pointer.current.x = u;
			pointer.current.y = v;
			pointer.current.moved = true;
		}
	};

	// Calculate Aspect Ratios for object-fit: cover mapping
	const baseAspect = baseTex.image
		? (baseTex.image as HTMLImageElement).width /
			(baseTex.image as HTMLImageElement).height
		: 1;
	const revealAspect = revealTex.image
		? (revealTex.image as HTMLVideoElement).videoWidth /
			(revealTex.image as HTMLVideoElement).videoHeight
		: 1;
	const planeAspect = size.width / size.height;

	return (
		<mesh onPointerMove={handlePointerMove}>
			<planeGeometry args={[viewport.width, viewport.height]} />
			<shaderMaterial
				ref={materialRef}
				vertexShader={displayVertex}
				fragmentShader={displayFrag}
				transparent={true}
				depthWrite={false}
				uniforms={{
					uBaseTexture: { value: baseTex },
					uRevealTexture: { value: revealTex },
					uDye: { value: null }, // Handled in useFrame
					uRevealSize: { value: revealSize },
					uEdgeSoftness: { value: edgeSoftness },
					uEdgeWidth: { value: edgeWidth },
					uBaseImageAspect: { value: baseAspect },
					uRevealImageAspect: { value: revealAspect },
					uPlaneAspect: { value: planeAspect },
				}}
			/>
		</mesh>
	);
}
