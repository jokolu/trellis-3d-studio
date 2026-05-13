import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createViewer(container: HTMLElement): {
	loadGlb: (base64: string) => void;
	loadGlbUrl: (url: string) => void;
	destroy: () => void;
	resize: () => void;
	setAutoRotate: (enabled: boolean) => void;
	setSunEnabled: (enabled: boolean) => void;
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
	renderer.toneMappingExposure = 1.3;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.enablePan = true;
	controls.minDistance = 0.5;
	controls.maxDistance = 20;
	controls.target.set(0, 0, 0);

	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	pmremGenerator.compileEquirectangularShader();
	const envScene = new THREE.Scene();
	const envLight1 = new THREE.DirectionalLight(0xffffff, 2);
	envLight1.position.set(1, 1, 1);
	envScene.add(envLight1);
	const envLight2 = new THREE.DirectionalLight(0xfff5e0, 1.5);
	envLight2.position.set(-1, 0.5, -1);
	envScene.add(envLight2);
	const envLight3 = new THREE.DirectionalLight(0x87ceeb, 0.8);
	envLight3.position.set(0, -1, 0);
	envScene.add(envLight3);
	envScene.background = new THREE.Color(0x303040);
	const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
	scene.environment = envMap;
	pmremGenerator.dispose();

	const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
	scene.add(ambientLight);

	const sunLight = new THREE.DirectionalLight(0xfff5e0, 4);
	sunLight.position.set(5, 8, 5);
	sunLight.castShadow = true;
	sunLight.shadow.mapSize.width = 2048;
	sunLight.shadow.mapSize.height = 2048;
	sunLight.shadow.camera.near = 0.5;
	sunLight.shadow.camera.far = 50;
	sunLight.shadow.camera.left = -10;
	sunLight.shadow.camera.right = 10;
	sunLight.shadow.camera.top = 10;
	sunLight.shadow.camera.bottom = -10;
	sunLight.shadow.bias = -0.001;
	scene.add(sunLight);

	const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362907, 0.4);
	scene.add(hemisphereLight);

	const sunGroup = new THREE.Group();

	const sunSphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.3, 32, 32),
		new THREE.MeshBasicMaterial({ color: 0xffdd44 })
	);
	sunGroup.add(sunSphere);

	const sunGlow = new THREE.Mesh(
		new THREE.SphereGeometry(0.55, 32, 32),
		new THREE.MeshBasicMaterial({
			color: 0xffbb22,
			transparent: true,
			opacity: 0.35
		})
	);
	sunGroup.add(sunGlow);

	const sunRays = new THREE.Mesh(
		new THREE.SphereGeometry(0.8, 32, 32),
		new THREE.MeshBasicMaterial({
			color: 0xffdd33,
			transparent: true,
			opacity: 0.15
		})
	);
	sunGroup.add(sunRays);

	sunGroup.position.copy(sunLight.position);
	scene.add(sunGroup);

	const groundGeo = new THREE.PlaneGeometry(20, 20);
	const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
	const ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.01;
	ground.receiveShadow = true;
	scene.add(ground);

	const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
	scene.add(gridHelper);

	let currentModel: THREE.Group | null = null;
	let autoRotateEnabled = false;
	let sunEnabled = true;

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

		ground.position.y = center.y - maxDim * 0.5 - 0.01;
		gridHelper.position.y = ground.position.y + 0.005;

		const sunDist = maxDim * 3;
		sunLight.position.set(sunDist, sunDist * 1.5, sunDist);
		sunGroup.position.copy(sunLight.position);
		sunLight.shadow.camera.left = -maxDim * 2;
		sunLight.shadow.camera.right = maxDim * 2;
		sunLight.shadow.camera.top = maxDim * 2;
		sunLight.shadow.camera.bottom = -maxDim * 2;
		sunLight.shadow.camera.updateProjectionMatrix();

		const sunScale = Math.max(0.2, maxDim * 0.15);
		sunGroup.scale.setScalar(sunScale);
	}

	function enhanceMaterials(object: THREE.Object3D) {
		object.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				if (child.material) {
					const mats = Array.isArray(child.material) ? child.material : [child.material];
					mats.forEach((mat) => {
						if ('envMap' in mat) {
							mat.envMap = envMap;
							mat.envMapIntensity = 1.2;
							mat.needsUpdate = true;
						}
						if ('metalness' in mat) {
							mat.metalness = Math.min(1, (mat.metalness ?? 0) + 0.1);
						}
						if ('roughness' in mat) {
							mat.roughness = Math.max(0.15, (mat.roughness ?? 0.5) - 0.1);
						}
					});
				}
			}
		});
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
				enhanceMaterials(currentModel);
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
				enhanceMaterials(currentModel);
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

	function setSunEnabled(enabled: boolean) {
		sunEnabled = enabled;
		sunLight.visible = enabled;
		sunGroup.visible = enabled;
		hemisphereLight.visible = enabled;
		if (enabled) {
			ambientLight.intensity = 0.3;
		} else {
			ambientLight.intensity = 0.8;
		}
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
	let time = 0;

	function animate() {
		animationId = requestAnimationFrame(animate);
		time += 0.01;
		controls.update();

		if (sunEnabled) {
			sunGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
			sunRays.scale.setScalar(1 + Math.sin(time * 1.5 + 1) * 0.15);
		}

		renderer.render(scene, camera);
	}

	animate();

	function destroy() {
		cancelAnimationFrame(animationId);
		removeCurrentModel();
		controls.dispose();
		renderer.dispose();
		ground.geometry.dispose();
		groundMat.dispose();
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

	return { loadGlb, loadGlbUrl, destroy, resize, setAutoRotate, setSunEnabled, resetCamera, takeScreenshot };
}
