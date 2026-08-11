import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import fragmentShader from "@/components/sandbox/threejs/shaders/PixelatedDistortion/fragmentShader.glsl";
import vertexShader from "@/components/sandbox/threejs/shaders/PixelatedDistortion/vertexShader.glsl";

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 8.96;
const RADIUS_SQ = RADIUS * RADIUS;

export interface PixelDistortionCanvasProps {
	src?: string;
	aspect?: number;
	isVideo?: boolean;
	videoSrc?: string;
	overlayRef?: React.RefObject<HTMLImageElement | HTMLVideoElement | null>;
	parallaxWrapperRef?: React.RefObject<HTMLDivElement | null>;
}

function PixelDistortionCanvasComponent({
	src,
	aspect = 9 / 16,
	isVideo: propIsVideo,
	videoSrc,
	overlayRef,
	parallaxWrapperRef,
}: PixelDistortionCanvasProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const internalMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(
		null,
	);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const materialRef = useRef<THREE.ShaderMaterial | null>(null);
	const textureRef = useRef<THREE.Texture | THREE.VideoTexture | null>(null);

	const [canvasHeight, setCanvasHeight] = useState(0);

	const isVideo = propIsVideo ?? Boolean(videoSrc);
	const mediaRef = overlayRef || internalMediaRef;

	useEffect(
		function setupCanvas() {
			const container = containerRef.current;
			const wrapper = canvasContainerRef.current;
			if (!container || !wrapper) return;

			let animFrameId: number | null = null;
			let imgWidth = 0;
			let imgHeight = 0;

			const mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 };

			const scene = new THREE.Scene();
			const renderer = new THREE.WebGLRenderer({
				antialias: false,
				alpha: true,
				powerPreference: "high-performance",
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

			renderer.domElement.style.position = "absolute";
			renderer.domElement.style.inset = "0";
			renderer.domElement.style.zIndex = "5";

			wrapper.appendChild(renderer.domElement);
			rendererRef.current = renderer;

			const camera = new THREE.OrthographicCamera(
				-0.5,
				0.5,
				0.5,
				-0.5,
				-1000,
				1000,
			);
			camera.position.z = 2;

			const dataArray = new Float32Array(64 * 64 * 4);
			const dataTexture = new THREE.DataTexture(
				dataArray,
				64,
				64,
				THREE.RGBAFormat,
				THREE.FloatType,
			);
			dataTexture.magFilter = dataTexture.minFilter = THREE.NearestFilter;

			let mesh: THREE.Mesh | null = null;

			function handleResize() {
				if (!container) return;
				const width = container.offsetWidth;
				const height = aspect
					? width * aspect
					: (imgHeight / imgWidth) * width || (9 / 16) * width;

				setCanvasHeight(height);
				renderer.setSize(width, 1.1 * height);

				if (materialRef.current) {
					const w = imgWidth || width;
					const h = imgHeight || height;
					materialRef.current.uniforms.resolution.value.set(
						width,
						1.1 * height,
						w,
						h,
					);
				}
			}

			function initMaterial(loadedTexture: THREE.Texture) {
				textureRef.current = loadedTexture;
				const material = new THREE.ShaderMaterial({
					uniforms: {
						uTexture: { value: loadedTexture },
						uDataTexture: { value: dataTexture },
						resolution: { value: new THREE.Vector4() },
					},
					vertexShader,
					fragmentShader,
					precision: "mediump",
				});

				materialRef.current = material;
				mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
				scene.add(mesh);
				handleResize();

				gsap.fromTo(
					renderer.domElement,
					{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.05 },
					{
						clipPath: "inset(0% 0% 0% 0%)",
						scale: 1,
						duration: 1.5,
						ease: "power4.out",
						scrollTrigger: {
							trigger: container,
							start: "top 85%",
						},
					},
				);
			}

			if (isVideo) {
				const mediaElement = mediaRef.current as HTMLVideoElement | null;
				if (mediaElement) {
					mediaElement.muted = true;
					mediaElement.play().catch(() => {});

					const texture = new THREE.VideoTexture(mediaElement);
					texture.minFilter = THREE.LinearFilter;
					texture.magFilter = THREE.LinearFilter;

					const handleVideoInit = () => {
						imgWidth = mediaElement.videoWidth || 1280;
						imgHeight = mediaElement.videoHeight || 720;
						initMaterial(texture);
					};

					if (mediaElement.readyState >= 2) {
						handleVideoInit();
					} else {
						mediaElement.addEventListener("loadeddata", handleVideoInit, {
							once: true,
						});
					}
				}
			} else if (src) {
				const loader = new THREE.TextureLoader();
				loader.setCrossOrigin("anonymous");
				loader.load(src, function handleTextureLoad(texture) {
					imgWidth = texture.image.width;
					imgHeight = texture.image.height;
					initMaterial(texture);
				});
			}

			function handleMouseEnter(e: MouseEvent) {
				if (!container) return;
				const rect = container.getBoundingClientRect();
				mouse.prevX = mouse.x = (e.clientX - rect.left) / rect.width;
				mouse.prevY = mouse.y = (e.clientY - rect.top) / rect.height;
			}

			function handleMouseMove(e: MouseEvent) {
				if (!container) return;
				const rect = container.getBoundingClientRect();
				mouse.x = (e.clientX - rect.left) / rect.width;
				mouse.y = (e.clientY - rect.top) / rect.height;

				mouse.vX = mouse.x - mouse.prevX;
				mouse.vY = mouse.y - mouse.prevY;

				mouse.prevX = mouse.x;
				mouse.prevY = mouse.y;
			}

			container.addEventListener("mouseenter", handleMouseEnter, {
				passive: true,
			});
			container.addEventListener("mousemove", handleMouseMove, {
				passive: true,
			});

			function animate() {
				animFrameId = requestAnimationFrame(animate);

				const pixels = dataTexture.image.data;
				if (!pixels) return;

				for (let i = 0; i < pixels.length; i += 4) {
					pixels[i] *= 0.92;
					pixels[i + 1] *= 0.92;
				}

				const gridX = 64 * mouse.x;
				const gridY = 64 * (1 - mouse.y);

				for (let x = 0; x < 64; x++) {
					const dx = gridX - x;
					for (let y = 0; y < 64; y++) {
						const dy = gridY - y;
						const distSq = dx * dx + dy * dy;

						if (distSq < RADIUS_SQ) {
							const index = 4 * (x + 64 * y);
							const force = ((RADIUS - Math.sqrt(distSq)) / RADIUS) * 120;
							pixels[index] += force * mouse.vX;
							pixels[index + 1] -= force * mouse.vY;
						}
					}
				}

				mouse.vX *= 0.8;
				mouse.vY *= 0.8;
				dataTexture.needsUpdate = true;

				if (isVideo && textureRef.current) {
					const video = mediaRef.current as HTMLVideoElement | null;
					if (video && video.readyState >= video.HAVE_CURRENT_DATA) {
						textureRef.current.needsUpdate = true;
					}
				}

				renderer.render(scene, camera);
			}

			function startLoop() {
				if (!animFrameId) animFrameId = requestAnimationFrame(animate);
			}

			function stopLoop() {
				if (animFrameId) {
					cancelAnimationFrame(animFrameId);
					animFrameId = null;
				}
			}

			const observer = new IntersectionObserver(
				function handleIntersection([entry]) {
					entry.isIntersecting ? startLoop() : stopLoop();
				},
				{ rootMargin: "100px 0px" },
			);
			observer.observe(container);

			const resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(container);

			const parallaxTrigger = ScrollTrigger.create({
				trigger: container,
				start: "top bottom",
				end: "bottom top",
				scrub: true,
				onUpdate: function handleParallax(self) {
					gsap.set(wrapper, {
						yPercent: -10 + 20 * self.progress,
						immediateRender: true,
					});
				},
			});

			return function cleanup() {
				container.removeEventListener("mouseenter", handleMouseEnter);
				container.removeEventListener("mousemove", handleMouseMove);
				observer.disconnect();
				resizeObserver.disconnect();
				parallaxTrigger.kill();
				stopLoop();

				if (mesh) {
					scene.remove(mesh);
					mesh.geometry.dispose();
					(mesh.material as THREE.Material).dispose();
				}
				dataTexture.dispose();

				if (rendererRef.current) {
					rendererRef.current.dispose();
					if (wrapper.contains(rendererRef.current.domElement)) {
						wrapper.removeChild(rendererRef.current.domElement);
					}
				}
				if (textureRef.current) textureRef.current.dispose();

				materialRef.current = null;
				textureRef.current = null;
				rendererRef.current = null;
			};
		},
		[src, aspect, isVideo, videoSrc],
	);

	return (
		<div
			ref={containerRef}
			className="relative w-full overflow-hidden"
			style={{ height: canvasHeight ? `${canvasHeight}px` : "48.8vh" }}
		>
			<div
				ref={function setCanvasWrapperRef(el) {
					canvasContainerRef.current = el;
					if (parallaxWrapperRef) {
						(
							parallaxWrapperRef as React.MutableRefObject<HTMLDivElement | null>
						).current = el;
					}
				}}
				className="absolute inset-0 w-full will-change-transform"
				style={{ height: "110%", top: "-5%", transform: "scale(1.025)" }}
			>
				{isVideo ? (
					<video
						ref={mediaRef as React.RefObject<HTMLVideoElement>}
						src={videoSrc}
						crossOrigin="anonymous"
						autoPlay
						loop
						muted
						playsInline
						preload="auto"
						className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 z-10"
					/>
				) : (
					<img
						ref={mediaRef as React.RefObject<HTMLImageElement>}
						src={src}
						alt=""
						className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0 z-10"
					/>
				)}
			</div>
		</div>
	);
}

export const PixelDistortionCanvas = memo(PixelDistortionCanvasComponent);
PixelDistortionCanvas.displayName = "PixelDistortionCanvas";
