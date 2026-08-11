import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import fragmentShader from "@/components/sandbox/threejs/shaders/PixilatedReveal/fragmentShader.glsl";
import vertexShader from "@/components/sandbox/threejs/shaders/PixilatedReveal/vertexShader.glsl";

export interface MediaItem {
	id: number | string;
	title: string;
	src: string;
	type: "video" | "image";
}

interface PixelRevealListProps {
	items: MediaItem[];
}

interface Uniforms {
	[key: string]: THREE.IUniform;
	uTexA: THREE.IUniform<THREE.Texture | null>;
	uTexB: THREE.IUniform<THREE.Texture | null>;
	uProgress: THREE.IUniform<number>;
	uGridSize: THREE.IUniform<number>;
	uPixelColor: THREE.IUniform<THREE.Color>;
	uAlpha: THREE.IUniform<number>;
	uTransitioning: THREE.IUniform<number>;
	uDirection: THREE.IUniform<number>;
	uWaveNoise: THREE.IUniform<number>;
	uBandWidth: THREE.IUniform<number>;
	uEntry: THREE.IUniform<number>;
	uExit: THREE.IUniform<number>;
	uColorRandom: THREE.IUniform<number>;
	uRandomRange: THREE.IUniform<number>;
	uDistortion: THREE.IUniform<number>;
	uDistGridSize: THREE.IUniform<number>;
	uDistEnabled: THREE.IUniform<number>;
	uVelocity: THREE.IUniform<THREE.Vector2>;
	uWarpStrength: THREE.IUniform<number>;
	uWarpEnabled: THREE.IUniform<number>;
	uWarpMode: THREE.IUniform<number>;
}

interface ItemHandler {
	item: HTMLElement;
	enterHandler: () => void;
	leaveHandler: () => void;
}

const clamp = (val: number, min: number, max: number): number =>
	Math.min(Math.max(val, min), max);

export default function PixelRevealList({ items }: PixelRevealListProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		const list = listRef.current;

		if (!container || !canvas || !list || items.length === 0) return;

		let width = container.offsetWidth;
		let height = container.offsetHeight;

		const renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
		});
		renderer.setSize(width, height * 1.5);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const camera = new THREE.OrthographicCamera(
			-width / 2,
			width / 2,
			height * 0.75,
			-height * 0.75,
			0.1,
			10,
		);
		camera.position.z = 1;

		const scene = new THREE.Scene();

		const getClampedPlaneWidth = (): number => {
			return clamp(window.innerWidth * 0.16, 220, 360);
		};

		const config = {
			gridSize: 35,
			pixelColor: new THREE.Color("#CFFF6A"),
			waveDuration: 0.85,
			waveNoise: 0.12,
			bandWidth: 4,
			planeWidth: getClampedPlaneWidth(),
			followSpeed: 0.1,
			rotStrengthZ: 0.004,
			rotDamping: 0.08,
			warpStrength: 0.002,
			warpDamping: 0.07,
			hoverIntentDelay: 60,
		};

		// Determine Aspect Ratio based on Media Type (Video vs Image)
		const getMediaAspectRatio = (
			media: HTMLVideoElement | HTMLImageElement,
		): number => {
			if (media instanceof HTMLVideoElement) {
				return media.videoWidth && media.videoHeight
					? media.videoWidth / media.videoHeight
					: 16 / 9;
			} else {
				return media.naturalWidth && media.naturalHeight
					? media.naturalWidth / media.naturalHeight
					: 16 / 9;
			}
		};

		const mediaElements: (HTMLVideoElement | HTMLImageElement)[] = [];
		const textures: THREE.Texture[] = items.map((item) => {
			if (item.type === "video") {
				const v = document.createElement("video");
				v.crossOrigin = "anonymous";
				v.preload = "auto";
				v.loop = true;
				v.muted = true;
				v.playsInline = true;
				v.src = item.src;
				v.load();
				mediaElements.push(v);

				const tex = new THREE.VideoTexture(v);
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				if ("colorSpace" in tex) {
					tex.colorSpace = THREE.SRGBColorSpace;
				}
				return tex;
			} else {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = item.src;
				mediaElements.push(img);

				const tex = new THREE.Texture(img);
				img.onload = () => {
					tex.needsUpdate = true;
				};
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				if ("colorSpace" in tex) {
					tex.colorSpace = THREE.SRGBColorSpace;
				}
				return tex;
			}
		});

		const primeVideo = (v: HTMLVideoElement): void => {
			const p = v.play();
			if (p && typeof p.then === "function") {
				p.then(() => v.pause()).catch(() => {});
			}
		};

		mediaElements.forEach((m) => {
			if (m instanceof HTMLVideoElement) {
				if (m.readyState >= 2) primeVideo(m);
				else
					m.addEventListener("loadeddata", () => primeVideo(m), { once: true });
			}
		});

		const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
		const uniforms: Uniforms = {
			uTexA: { value: textures[0] || null },
			uTexB: { value: textures[0] || null },
			uProgress: { value: 0 },
			uGridSize: { value: config.gridSize },
			uPixelColor: { value: config.pixelColor },
			uAlpha: { value: 0 },
			uTransitioning: { value: 1 },
			uDirection: { value: -1 },
			uWaveNoise: { value: config.waveNoise },
			uBandWidth: { value: config.bandWidth },
			uEntry: { value: 1 },
			uExit: { value: 0 },
			uColorRandom: { value: 1 },
			uRandomRange: { value: 0.2 },
			uDistortion: { value: 0 },
			uDistGridSize: { value: 13 },
			uDistEnabled: { value: 0 },
			uVelocity: { value: new THREE.Vector2(0, 0) },
			uWarpStrength: { value: config.warpStrength },
			uWarpEnabled: { value: 1 },
			uWarpMode: { value: 0 },
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest: false,
			uniforms,
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const mouse = {
			x: 0,
			y: 0,
			lastX: 0,
			lastY: 0,
			velX: 0,
			velY: 0,
			smoothVelX: 0,
			smoothVelY: 0,
		};
		const pos = { x: 0, y: 0, rotZ: 0 };
		let activeIdx = -1;
		let isExiting = false;
		let rafId: number;
		let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
		let pendingIndex: number | null = null;

		const onMouseMove = (e: MouseEvent): void => {
			const rect = container.getBoundingClientRect();
			mouse.x = e.clientX - rect.left - rect.width / 2;
			mouse.y = -(e.clientY - rect.top - rect.height / 2);
		};
		window.addEventListener("mousemove", onMouseMove, { passive: true });

		const render = (): void => {
			rafId = requestAnimationFrame(render);

			pos.x += (mouse.x - pos.x) * config.followSpeed;
			pos.y += (mouse.y - pos.y) * config.followSpeed;

			mouse.velX = mouse.x - mouse.lastX;
			mouse.velY = mouse.y - mouse.lastY;
			mouse.lastX = mouse.x;
			mouse.lastY = mouse.y;

			pos.rotZ +=
				(-mouse.velX * config.rotStrengthZ - pos.rotZ) * config.rotDamping;
			mouse.smoothVelX += (mouse.velX - mouse.smoothVelX) * config.warpDamping;
			mouse.smoothVelY += (mouse.velY - mouse.smoothVelY) * config.warpDamping;

			uniforms.uVelocity.value.set(mouse.smoothVelX, -mouse.smoothVelY);
			mesh.position.set(pos.x, pos.y, 0);
			mesh.rotation.z = pos.rotZ;

			renderer.render(scene, camera);
		};
		render();

		const revealItem = (index: number): void => {
			if (activeIdx === index && !isExiting) return;

			const targetMedia = mediaElements[index];
			if (targetMedia instanceof HTMLVideoElement) {
				targetMedia.play().catch(() => {});
			}

			const isInitial = activeIdx === -1;
			const revealDirection = isInitial ? -1 : index > activeIdx ? -1 : 1;

			activeIdx = index;
			isExiting = false;

			const aspectRatio = getMediaAspectRatio(targetMedia);
			const planeW = config.planeWidth;
			const planeH = planeW / aspectRatio;

			gsap.killTweensOf(uniforms.uProgress);
			gsap.killTweensOf(mesh.scale);
			gsap.killTweensOf(uniforms.uAlpha);

			if (isInitial) {
				pos.x = mouse.x;
				pos.y = mouse.y;
				mesh.position.set(pos.x, pos.y, 0);
				mesh.scale.set(planeW * 0.92, planeH * 0.92, 1);

				uniforms.uTexA.value = textures[index];
				uniforms.uTexB.value = textures[index];
				uniforms.uAlpha.value = 0;
				uniforms.uDirection.value = revealDirection;
				uniforms.uEntry.value = 1;
				uniforms.uExit.value = 0;
				uniforms.uTransitioning.value = 1;
				uniforms.uProgress.value = 0;

				gsap.to(uniforms.uAlpha, {
					value: 1,
					duration: 0.25,
					ease: "power2.out",
				});
				gsap.to(mesh.scale, {
					x: planeW,
					y: planeH,
					duration: config.waveDuration,
					ease: "power3.out",
				});
				gsap.to(uniforms.uProgress, {
					value: 1.2,
					duration: config.waveDuration,
					ease: "power2.inOut",
					onComplete: () => {
						uniforms.uTransitioning.value = 0;
						uniforms.uEntry.value = 0;
					},
				});
			} else {
				uniforms.uTexB.value = textures[index];
				uniforms.uDirection.value = revealDirection;
				uniforms.uEntry.value = 0;
				uniforms.uExit.value = 0;
				uniforms.uTransitioning.value = 1;
				uniforms.uProgress.value = 0;

				gsap.to(mesh.scale, {
					x: planeW,
					y: planeH,
					duration: config.waveDuration,
					ease: "power2.inOut",
				});
				gsap.to(uniforms.uProgress, {
					value: 1.2,
					duration: config.waveDuration,
					ease: "power2.inOut",
					onComplete: () => {
						uniforms.uTexA.value = textures[index];
						uniforms.uTransitioning.value = 0;
					},
				});
			}
		};

		const scheduleReveal = (index: number): void => {
			pendingIndex = index;
			if (hoverTimeout) clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => {
				hoverTimeout = null;
				if (pendingIndex === index) revealItem(index);
			}, config.hoverIntentDelay);
		};

		const onListLeave = (): void => {
			pendingIndex = null;
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
			}
			if (activeIdx === -1) return;
			isExiting = true;

			uniforms.uDirection.value = 1;
			uniforms.uExit.value = 1;
			uniforms.uTransitioning.value = 1;
			uniforms.uProgress.value = 0;

			gsap.killTweensOf(uniforms.uProgress);
			gsap.to(uniforms.uProgress, {
				value: 1.2,
				duration: config.waveDuration,
				ease: "power2.inOut",
				onComplete: () => {
					uniforms.uTransitioning.value = 0;
					uniforms.uAlpha.value = 0;
					activeIdx = -1;
					isExiting = false;
					mediaElements.forEach((m) => {
						if (m instanceof HTMLVideoElement) {
							m.pause();
						}
					});
				},
			});
		};

		let hideTimeout: ReturnType<typeof setTimeout> | null = null;
		const domItems = Array.from(
			list.querySelectorAll<HTMLElement>(".service-item"),
		);

		const itemHandlers: ItemHandler[] = domItems.map((item, index) => {
			const enterHandler = (): void => {
				item.style.color = "#fff";
				if (hideTimeout) {
					clearTimeout(hideTimeout);
					hideTimeout = null;
				}
				scheduleReveal(index);
			};
			const leaveHandler = (): void => {
				item.style.color = "";
				hideTimeout = setTimeout(() => {
					onListLeave();
				}, 50);
			};
			item.addEventListener("mouseenter", enterHandler);
			item.addEventListener("mouseleave", leaveHandler);
			return { item, enterHandler, leaveHandler };
		});

		list.addEventListener("mouseleave", onListLeave);

		const onResize = (): void => {
			if (!container) return;
			width = container.offsetWidth;
			height = container.offsetHeight;
			renderer.setSize(width, height * 1.5);
			camera.left = -width / 2;
			camera.right = width / 2;
			camera.top = height * 0.75;
			camera.bottom = -height * 0.75;
			camera.updateProjectionMatrix();

			config.planeWidth = getClampedPlaneWidth();
			if (activeIdx !== -1) {
				const currentMedia = mediaElements[activeIdx];
				const aspect = getMediaAspectRatio(currentMedia);
				const planeW = config.planeWidth;
				const planeH = planeW / aspect;
				mesh.scale.set(planeW, planeH, 1);
			}
		};
		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(rafId);
			if (hoverTimeout) clearTimeout(hoverTimeout);
			if (hideTimeout) clearTimeout(hideTimeout);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("resize", onResize);
			itemHandlers.forEach(({ item, enterHandler, leaveHandler }) => {
				item.removeEventListener("mouseenter", enterHandler);
				item.removeEventListener("mouseleave", leaveHandler);
			});
			list.removeEventListener("mouseleave", onListLeave);

			gsap.killTweensOf(uniforms.uProgress);
			gsap.killTweensOf(mesh.scale);
			gsap.killTweensOf(uniforms.uAlpha);

			renderer.dispose();
			geometry.dispose();
			material.dispose();
			textures.forEach((t) => {
				t.dispose();
			});
			mediaElements.forEach((m) => {
				if (m instanceof HTMLVideoElement) {
					m.pause();
					m.removeAttribute("src");
					m.load();
				}
			});
		};
	}, [items]);

	return (
		<div
			ref={containerRef}
			style={{
				position: "relative",
				width: "100%",
				minHeight: "100vh",
				background: "#0d0d0d",
				overflow: "hidden",
			}}
		>
			<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					top: "-25%",
					left: 0,
					pointerEvents: "none",
					zIndex: 10,
				}}
			/>

			<div
				ref={listRef}
				style={{ position: "relative", zIndex: 1, padding: "100px 10%" }}
			>
				{items.map((item, index) => (
					<div
						key={item.id}
						className="service-item"
						style={{
							display: "flex",
							justifyContent: "space-between",
							padding: "40px 0",
							borderBottom: "1px solid #333",
							cursor: "pointer",
							color: "#888",
							transition: "color 0.4s ease",
						}}
					>
						<h2 style={{ color: "inherit", fontSize: "2rem", margin: 0 }}>
							{item.title}
						</h2>
						<span style={{ color: "#555", fontSize: "1.2rem" }}>
							0{index + 1}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
