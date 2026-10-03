import * as THREE from 'three'

/**
 * Material for one photo face: rounded corners, a thin white border and
 * soft lighting, all drawn in the shader so they can change smoothly
 * while the cube turns into cards.
 */
export function createFaceMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uMap: { value: map },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 0.06 }, // corner radius, as a fraction of the face width
      uBorder: { value: 0.006 }, // white border width, same units
      uLight: { value: 1 }, // 1 = lit like a cube face, 0 = flat card
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec2 uUvScale;
      uniform float uRadius;
      uniform float uBorder;
      uniform float uLight;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;

      float roundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        // Sample and take derivatives first: doing it after a discard
        // can pick the wrong texture detail and draw a seam.
        vec2 uv = (vUv - 0.5) * uUvScale + 0.5;
        if (!gl_FrontFacing) uv.x = 1.0 - uv.x; // never show a mirrored photo
        vec3 color = texture2D(uMap, uv).rgb;

        vec2 p = vUv - 0.5;
        float d = roundedBox(p, vec2(0.5), uRadius);
        float aa = max(fwidth(d) * 0.75, 1e-4);
        float alpha = 1.0 - smoothstep(-aa, aa, d);

        // Soft key light from the upper left, plus a faint sheen.
        vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
        float key = clamp(dot(n, normalize(vec3(-0.35, 0.55, 1.0))), 0.0, 1.0);
        float lit = 0.84 + 0.2 * key;
        float sheen = (1.0 - smoothstep(-0.5, 0.55, vUv.x - vUv.y)) * 0.06;
        color = mix(color, color * lit + sheen, uLight);

        // Thin white border just inside the rounded edge.
        float border = smoothstep(-uBorder - aa, -uBorder + aa, d);
        color = mix(color, vec3(1.0), border * 0.95);

        if (alpha <= 0.0) discard;
        gl_FragColor = vec4(color, alpha * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  })
}
