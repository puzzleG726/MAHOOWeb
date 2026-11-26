// Both scenes share linear colours and convert once at output.
export const metalVertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;
export const metalFragmentShader = `
  uniform float uTime, uGrid, uPulse, uTravel;
  uniform vec2 uResolution, uPointer;
  varying vec2 vUv;
  float lineGrid(vec2 p) {
    vec2 width = max(fwidth(p), vec2(0.001));
    vec2 g = abs(fract(p - 0.5) - 0.5) / width;
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.075;
    p += vec2(sin(uTravel * 0.48) * 0.055, cos(uTravel * 0.34) * 0.02);
    // A broad parallax layer and a local bend move at different depths.
    vec2 pointer = uPointer * vec2(aspect, 1.0) * 0.5;
    vec2 offset = p - pointer;
    float influence = exp(-dot(offset, offset) * 3.2);
    p += uPointer * vec2(0.075, 0.055);
    p += uPointer * influence * 0.12;
    p += vec2(-offset.y, offset.x) * influence * dot(uPointer, vec2(0.16, -0.12));
    float fold = p.x * 0.95 + p.y * 0.66 + sin(p.y * 3.7 + t + uPointer.x * 0.32) * 0.19;
    fold += sin(p.x * 2.2 - t * 0.7 + uPointer.y * 0.28) * 0.17;
    float ribbon = exp(-pow((fold - 0.43 * sin(t * 0.4)) * 11.0, 2.0));
    float edge = exp(-pow((fold + 0.08 - 0.43 * sin(t * 0.4)) * 29.0, 2.0));
    float broad = 0.5 + 0.5 * sin(fold * 4.0 + 1.0);
    vec3 col = vec3(0.009 + broad * 0.008 + ribbon * 0.035 + edge * 0.022);
    col *= mix(0.75, 1.0, smoothstep(0.08, 0.85, length(p)));
    // Thin-film colour lives only on the narrow reflection, never across the black base.
    float film = p.y * 2.4 - p.x * 1.3 + fold * 4.0 + t * 0.18 + uPointer.x * 0.3 + uTravel * 0.22;
    vec3 iridescence = 0.5 + 0.5 * cos(film + vec3(0.0, 2.1, 4.2));
    float sheen = ribbon * 0.007 + edge * 0.009;
    col += (iridescence - vec3(0.38)) * sheen;
    if (uGrid > 0.0) {
      vec2 screen = uv * uResolution + uPointer * 18.0;
      float fine = lineGrid(screen / 72.0);
      float major = lineGrid(screen / 288.0);
      vec2 q = vec2(p.x, (uv.y - 0.12));
      vec2 perspective = vec2(q.x / max(q.y + 0.55, 0.12), 1.0 / max(q.y + 0.55, 0.12)) * 5.0;
      float farGrid = lineGrid(perspective) * (1.0 - smoothstep(0.05, 0.48, uv.y)) * 0.5;
      float outer = smoothstep(0.12, 0.8, length(p));
      col = mix(col, vec3(0.002), 0.3 * uGrid);
      col += (fine * 0.01 + major * 0.015 + farGrid * 0.018) * outer * uGrid * (1.0 + uPulse * 1.4);
      vec2 dotCell = mod(screen + 144.0, 288.0) - 144.0;
      col += (1.0 - smoothstep(0.6, 1.4, length(dotCell))) * 0.026 * outer * uGrid;
    }
    float upperMist = exp(-pow((uv.y - 1.05) * 5.5, 2.0));
    float lowerMist = exp(-pow((uv.y + 0.06) * 5.0, 2.0));
    float spread = 0.5 + 0.5 * cos(uv.x * 4.0 + uTravel * 0.22);
    col += upperMist * vec3(0.0022, 0.0029, 0.0035) * (0.45 + spread * 0.55);
    col += lowerMist * vec3(0.0033, 0.0025, 0.0036) * (1.0 - spread * 0.4);
    col *= 1.0 - 0.35 * smoothstep(0.35, 1.0, length((uv - 0.5) * 1.4));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
