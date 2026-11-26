import * as THREE from "three";
import { createParticleRepulsion } from "./ParticleRepulsion.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

const TAU = Math.PI * 2;
function random(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
function mineralGeometry(seed) {
  const rand = random(seed), source = new THREE.IcosahedronGeometry(1, 0), unique = new Map();
  const positions = source.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(positions, i);
    const key = p.toArray().map(v => v.toFixed(4)).join();
    if (!unique.has(key)) unique.set(key, p.multiplyScalar(0.78 + rand() * 0.36));
  }
  source.dispose();
  const geometry = new ConvexGeometry([...unique.values()]);
  geometry.center(); geometry.computeBoundingSphere(); geometry.scale(1 / geometry.boundingSphere.radius, 1 / geometry.boundingSphere.radius, 1 / geometry.boundingSphere.radius); geometry.computeBoundingSphere();
  return geometry;
}

export function createFragmentHelix(scene) {
  const motionUniforms = { uParticleTime: { value: 0 }, uParticleMotion: { value: 0 }, uHelixAxis: { value: 0 }, uHelixWidth: { value: 1 }, uHelixPitch: { value: 20 } };
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xadb5bc, metalness: 0, roughness: 0.16,
    transmission: 0.86, thickness: 1, ior: 1.5, attenuationColor: 0x536574, attenuationDistance: 0.24,
    clearcoat: 0.35, clearcoatRoughness: 0.16, envMapIntensity: 1.65,
    iridescence: 0.08, iridescenceIOR: 1.3, iridescenceThicknessRange: [240, 390],
    transparent: false, opacity: 1, depthWrite: true, depthTest: true, flatShading: true,
  });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, motionUniforms);
    shader.vertexShader = 'attribute vec3 aRepulsion; varying float vFragmentThickness;\n' + 'uniform float uParticleTime,uParticleMotion,uHelixAxis,uHelixWidth,uHelixPitch;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      #ifdef USE_INSTANCING
        vec3 center = instanceMatrix[3].xyz;
        vFragmentThickness = length(instanceMatrix[2].xyz) * 1.7;
        float angle = -center.y / uHelixPitch * 6.28318530718 + 0.5 + sin(-center.y * 0.31) * 0.12;
        float spine = uHelixAxis + sin(angle) * uHelixWidth;
        vec3 drift = vec3(
          (center.x - spine) * 0.025 * sin(uParticleTime * 0.32 + center.y * 0.06),
          0.035 * sin(uParticleTime * 0.42 + center.y * 0.13),
          0.020 * sin(uParticleTime * 0.27 + center.y * 0.10)
        ) * uParticleMotion;
        mvPosition += modelViewMatrix * vec4(drift + aRepulsion, 0.0);
        gl_Position = projectionMatrix * mvPosition;
      #endif
    `);
    shader.fragmentShader = 'varying float vFragmentThickness;\n' + shader.fragmentShader;
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n#ifdef USE_INSTANCING\n worldPosition += modelMatrix * vec4(drift + aRepulsion, 0.0);\n#endif');
    shader.fragmentShader = shader.fragmentShader.replace('#include <transmission_fragment>', THREE.ShaderChunk.transmission_fragment.replace('material.thickness = thickness;', 'material.thickness = thickness * vFragmentThickness;'));
  };
  material.customProgramCacheKey = () => 'mahoo-small-mineral-repulsion-v2';
  const meshes = [4101, 8921, 1739].map(seed => {
    const mesh = new THREE.InstancedMesh(mineralGeometry(seed), material, 2048);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage); mesh.frustumCulled = false;
    scene.add(mesh); return mesh;
  });
  const repulsion = createParticleRepulsion(meshes);
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  let width = 1280, height = 720, lengthUnits = 60, placements = [], axis = 0, widthScale = 1;
  const rebuild = ({ width: w, height: h, length, settings }) => {
    width = w; height = h; lengthUnits = length / height * 10;
    const mobile = width <= 768; widthScale = Math.sqrt(Math.min(1, width / height / 1.6));
    const count = Math.min(mobile ? 2400 : 6000, Math.round(settings.density));
    axis = 24 * Math.tan(THREE.MathUtils.degToRad(mobile ? 24 : 22)) * width / height * 0.12;
    const rand = random(71928), grid = new Map(), counts = [0, 0, 0]; placements = [];
    motionUniforms.uHelixAxis.value = axis; motionUniforms.uHelixWidth.value = settings.helixWidth * widthScale; motionUniforms.uHelixPitch.value = settings.helixPitch;
    const cell = 2;
    for (let i = 0; i < count; i++) {
      const primary = i % 31 === 0, size = (primary ? 0.12 + rand() * 0.045 : 0.025 + rand() * 0.07) * settings.particleSize * (mobile ? 0.85 : 1);
      const scale = new THREE.Vector3(size * (0.75 + rand() * 0.3), size * (0.95 + rand() * 0.45), size * (0.7 + rand() * 0.4));
      const radius = Math.max(scale.x, scale.y, scale.z), position = new THREE.Vector3();
      let accepted = false, motionRadius = 0, reservedRadius = radius;
      for (let attempt = 0; attempt < 100; attempt++) {
        const docY = -12 + rand() * (lengthUnits + 24);
        const angle = docY / settings.helixPitch * TAU + 0.5 + Math.sin(docY * 0.31) * 0.12;
        const spread = (rand() + rand() - 1) * settings.scatter;
        const outlier = rand() < 0.18 ? 1.45 : 1;
        position.set(axis + (Math.sin(angle) * settings.helixWidth + spread * outlier) * widthScale,
          -docY, Math.cos(angle) * settings.depth + (rand() - 0.5) * 1.1);
        const spine = axis + Math.sin(angle) * settings.helixWidth * widthScale;
        // Reserve the complete motion envelope, including the maximum UI amplitude.
        motionRadius = (Math.abs(position.x - spine) * 0.025 + 0.06) * 1.5;
        reservedRadius = radius + motionRadius;
        const gx = Math.floor(position.x / cell), gy = Math.floor(position.y / cell), gz = Math.floor(position.z / cell);
        let clear = true;
        for (let x = gx - 1; x <= gx + 1 && clear; x++) for (let y = gy - 1; y <= gy + 1 && clear; y++) for (let z = gz - 1; z <= gz + 1 && clear; z++) {
          for (const other of grid.get(`${x},${y},${z}`) || []) if (position.distanceToSquared(other.position) < (reservedRadius + other.reservedRadius + 0.025) ** 2) { clear = false; break; }
        }
        if (!clear) continue;
        const row = { position: position.clone(), radius, motionRadius, reservedRadius, scale: scale.clone(), variant: i % 3 };
        const key = `${gx},${gy},${gz}`;
        if (!grid.has(key)) grid.set(key, []); grid.get(key).push(row); placements.push(row); accepted = true; break;
      }
      if (!accepted) continue;
      const variant = i % 3, index = counts[variant]++;
      dummy.position.copy(position); dummy.scale.copy(scale); dummy.rotation.set(rand() * TAU, rand() * TAU, rand() * TAU); dummy.updateMatrix();
      meshes[variant].setMatrixAt(index, dummy.matrix);
      const value = 0.68 + rand() * 0.32; tint.setRGB(value * 0.96, value, value * 1.025); meshes[variant].setColorAt(index, tint);
    }
    repulsion.rebuild(placements);
    meshes.forEach((mesh, i) => { mesh.count = counts[i]; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; });
  };
  return {
    meshes, get interaction() { return repulsion.state; }, get placements() { return placements; }, get lengthUnits() { return lengthUnits; },
    rebuild,
    update(camera, scroll, pointer, reveal, reducedMotion, settings, time = 0, interaction = null, delta = 1 / 60) {
      motionUniforms.uParticleTime.value = time; motionUniforms.uParticleMotion.value = reducedMotion ? 0 : settings.particleMotion;
      meshes.forEach(mesh => { mesh.visible = reveal > 0.001; });
      const travel = scroll / height * 10;
      const x = reducedMotion ? 0 : pointer.x * 0.35 * settings.pointerStrength;
      const y = reducedMotion ? 0 : pointer.y * 0.12 * settings.pointerStrength;
      camera.position.set(x, -travel + y, 24);
      camera.lookAt(0, -travel, 0);
      if (reducedMotion) repulsion.reset();
      else repulsion.update(camera, interaction?.pointer, Boolean(interaction?.active), delta, time, settings, axis, widthScale);
      return { travel, angle: 0 };
    },
    dispose() { meshes.forEach(mesh => { scene.remove(mesh); mesh.dispose(); mesh.geometry.dispose(); }); material.dispose(); },
  };
}
