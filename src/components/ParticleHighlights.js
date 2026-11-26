import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Only HDR specular highlights clear this threshold; the dark colormap stays unchanged.
export function createParticleHighlights(renderer, scene, camera) {
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  const render = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .14, .12, 1.1);
  const output = new OutputPass();
  composer.addPass(render); composer.addPass(bloom); composer.addPass(output);
  return {
    resize(width, height) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(width, height); },
    render() { composer.render(); },
    dispose() { bloom.dispose(); output.dispose(); render.dispose(); composer.dispose(); },
  };
}
