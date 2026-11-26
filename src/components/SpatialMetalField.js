import * as THREE from "three";

// A continuous opaque, corrugated enclosure. Its highlights and perspective are
// evaluated by the same camera/environment as the solid mineral instances.
export function createSpatialMetalField(scene) {
  const uniforms = { uFieldTime: { value: 0 }, uFieldPointer: { value: new THREE.Vector2() }, uFieldTravel: { value: 0 }, uFieldCenter: { value: 0 } };
  const material = new THREE.MeshPhysicalMaterial({ color: 0x34383e, metalness: 0.96, roughness: 0.23, envMapIntensity: 1.0,
    iridescence: 0.48, iridescenceIOR: 1.3, iridescenceThicknessRange: [240, 390],
    side: THREE.BackSide, depthTest: true, depthWrite: true, transparent: false,
  });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `uniform float uFieldTime, uFieldTravel, uFieldCenter; uniform vec2 uFieldPointer; varying vec3 vFieldPosition;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      float band = exp(-pow((position.y + uFieldCenter + uFieldTravel) / 9.0, 2.0));
      transformed.xz += normalize(position.xz) * dot(normalize(position.xz), uFieldPointer) * band * 0.7;
      vFieldPosition = vec3(transformed.x, transformed.y + uFieldCenter, transformed.z);
    `);
    shader.fragmentShader = 'varying vec3 vFieldPosition; uniform float uFieldTime;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      float a = atan(vFieldPosition.x, vFieldPosition.z);
      float fold = sin(a * 4.0 + vFieldPosition.y * 0.2 + sin(vFieldPosition.y * 0.13) * 0.6);
      diffuseColor.rgb *= 0.55 + 0.45 * smoothstep(-0.7, 1.0, fold);
    `);
  };
  material.customProgramCacheKey = () => 'mahoo-spatial-metal-v1';
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material); scene.add(mesh);
  let lastLength = -1;
  return {
    mesh,
    rebuild(length) {
      if (Math.abs(length - lastLength) < 0.01) return;
      lastLength = length;
      const geometry = new THREE.CylinderGeometry(34, 34, length + 60, 96, Math.max(96, Math.ceil(length * 3)), true);
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i), angle = Math.atan2(x, z);
        const radius = 34 + 2.8 * Math.sin(angle * 3 + y * 0.2) + 1.3 * Math.sin(angle * 6 - y * 0.14);
        position.setXYZ(i, Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      }
      geometry.computeVertexNormals(); geometry.computeBoundingSphere(); mesh.geometry.dispose(); mesh.geometry = geometry;
      mesh.position.y = -length / 2; uniforms.uFieldCenter.value = mesh.position.y;
    },
    update(time, pointer, travel) { uniforms.uFieldTime.value = time; uniforms.uFieldPointer.value.copy(pointer); uniforms.uFieldTravel.value = travel; },
    dispose() { scene.remove(mesh); mesh.geometry.dispose(); material.dispose(); },
  };
}
