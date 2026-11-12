import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AIState } from '../types';

export interface HolographicHumanoidProps {
  state: AIState;
  onAvatarClick: () => void;
  audioLevel?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-Screen WebGL Shaders: Cinematic 3D Female Holographic Humanoid
// ─────────────────────────────────────────────────────────────────────────────

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_state;         // 0: idle, 1: listening, 2: processing/thinking, 3: speaking, 4: error
  uniform vec2 u_mouse;
  uniform float u_audio;       // Dynamic audio amplitude (0.0 to 1.0)

  // Smooth polynomial minimum
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Primitive distance functions
  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
  }

  float sdCappedCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  // 2D Rotation
  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Signed distance function for realistic female humanoid bust
  vec2 mapHumanoid(vec3 p) {
    // Subtle natural breathing (chest & head posture)
    float breathe = sin(u_time * 1.6) * 0.016;
    vec3 hp = p - vec3(0.0, 0.08 + breathe * 0.8, 0.0);

    // Responsive head tracking toward user mouse cursor
    vec2 targetLook = (u_mouse - 0.5) * 0.45;
    hp.xz = rot(targetLook.x * 0.55) * hp.xz;
    hp.yz = rot(-targetLook.y * 0.35) * hp.yz;

    // --- 1. CRANIUM, FOREHEAD & FEMININE CONTOURS ---
    float cranium = sdEllipsoid(hp - vec3(0.0, 0.36, -0.02), vec3(0.25, 0.28, 0.26));

    // Feminine jawline tapered to elegant chin
    vec3 jawP = hp - vec3(0.0, 0.14, 0.05);
    jawP.x = abs(jawP.x);
    float jaw = sdEllipsoid(jawP - vec3(0.085, 0.06, 0.0), vec3(0.12, 0.20, 0.17));
    float chin = sdSphere(hp - vec3(0.0, 0.075, 0.155), 0.078);

    // Delicate cheekbones
    vec3 cheekP = hp - vec3(0.0, 0.26, 0.12);
    cheekP.x = abs(cheekP.x);
    float cheek = sdSphere(cheekP - vec3(0.13, 0.0, 0.0), 0.088);

    // Smooth anatomical blending
    float head = smin(cranium, jaw, 0.09);
    head = smin(head, chin, 0.08);
    head = smin(head, cheek, 0.07);

    // Sculpted nose bridge and tip
    vec3 noseP = hp - vec3(0.0, 0.28, 0.23);
    float noseBridge = sdEllipsoid(noseP, vec3(0.024, 0.075, 0.045));
    float noseTip = sdSphere(hp - vec3(0.0, 0.225, 0.26), 0.027);
    float nose = smin(noseBridge, noseTip, 0.022);
    head = smin(head, nose, 0.032);

    // --- 2. MOUTH & LIP SYNCHRONIZATION ---
    float mouthOpen = 0.0;
    if (u_state == 3) {
      // Natural speech modulation
      mouthOpen = abs(sin(u_time * 14.0)) * 0.024 + u_audio * 0.032;
    }
    vec3 lipP = hp - vec3(0.0, 0.14, 0.215);
    float upperLip = sdEllipsoid(lipP - vec3(0.0, 0.012 + mouthOpen * 0.35, 0.0), vec3(0.058, 0.015, 0.026));
    float lowerLip = sdEllipsoid(lipP - vec3(0.0, -0.015 - mouthOpen * 0.75, 0.0), vec3(0.054, 0.019, 0.027));
    float lips = min(upperLip, lowerLip);
    head = smin(head, lips, 0.02);

    // Eye sockets
    vec3 eyeSockP = hp - vec3(0.0, 0.32, 0.20);
    eyeSockP.x = abs(eyeSockP.x) - 0.09;
    float eyeSocket = sdSphere(eyeSockP, 0.048);
    head = max(head, -eyeSocket * 0.85);

    // --- 3. LUMINOUS OCULAR EYES ---
    vec3 eyeP = hp - vec3(0.0, 0.32, 0.195);
    eyeP.x = abs(eyeP.x) - 0.088;
    eyeP.xz = rot(targetLook.x * 0.45) * eyeP.xz;
    float eyes = sdSphere(eyeP, 0.030);

    // --- 4. HOLOGRAPHIC HAIR STRANDS / CYBERNETIC COWL ---
    vec3 hairP = hp - vec3(0.0, 0.36, -0.06);
    float cowl = sdEllipsoid(hairP, vec3(0.265, 0.295, 0.275));
    float cowlFrontCut = hp.z - 0.07;
    cowl = max(cowl, -cowlFrontCut);

    vec3 crestP = hp - vec3(0.0, 0.44, -0.15);
    crestP.x = abs(crestP.x);
    float crest = sdEllipsoid(crestP - vec3(0.08, 0.0, 0.0), vec3(0.05, 0.18, 0.24));
    cowl = smin(cowl, crest, 0.05);

    // --- 5. NECK, COLLARBONE & UPPER TORSO ---
    vec3 neckP = p - vec3(0.0, -0.01 + breathe * 0.4, -0.02);
    float neck = sdCappedCylinder(neckP, 0.16, 0.098);

    vec3 torsoP = p - vec3(0.0, -0.36 + breathe, 0.0);
    float torso = sdEllipsoid(torsoP, vec3(0.35, 0.26, 0.23));

    vec3 collarP = torsoP - vec3(0.0, 0.14, 0.09);
    collarP.x = abs(collarP.x);
    float collar = sdEllipsoid(collarP - vec3(0.15, 0.0, 0.0), vec3(0.16, 0.06, 0.09));
    torso = smin(torso, collar, 0.065);

    vec3 shoulderP = torsoP - vec3(0.0, 0.10, -0.05);
    shoulderP.x = abs(shoulderP.x) - 0.35;
    float shoulder = sdSphere(shoulderP, 0.14);
    torso = smin(torso, shoulder, 0.08);

    // Combined body
    float body = smin(neck, torso, 0.06);

    // Sternum energy focal point (Chest Arc Reactor Matrix)
    vec3 sternumP = torsoP - vec3(0.0, 0.03, 0.20);
    float sternumEnergy = sdSphere(sternumP, 0.055);

    // --- MATERIAL SEPARATION ---
    float d = head;
    float mat = 1.0;

    if (body < d) {
      d = body;
      mat = 3.0;
    }
    if (cowl < d) {
      d = cowl;
      mat = 2.0;
    }
    if (eyes < d) {
      d = eyes;
      mat = 4.0;
    }
    if (sternumEnergy < d) {
      d = sternumEnergy;
      mat = 5.0;
    }

    return vec2(d, mat);
  }

  // Calculate Normal vector
  vec3 calcNormal(vec3 p) {
    const float eps = 0.002;
    vec2 h = vec2(eps, 0.0);
    return normalize(vec3(
      mapHumanoid(p + h.xyy).x - mapHumanoid(p - h.xyy).x,
      mapHumanoid(p + h.yxy).x - mapHumanoid(p - h.yxy).x,
      mapHumanoid(p + h.yyx).x - mapHumanoid(p - h.yyx).x
    ));
  }

  void main() {
    // Normalized device coordinates (-1.0 to 1.0)
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Camera setup centered on upper humanoid
    vec3 ro = vec3(0.0, 0.15, 1.75);
    vec3 ta = vec3(0.0, 0.12, 0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(p.x * uu + p.y * vv + 1.95 * ww);

    // Dynamic State Color Palettes: Electric Blue, Cyan, Violet, Gold
    vec3 cyanColor = vec3(0.0, 0.94, 1.0);        // #00f0ff Electric Cyan
    vec3 blueColor = vec3(0.08, 0.45, 1.0);       // #1473ff Electric Blue
    vec3 violetColor = vec3(0.68, 0.28, 1.0);     // #ad47ff Deep Violet
    vec3 goldColor = vec3(1.0, 0.82, 0.38);       // #ffd161 Cosmic Gold

    vec3 primaryHolo = cyanColor;
    vec3 secondaryHolo = violetColor;
    float stateGlow = 1.0;

    if (u_state == 1) {
      // LISTENING: Bright Cyan & Electric Blue + Acoustic Pulse
      primaryHolo = vec3(0.15, 0.85, 1.0);
      secondaryHolo = blueColor;
      stateGlow = 1.5 + u_audio * 1.8;
    } else if (u_state == 2) {
      // THINKING / PROCESSING: Rapid Swirling Violet Energy
      primaryHolo = violetColor;
      secondaryHolo = cyanColor;
      stateGlow = 1.8 + sin(u_time * 8.0) * 0.5;
    } else if (u_state == 3) {
      // SPEAKING: Harmonized Cyan & Vocal Emerald Matrix
      primaryHolo = vec3(0.05, 0.95, 0.75);
      secondaryHolo = cyanColor;
      stateGlow = 1.6 + u_audio * 2.0;
    } else if (u_state == 4) {
      // ERROR: Restrained Crimson Alert
      primaryHolo = vec3(0.95, 0.25, 0.25);
      secondaryHolo = vec3(0.75, 0.1, 0.3);
      stateGlow = 1.4 + sin(u_time * 6.0) * 0.4;
    }

    // --- BACKGROUND: DEEP MIDNIGHT VOID & HOLOGRAPHIC AMBIENCE ---
    vec3 col = vec3(0.005, 0.012, 0.024);

    // Subtle volumetric holographic aura centered behind humanoid
    float auraDist = length(p - vec2(0.0, 0.12));
    float aura = exp(-auraDist * 1.7) * 0.38;
    col += mix(secondaryHolo, primaryHolo, 0.65) * aura * stateGlow;

    // Concentric holographic circular interfaces behind humanoid
    float ringPhase = u_time * (u_state == 2 ? 3.5 : 0.8);
    float ring1 = abs(sin(auraDist * 16.0 - ringPhase));
    float ringMask = smoothstep(0.70, 0.72, auraDist) * smoothstep(1.25, 0.90, auraDist);
    col += primaryHolo * (1.0 - ring1) * 0.12 * ringMask * stateGlow;

    // --- VOLUMETRIC GOLDEN & CYAN COSMIC PARTICLES ---
    float particleAcc = 0.0;
    for (int i = 0; i < 22; i++) {
      float fi = float(i);
      vec3 partPos = vec3(
        sin(fi * 1.3 + u_time * 0.35) * 0.95,
        cos(fi * 1.7 + u_time * 0.32) * 0.75 + 0.1,
        sin(fi * 2.1 + u_time * 0.45) * 0.6 + 0.3
      );
      float dPart = length(ro + rd * dot(partPos - ro, rd) - partPos);
      particleAcc += exp(-dPart * 48.0) * (0.045 + 0.03 * sin(fi + u_time * 3.0));
    }
    col += mix(goldColor, primaryHolo, 0.3) * particleAcc * (u_state == 2 ? 2.4 : 1.2);

    // --- RAYMARCHING HOLOGRAPHIC HUMANOID (VOLUMETRIC TRANSPARENCY) ---
    float depth = 0.0;
    float holoDensity = 0.0;
    vec3 holoAcc = vec3(0.0);
    vec3 hitNorm = vec3(0.0);
    float hitMat = 0.0;

    for (int i = 0; i < 72; i++) {
      vec3 pos = ro + rd * depth;
      vec2 res = mapHumanoid(pos);

      // Accumulate transparent volumetric glow as ray approaches boundary
      if (res.x < 0.045) {
        float edge = clamp((0.045 - res.x) / 0.045, 0.0, 1.0);
        holoDensity += edge * 0.065;
      }

      if (res.x < 0.002) {
        hitNorm = calcNormal(pos);
        hitMat = res.y;

        // Fresnel Rim Glow (Holographic edge intensity)
        float fresnel = pow(clamp(1.0 - abs(dot(-rd, hitNorm)), 0.0, 1.0), 2.2);

        // Scanline Interference
        float scanline = sin(pos.y * 150.0 + u_time * 5.0) * 0.5 + 0.5;

        // Glowing Fiber-Optic Neural Threads
        float neuralThread = step(0.965, sin(pos.y * 55.0 + pos.x * 35.0 + u_time * 2.5));
        neuralThread += step(0.975, sin(pos.z * 60.0 - pos.y * 40.0 - u_time * 3.0));

        // Material Color Calculation
        vec3 surfaceCol = primaryHolo;

        if (hitMat == 1.0) {
          // FACE: Translucent holographic porcelain skin with subtle violet depth
          surfaceCol = mix(primaryHolo, secondaryHolo, fresnel * 0.7);
          surfaceCol += cyanColor * scanline * 0.22;
          surfaceCol += goldColor * neuralThread * 0.85 * stateGlow;

        } else if (hitMat == 2.0) {
          // CYBERNETIC COWL: Deeper violet-blue fiber strands
          surfaceCol = mix(secondaryHolo, primaryHolo, 0.4);
          surfaceCol += primaryHolo * fresnel * 0.9;

        } else if (hitMat == 3.0) {
          // TORSO & SHOULDERS: Holographic contour mesh with chest illumination
          surfaceCol = mix(blueColor, primaryHolo, fresnel);
          surfaceCol += primaryHolo * scanline * 0.35;

        } else if (hitMat == 4.0) {
          // LUMINOUS OCULAR EYES: Intense cyan core with natural blinking
          float blink = step(0.05, fract(u_time * 0.23));
          surfaceCol = (cyanColor * 3.5 + vec3(0.5, 0.8, 1.0) * 2.0) * blink * stateGlow;

        } else if (hitMat == 5.0) {
          // STERNUM ENERGY FOCAL POINT (Chest Core)
          float pulse = sin(u_time * 6.5) * 0.3 + 0.7;
          surfaceCol = (primaryHolo * 3.0 + goldColor * 1.5) * pulse * stateGlow;
        }

        // Composite holographic surface with volumetric glow
        holoAcc += surfaceCol * (fresnel * 1.45 + 0.35 + scanline * 0.15) * stateGlow;
        break;
      }

      depth += max(res.x * 0.82, 0.014);
      if (depth > 4.5) break;
    }

    // Blend Accumulated Hologram over Cosmic Background
    col += holoAcc;
    col += primaryHolo * holoDensity * 0.45 * stateGlow;

    // Edge Chromatic Vignette
    col *= clamp(1.4 - length(p) * 0.45, 0.0, 1.0);

    // Tone mapping
    col = pow(col, vec3(0.95));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const HolographicHumanoid: React.FC<HolographicHumanoidProps> = ({
  state,
  onAvatarClick,
  audioLevel = 0.0,
  isListening = false,
  isSpeaking = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number | null>(null);

  // Map state to shader numeric code
  const stateCodeMap: Record<AIState, number> = {
    ready: 0,
    idle: 0,
    listening: 1,
    processing: 2,
    thinking: 2,
    executing: 2,
    speaking: 3,
    completed: 0,
    error: 4,
  };
  const stateCode = stateCodeMap[state] ?? 0;

  // Mouse Parallax movement handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0.5, y: 0.5 });
  }, []);

  // WebGL Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext('webgl', { antialias: true, alpha: false }) as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      setIsWebGLSupported(false);
      return;
    }

    setIsWebGLSupported(true);

    const compileShader = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) {
      setIsWebGLSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setIsWebGLSupported(false);
      return;
    }
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setIsWebGLSupported(false);
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const quadVertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uStateLoc = gl.getUniformLocation(program, 'u_state');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const uAudioLoc = gl.getUniformLocation(program, 'u_audio');

    let startTime = performance.now();
    let currentMouse = { x: 0.5, y: 0.5 };

    const render = () => {
      if (!canvas || !gl) return;

      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(displayWidth * dpr);
      const height = Math.floor(displayHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      currentMouse.x += (mousePos.x - currentMouse.x) * 0.07;
      currentMouse.y += (mousePos.y - currentMouse.y) * 0.07;

      const elapsed = (performance.now() - startTime) * 0.001;

      // Simulated acoustic energy when speaking or listening
      let simAudio = audioLevel;
      if (state === 'speaking') {
        simAudio = 0.35 + Math.sin(elapsed * 16.0) * 0.28 + Math.cos(elapsed * 24.0) * 0.18;
      } else if (state === 'listening') {
        simAudio = 0.2 + Math.sin(elapsed * 10.0) * 0.15;
      }

      gl.useProgram(program);
      gl.uniform2f(uResLoc, width, height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1i(uStateLoc, stateCode);
      gl.uniform2f(uMouseLoc, currentMouse.x, currentMouse.y);
      gl.uniform1f(uAudioLoc, Math.max(0.0, simAudio));

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (vbo) gl.deleteBuffer(vbo);
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      if (program) gl.deleteProgram(program);
    };
  }, [state, stateCode, mousePos, audioLevel]);

  // Dynamic state color for HUD elements
  const stateColor = {
    ready: '#00f0ff',
    idle: '#00f0ff',
    listening: '#38bdf8',
    processing: '#a855f7',
    thinking: '#c084fc',
    executing: '#3b82f6',
    speaking: '#10b981',
    completed: '#10b981',
    error: '#ef4444',
  }[state] || '#00f0ff';

  return (
    <div
      className="hologram-stage-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onAvatarClick}
    >
      {/* 1. Underlying 3D WebGL Shader Canvas */}
      {isWebGLSupported ? (
        <canvas ref={canvasRef} className="hologram-canvas" />
      ) : (
        /* Vector Fallback */
        <div className="hologram-fallback-stage">
          <svg
            width="340"
            height="440"
            viewBox="0 0 340 440"
            fill="none"
            className={`fallback-holo-svg state-${state}`}
          >
            <circle cx="170" cy="200" r="150" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 8" opacity="0.35" />
            <circle cx="170" cy="200" r="120" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="12 6" opacity="0.45" />
            <circle cx="170" cy="200" r="90" stroke="#00f0ff" strokeWidth="1" opacity="0.5" />
            <path
              d="M 170 80 Q 215 80 220 135 Q 220 185 195 215 L 170 235 L 145 215 Q 120 185 120 135 Q 125 80 170 80 Z"
              stroke="#00f0ff"
              strokeWidth="2"
              fill="rgba(0, 240, 255, 0.05)"
            />
            <circle cx="152" cy="138" r="5" fill="#00f0ff" />
            <circle cx="188" cy="138" r="5" fill="#00f0ff" />
            <path d="M 160 175 Q 170 172 180 175 Q 170 180 160 175 Z" fill="#a855f7" />
            <path
              d="M 90 320 Q 170 265 250 320 L 270 410 L 70 410 Z"
              stroke="#00f0ff"
              strokeWidth="2"
              fill="rgba(168, 85, 247, 0.05)"
            />
            <circle cx="170" cy="330" r="22" stroke="#00f0ff" strokeWidth="2.5" fill="#a855f7" opacity="0.8" />
          </svg>
          <span className="fallback-badge">HOLOGRAPHIC VECTOR ENGINE</span>
        </div>
      )}

      {/* 2. Holographic Chest Emblem Text matching Reference Screenshot */}
      <div className="holo-chest-emblem-wrapper" style={{ pointerEvents: 'none' }}>
        <span className="holo-chest-text" style={{ color: '#ffffff', textShadow: `0 0 15px ${stateColor}, 0 0 30px ${stateColor}` }}>
          JARVIS
        </span>
      </div>

      {/* 3. Concentric 3D Orbital HUD Rings surrounding the avatar */}
      <div className="holo-orbital-rings-stage" style={{ pointerEvents: 'none' }}>
        {/* Ring 1 - Outer Tilted Disc */}
        <div
          className="orbital-ring ring-outer"
          style={{ borderColor: `${stateColor}40` }}
        >
          <span className="ring-tick tick-top"></span>
          <span className="ring-tick tick-bottom"></span>
          <span className="ring-tick tick-left"></span>
          <span className="ring-tick tick-right"></span>
        </div>

        {/* Ring 2 - Middle Reverse Rotating Arc Disc */}
        <div
          className="orbital-ring ring-mid"
          style={{ borderColor: `${stateColor}60` }}
        ></div>

        {/* Ring 3 - Audio-reactive Inner Halo */}
        <div
          className={`orbital-ring ring-inner ${isListening || isSpeaking ? 'ring-pulse' : ''}`}
          style={{
            borderColor: stateColor,
            boxShadow: `0 0 20px ${stateColor}40, inset 0 0 15px ${stateColor}20`,
          }}
        ></div>
      </div>

      {/* 3. Vertical Holographic Laser Scanning Plane */}
      <div className="holo-scanning-laser-line"></div>

      {/* 4. Ambient Rising Holographic Sparkles & Particle Dust */}
      <div className="holo-particles-field" style={{ pointerEvents: 'none' }}>
        <span className="particle p1"></span>
        <span className="particle p2"></span>
        <span className="particle p3"></span>
        <span className="particle p4"></span>
        <span className="particle p5"></span>
        <span className="particle p6"></span>
        <span className="particle p7"></span>
        <span className="particle p8"></span>
      </div>

      {/* 5. Holographic Projector Pedestal Base on the Desk (Reference Image Match) */}
      <div className="holo-pedestal-base">
        {/* Vertical light projector cone */}
        <div className="pedestal-light-cone" style={{ background: `linear-gradient(to top, ${stateColor}35 0%, transparent 80%)` }}></div>
        {/* Outer glowing projector ring with tick marks */}
        <div className="pedestal-ring pedestal-ring-outer" style={{ borderColor: `${stateColor}60` }}></div>
        {/* Middle counter-rotating ring with segmented dash */}
        <div className="pedestal-ring pedestal-ring-mid" style={{ borderColor: stateColor }}></div>
        {/* Core luminous projector disc */}
        <div
          className="pedestal-emitter-core"
          style={{
            background: `radial-gradient(circle, ${stateColor} 0%, ${stateColor}60 40%, transparent 80%)`,
            boxShadow: `0 0 35px ${stateColor}`,
          }}
        >
          <div className="emitter-center-light"></div>
        </div>
      </div>
    </div>
  );
};
