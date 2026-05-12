import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createViewer(container: HTMLElement): {
	loadGlb: (base64: string) => void;
	loadGlbUrl: (url: string) => void;
	destroy: () => void;
	resize: () => void;
	setAutoRotate: (enabled: boolean) => void;
	resetCamera: () => void;
	takeScreenshot: () => string | null;
} {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
	camera.position.set(0, 1, 3);

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.enablePan = true;
	controls.minDistance = 0.5;
	controls.maxDistance = 20;
	controls.target.set(0, 0, 0);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
	directionalLight.position.set(5, 10, 7);
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
	fillLight.position.set(-5, 5, -5);
	scene.add(fillLight);

	const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
	scene.add(gridHelper);

	let currentModel: THREE.Group | null = null;
	let autoRotateEnabled = false;

	const loader = new GLTFLoader();

	const initialCameraPos = camera.position.clone();
	const initialTarget = controls.target.clone();

	function fitCameraToModel(object: THREE.Object3D) {
		const box = new THREE.Box3().setFromObject(object);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());

		const maxDim = Math.max(size.x, size.y, size.z);
		const fov = camera.fov * (Math.PI / 180);
		const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;

		camera.position.set(center.x, center.y + maxDim * 0.3, center.z + cameraZ);
		controls.target.set(center.x, center.y, center.z);
		controls.update();
	}

	function loadGlb(base64: string) {
		removeCurrentModel();

		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		const blob = new Blob([bytes], { type: 'model/gltf-binary' });
		const url = URL.createObjectURL(blob);

		loader.load(
			url,
			(gltf) => {
				currentModel = gltf.scene;
				scene.add(currentModel);
				fitCameraToModel(currentModel);
				URL.revokeObjectURL(url);
			},
			undefined,
			(error) => {
				console.error('Error loading GLB:', error);
				URL.revokeObjectURL(url);
			}
		);
	}

	function loadGlbUrl(url: string) {
		removeCurrentModel();
		loader.load(
			url,
			(gltf) => {
				currentModel = gltf.scene;
				scene.add(currentModel);
				fitCameraToModel(currentModel);
			},
			undefined,
			(error) => {
				console.error('Error loading GLB from URL:', error);
			}
		);
	}

	function removeCurrentModel() {
		if (currentModel) {
			scene.remove(currentModel);
			currentModel.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.geometry.dispose();
					if (Array.isArray(child.material)) {
						child.material.forEach((m) => m.dispose());
					} else {
						child.material.dispose();
					}
				}
			});
			currentModel = null;
		}
	}

	function setAutoRotate(enabled: boolean) {
		autoRotateEnabled = enabled;
		controls.autoRotate = enabled;
		controls.autoRotateSpeed = 2.0;
	}

	function resetCamera() {
		if (currentModel) {
			fitCameraToModel(currentModel);
		} else {
			camera.position.copy(initialCameraPos);
			controls.target.copy(initialTarget);
			controls.update();
		}
	}

	function takeScreenshot(): string | null {
		renderer.render(scene, camera);
		return renderer.domElement.toDataURL('image/png');
	}

	let animationId: number;

	function animate() {
		animationId = requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}

	animate();

	function destroy() {
		cancelAnimationFrame(animationId);
		removeCurrentModel();
		controls.dispose();
		renderer.dispose();
		if (renderer.domElement.parentNode) {
			renderer.domElement.parentNode.removeChild(renderer.domElement);
		}
	}

	function resize() {
		const width = container.clientWidth;
		const height = container.clientHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	return { loadGlb, loadGlbUrl, destroy, resize, setAutoRotate, resetCamera, takeScreenshot };
}
