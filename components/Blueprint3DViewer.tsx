
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LoadingSpinnerIcon, CloseIcon } from './icons';

interface HotspotData {
    id: number;
    position: [number, number, number];
    title: string;
    description: string;
}

// Data for interactive hotspots in the 3D model
const hotspots: HotspotData[] = [
    { id: 1, position: [0, 1.8, 0.45], title: 'Core Video Router', description: 'High-density 12G-SDI matrix handling 4K HDR signal distribution across the facility.' },
    { id: 2, position: [-1.2, 1.5, 0.45], title: 'Spatial Audio Processor', description: 'Dedicated DSP engine for Dolby Atmos rendering and Dante network bridging.' },
    { id: 3, position: [1.2, 1.2, 0.45], title: 'Broadcast Controller', description: 'Redundant automation server managing signal flow, tally, and device logic.' },
    { id: 4, position: [0, 0.5, 0.45], title: 'Network Spine', description: '100GbE managed switch aggregating AV-over-IP streams and control data.' },
];

export const Blueprint3DViewer: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        
        // --- Init Scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0b1121'); // Very dark blue/slate
        scene.fog = new THREE.Fog('#0b1121', 10, 50);

        // --- Camera Setup ---
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(6, 4, 6);
        camera.lookAt(0, 1, 0);
        
        // --- Renderer Setup ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // --- Orbit Controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit vertical angle
        controls.target.set(0, 1, 0);
        controlsRef.current = controls;

        // --- Scene Objects ---
        
        // 1. Grid Helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x1f2937);
        if (gridHelper.material instanceof THREE.Material) {
             gridHelper.material.opacity = 0.2;
             gridHelper.material.transparent = true;
        }
        scene.add(gridHelper);

        // 2. Procedural Racks Generation
        const rackGroup = new THREE.Group();
        const rackGeo = new THREE.BoxGeometry(1, 2.2, 0.8);
        const rackEdges = new THREE.EdgesGeometry(rackGeo);
        
        const rackLineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
        const rackFillMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
        
        // Helper to create a single rack instance
        const createRack = (x: number, z: number, rotationY: number = 0) => {
            const wrapper = new THREE.Group();
            wrapper.position.set(x, 1.1, z);
            wrapper.rotation.y = rotationY;
            
            // Wireframe
            const lines = new THREE.LineSegments(rackEdges, rackLineMat);
            wrapper.add(lines);
            
            // Solid body
            const fill = new THREE.Mesh(rackGeo, rackFillMat);
            wrapper.add(fill);
            
            // Procedural Blinking Lights
            for(let i=0; i<8; i++) {
                const color = Math.random() > 0.7 ? 0xff0000 : (Math.random() > 0.5 ? 0xffff00 : 0x00ff00);
                const light = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.05, 0.05), 
                    new THREE.MeshBasicMaterial({ color })
                );
                light.position.set(0, -0.8 + (i * 0.25), 0.41);
                wrapper.add(light);
            }

            rackGroup.add(wrapper);
        };

        // Layout Racks in the scene
        createRack(0, 0);       // Center
        createRack(-1.2, 0);    // Left
        createRack(1.2, 0);     // Right
        createRack(0, -2, Math.PI); // Back

        scene.add(rackGroup);

        // 3. Floor Glow Effect
        const floorGeo = new THREE.PlaneGeometry(8, 8);
        const floorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.03, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        scene.add(floor);

        // 4. Interactive Hotspots
        const hotspotGroup = new THREE.Group();
        hotspots.forEach(h => {
             const geometry = new THREE.SphereGeometry(0.08, 16, 16);
             const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
             const mesh = new THREE.Mesh(geometry, material);
             mesh.position.set(...h.position);
             mesh.userData = { id: h.id }; // Store ID for raycasting
             
             // Pulse Ring Visual
             const ringGeo = new THREE.RingGeometry(0.12, 0.15, 32);
             const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
             const ring = new THREE.Mesh(ringGeo, ringMat);
             ring.userData = { isRing: true };
             mesh.add(ring);

             hotspotGroup.add(mesh);
        });
        scene.add(hotspotGroup);

        // --- Interaction Logic (Raycasting) ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event: MouseEvent) => {
            if (!mountRef.current) return;
            
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(hotspotGroup.children, false);

            if (intersects.length > 0) {
                const id = intersects[0].object.userData.id;
                const hotspot = hotspots.find(h => h.id === id);
                if (hotspot) {
                    setSelectedHotspot(hotspot);
                    // Pause rotation when inspecting
                    if (controlsRef.current) {
                        controlsRef.current.autoRotate = false;
                    }
                }
            }
        };

        renderer.domElement.addEventListener('click', handleClick);


        // --- Resize Handler ---
        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(mountRef.current);

        // --- Animation Loop ---
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();
            
            // Animate rings to face camera (Billboard effect) and pulse
            hotspotGroup.children.forEach(mesh => {
                mesh.children.forEach(child => {
                    if (child.userData.isRing) {
                        child.lookAt(camera.position);
                        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
                        child.scale.set(scale, scale, scale);
                    }
                });
            });

            renderer.render(scene, camera);
        };
        animate();
        setIsLoading(false);

        // --- Cleanup (CRITICAL for Performance) ---
        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            
            if (renderer.domElement) {
                renderer.domElement.removeEventListener('click', handleClick);
            }
            
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }

            // Dispose Three.js resources to prevent memory leaks
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    } else if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    }
                }
            });
            renderer.dispose();
        };
    }, []);

    const handleClosePopup = () => {
        setSelectedHotspot(null);
        if (controlsRef.current) {
            controlsRef.current.autoRotate = true;
        }
    };

    return (
        <div className="relative w-full h-[500px] bg-[#0b1121] rounded-xl overflow-hidden border border-cyan-500/30 shadow-2xl group transition-all duration-300 hover:border-cyan-500/60">
            <div ref={mountRef} className="w-full h-full cursor-pointer" />
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/20 pointer-events-none z-10">
                <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider mb-1">Schematic View</h4>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Standard Broadcast Core v3.0</p>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
                <div className="text-cyan-500/80 text-xs bg-black/40 px-2 py-1 rounded">
                    Click Blue Markers to Inspect • Drag to Rotate
                </div>
                <div className="text-cyan-900/40 text-[10px] uppercase font-bold tracking-widest">
                    TAG // 3D RENDER
                </div>
            </div>
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b1121] z-20">
                    <LoadingSpinnerIcon />
                </div>
            )}

            {selectedHotspot && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md border border-cyan-500 rounded-lg p-6 max-w-sm w-[90%] shadow-[0_0_50px_rgba(0,255,255,0.2)] z-30 animate-scale-in-pop">
                    <button 
                        onClick={handleClosePopup} 
                        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close details"
                    >
                        <CloseIcon />
                    </button>
                    <div className="pr-6">
                        <h4 className="text-xl font-bold text-cyan-400 mb-2 uppercase tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                            {selectedHotspot.title}
                        </h4>
                        <div className="h-px w-12 bg-cyan-500 mb-3"></div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {selectedHotspot.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
