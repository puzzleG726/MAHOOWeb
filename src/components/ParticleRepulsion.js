import * as THREE from 'three';

// A cursor-centred sphere in the same world space as the fragments. Nothing is drawn.
export function createParticleRepulsion(meshes) {
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const center = new THREE.Vector3(), neutral = new THREE.Vector2();
  const attributes = meshes.map(mesh => {
    const attribute = new THREE.InstancedBufferAttribute(new Float32Array(mesh.instanceMatrix.count * 3), 3);
    attribute.setUsage(THREE.DynamicDrawUsage); mesh.geometry.setAttribute('aRepulsion', attribute);
    return attribute;
  });
  let particles = [], active = false;
  const radius = 1.8, maxDisplacement = 1.25;
  const target = new THREE.Vector3(), difference = new THREE.Vector3();
  return {
    rebuild(placements) {
      const counts = meshes.map(() => 0);
      particles = placements.map(placement => ({ ...placement, index: counts[placement.variant]++, offset: new THREE.Vector3(), velocity: new THREE.Vector3() }));
      attributes.forEach(attribute => { attribute.array.fill(0); attribute.needsUpdate = true; });
    },
    update(camera, pointer, enabled, delta, time, settings, axis, widthScale) {
      active = enabled;
      camera.updateMatrixWorld();
      if (active) { ray.setFromCamera(pointer || neutral, camera); if (!ray.ray.intersectPlane(plane, center)) active = false; }
      // Substeps keep the spring stable after a slow frame without adding a separate clock.
      const steps = Math.max(1, Math.ceil(delta / (1 / 120))), dt = delta / steps;
      for (const p of particles) {
        target.set(0, 0, 0);
        if (active) {
          const angle = -p.position.y / settings.helixPitch * Math.PI * 2 + .5 + Math.sin(-p.position.y * .31) * .12;
          const spine = axis + Math.sin(angle) * settings.helixWidth * widthScale;
          const amplitude = settings.particleMotion;
          difference.set(
            p.position.x + (p.position.x - spine) * .025 * Math.sin(time * .32 + p.position.y * .06) * amplitude - center.x,
            p.position.y + .035 * Math.sin(time * .42 + p.position.y * .13) * amplitude - center.y,
            p.position.z + .020 * Math.sin(time * .27 + p.position.y * .10) * amplitude
          );
          const distance = difference.length();
          if (distance < radius) {
            if (distance < .001) difference.set(Math.sin(p.index * 2.4), Math.cos(p.index * 2.4), .25).normalize();
            else difference.multiplyScalar(1 / distance);
            // Smooth radial falloff; no impulses or perpetual particle simulation.
            const weight = 1 - distance / radius;
            target.copy(difference).multiplyScalar(maxDisplacement * weight * weight * (3 - 2 * weight));
          }
        }
        for (let step = 0; step < steps; step++) {
          p.velocity.addScaledVector(difference.copy(target).sub(p.offset), 48 * dt).multiplyScalar(Math.exp(-14 * dt));
          p.offset.addScaledVector(p.velocity, dt);
        }
        const i = p.index * 3, data = attributes[p.variant].array;
        data[i] = p.offset.x; data[i + 1] = p.offset.y; data[i + 2] = p.offset.z;
      }
      attributes.forEach(attribute => { attribute.needsUpdate = true; });
    },
    reset() {
      active = false;
      particles.forEach(p => { p.offset.set(0, 0, 0); p.velocity.set(0, 0, 0); });
      attributes.forEach(attribute => { attribute.array.fill(0); attribute.needsUpdate = true; });
    },
    get state() { return { active, center: center.toArray(), affected: particles.filter(p => p.offset.lengthSq() > .0001).length, maxOffset: Math.max(0, ...particles.map(p => p.offset.length())) }; },
  };
}
