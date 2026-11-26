// Independent scene configuration. Removing SceneControls does not affect rendering.
export const SCENE_DEFAULTS = Object.freeze({ density: 800, particleSize: 1, helixWidth: 5, helixPitch: 20, depth: 0.5, scatter: 4, gradientStrength: 0.55, pointerStrength: 2, iridescence: 0.08, grain: 0.04, particleMotion: 1 });
const listeners = new Set();
let settings = { ...SCENE_DEFAULTS };
export const getSceneSettings = () => settings;
export const subscribeSceneSettings = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export function updateSceneSettings(patch) {
  settings = { ...settings, ...patch };
  listeners.forEach(listener => listener(settings));
}
export const resetSceneSettings = () => updateSceneSettings(SCENE_DEFAULTS);
