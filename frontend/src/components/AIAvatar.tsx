import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AIState } from '../types';

export interface AIAvatarProps {
  state: AIState;
  onAvatarClick: () => void;
  greeting?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// WebGL Shaders — Photorealistic 3D Female Humanoid Android (Raymarched)
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
  uniform int u_state;         // 0: idle, 1: listening, 2: processing, 3: speaking, 4: error
  uniform vec2 u_mouse;
  uniform float u_audio;       // 0.0 to 1.0 audio energy

  // Polynomial smooth minimum for organic 3D blending
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Primitive Distance Functions
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

  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }

  // Rotation matrix
  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Map Scene: Returns vec2(distance, material_id)
  // Material IDs:
  // 1.0 = Face synthetic skin / porcelain titanium
  // 2.0 = Metallic cybernetic armor (navy/dark chrome)
  // 3.0 = Glowing cyan circuits & Arc Reactor core
  // 4.0 = Glowing ocular eyes
  // 5.0 = Gold / cyan titanium trims
  vec2 mapScene(vec3 p) {
    // Parallax head pose based on mouse and subtle breathing
    float breathe = sin(u_time * 1.5) * 0.015;
    vec3 hp = p - vec3(0.0, 0.05 + breathe, 0.0);

    // Subtle head turn toward mouse
    vec2 targetLook = (u_mouse - 0.5) * 0.35;
    hp.xz = rot(targetLook.x * 0.6) * hp.xz;
    hp.yz = rot(-targetLook.y * 0.4) * hp.yz;

    // --- 1. HEAD & FACIAL ANATOMY ---
    // Cranium & forehead
    float cranium = sdEllipsoid(hp - vec3(0.0, 0.32, -0.02), vec3(0.23, 0.26, 0.24));

    // Feminine jaw & tapered chin
    vec3 jawP = hp - vec3(0.0, 0.12, 0.04);
    jawP.x = abs(jawP.x);
    float jaw = sdEllipsoid(jawP - vec3(0.08, 0.05, 0.0), vec3(0.12, 0.18, 0.16));
    float chin = sdSphere(hp - vec3(0.0, 0.06, 0.14), 0.075);

    // Cheekbones
    vec3 cheekP = hp - vec3(0.0, 0.24, 0.11);
    cheekP.x = abs(cheekP.x);
    float cheek = sdSphere(cheekP - vec3(0.12, 0.0, 0.0), 0.085);

    // Smooth blend cranium, jaw, cheekbones
    float headBase = smin(cranium, jaw, 0.08);
    headBase = smin(headBase, chin, 0.07);
    headBase = smin(headBase, cheek, 0.06);

    // Nose bridge and tip
    vec3 noseP = hp - vec3(0.0, 0.25, 0.22);
    float noseBridge = sdEllipsoid(noseP, vec3(0.025, 0.07, 0.045));
    float noseTip = sdSphere(hp - vec3(0.0, 0.20, 0.245), 0.026);
    float nose = smin(noseBridge, noseTip, 0.02);
    headBase = smin(headBase, nose, 0.035);

    // Mouth & Realistic Lips with Speech Animation
    float mouthMv = 0.0;
    if (u_state == 3) {
      // Speaking mouth modulation
      mouthMv = abs(sin(u_time * 13.0)) * 0.022 + u_audio * 0.025;
    }
    vec3 lipP = hp - vec3(0.0, 0.125, 0.20);
    float upperLip = sdEllipsoid(lipP - vec3(0.0, 0.012 + mouthMv * 0.3, 0.0), vec3(0.055, 0.014, 0.025));
    float lowerLip = sdEllipsoid(lipP - vec3(0.0, -0.015 - mouthMv * 0.7, 0.0), vec3(0.05, 0.018, 0.026));
    float lips = min(upperLip, lowerLip);
    headBase = smin(headBase, lips, 0.02);

    // Eye sockets (subtle indent)
    vec3 eyeSockP = hp - vec3(0.0, 0.30, 0.19);
    eyeSockP.x = abs(eyeSockP.x) - 0.085;
    float eyeSocket = sdSphere(eyeSockP, 0.045);
    headBase = max(headBase, -eyeSocket * 0.85);

    // --- 2. GLOWING OCULAR EYES ---
    vec3 eyeP = hp - vec3(0.0, 0.30, 0.185);
    eyeP.x = abs(eyeP.x) - 0.082;
    // Eye gaze tracks mouse slightly
    eyeP.xz = rot(targetLook.x * 0.4) * eyeP.xz;
    float eyeBall = sdSphere(eyeP, 0.028);

    // --- 3. CYBERNETIC COWL & SLEEK HAIR PLATES ---
    vec3 hairP = hp - vec3(0.0, 0.34, -0.05);
    float cowl = sdEllipsoid(hairP, vec3(0.245, 0.275, 0.255));
    // Cut front of hair to reveal face
    float cowlCut = hp.z - 0.06;
    cowl = max(cowl, -cowlCut);

    // Aerodynamic cybernetic hair crests
    vec3 crestP = hp - vec3(0.0, 0.42, -0.14);
    crestP.x = abs(crestP.x);
    float crest = sdEllipsoid(crestP - vec3(0.07, 0.0, 0.0), vec3(0.05, 0.16, 0.22));
    cowl = smin(cowl, crest, 0.05);

    // --- 4. NECK & CERVICAL TECH CONDUITS ---
    vec3 neckP = p - vec3(0.0, -0.02 + breathe * 0.5, -0.02);
    float neck = sdCappedCylinder(neckP, 0.14, 0.092);
    // Neck cybernetic grooves
    float neckRing = sdTorus(neckP - vec3(0.0, -0.04, 0.0), vec2(0.098, 0.01));

    // --- 5. TORSO & ERGONOMIC METALLIC CHESTPLATE ---
    vec3 torsoP = p - vec3(0.0, -0.32 + breathe, 0.0);
    float chestBase = sdEllipsoid(torsoP, vec3(0.32, 0.24, 0.21));

    // Collarbone and sternum contour
    vec3 collarP = torsoP - vec3(0.0, 0.12, 0.08);
    collarP.x = abs(collarP.x);
    float collarArmor = sdEllipsoid(collarP - vec3(0.14, 0.0, 0.0), vec3(0.14, 0.05, 0.08));
    chestBase = smin(chestBase, collarArmor, 0.06);

    // Shoulders
    vec3 shoulderP = torsoP - vec3(0.0, 0.08, -0.04);
    shoulderP.x = abs(shoulderP.x) - 0.32;
    float shoulder = sdSphere(shoulderP, 0.13);
    chestBase = smin(chestBase, shoulder, 0.07);

    // --- 6. INTEGRATED CHEST ARC REACTOR ---
    vec3 reactorP = torsoP - vec3(0.0, 0.02, 0.18);
    float reactorRing = sdTorus(reactorP, vec2(0.075, 0.014));
    float reactorCore = sdSphere(reactorP - vec3(0.0, 0.0, 0.01), 0.048);
    float reactorHousing = sdCappedCylinder(reactorP, 0.035, 0.09);

    // Combine Armor Parts
    float armor = smin(neck, chestBase, 0.05);
    armor = min(armor, cowl);
    armor = min(armor, reactorHousing);
    armor = min(armor, neckRing);

    // --- MATERIAL ASSIGNMENT ---
    float d = headBase;
    float mat = 1.0; // Face skin/porcelain

    if (armor < d) {
      d = armor;
      mat = 2.0; // Metallic armor
    }
    if (eyeBall < d) {
      d = eyeBall;
      mat = 4.0; // Glowing ocular eye
    }
    if (reactorCore < d) {
      d = reactorCore;
      mat = 3.0; // Chest Arc Reactor Core
    }
    if (reactorRing < d) {
      d = reactorRing;
      mat = 5.0; // Reactor gold/cyan ring trim
    }

    return vec2(d, mat);
  }

  // Calculate Surface Normal via gradient
  vec3 calcNormal(vec3 p) {
    const float eps = 0.002;
    vec2 h = vec2(eps, 0.0);
    return normalize(vec3(
      mapScene(p + h.xyy).x - mapScene(p - h.xyy).x,
      mapScene(p + h.yxy).x - mapScene(p - h.yxy).x,
      mapScene(p + h.yyx).x - mapScene(p - h.yyx).x
    ));
  }

  // Raymarching Loop
  vec2 raymarch(vec3 ro, vec3 rd) {
    float depth = 0.0;
    float mat = 0.0;
    for (int i = 0; i < 75; i++) {
      vec3 p = ro + rd * depth;
      vec2 res = mapScene(p);
      if (res.x < 0.002) {
        return vec2(depth, res.y);
      }
      depth += res.x * 0.85;
      if (depth > 6.0) break;
    }
    return vec2(-1.0, 0.0);
  }

  // Ambient Occlusion
  float calcAO(vec3 p, vec3 n) {
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 4; i++) {
      float hr = 0.03 + 0.06 * float(i);
      vec3 aopos = n * hr + p;
      float dd = mapScene(aopos).x;
      occ += -(dd - hr) * sca;
      sca *= 0.7;
    }
    return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
  }

  void main() {
    // Screen Normalized Coordinates (-1.0 to 1.0)
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Camera setup
    vec3 ro = vec3(0.0, 0.12, 1.65);
    vec3 ta = vec3(0.0, 0.10, 0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(p.x * uu + p.y * vv + 1.85 * ww);

    // Dynamic State Colors
    vec3 stateColor = vec3(0.0, 0.94, 1.0);    // Idle: Electric Cyan
    float glowEnergy = 1.0;

    if (u_state == 1) {
      // Listening: Bright Sky Blue + Audio reactivity
      stateColor = vec3(0.22, 0.74, 1.0);
      glowEnergy = 1.6 + u_audio * 1.5;
    } else if (u_state == 2) {
      // Processing: Deep Neural Purple
      stateColor = vec3(0.68, 0.35, 1.0);
      glowEnergy = 1.8 + sin(u_time * 8.0) * 0.5;
    } else if (u_state == 3) {
      // Speaking: Emerald Vocal Matrix + Audio pulse
      stateColor = vec3(0.06, 0.88, 0.58);
      glowEnergy = 1.5 + u_audio * 1.8;
    } else if (u_state == 4) {
      // Error: Crimson Alert
      stateColor = vec3(0.95, 0.25, 0.25);
      glowEnergy = 1.4 + sin(u_time * 6.0) * 0.4;
    }

    // Background Holographic Grid & Circular Rings
    float bgDist = length(p);
    float ring1 = abs(sin(bgDist * 14.0 - u_time * (u_state == 2 ? 4.0 : 1.2)));
    float ringMask = smoothstep(0.75, 0.78, bgDist) * smoothstep(1.05, 0.85, bgDist);
    vec3 col = vec3(0.015, 0.03, 0.06);
    col += stateColor * (1.0 - ring1) * 0.15 * ringMask;

    // Outer subtle radial vignette
    col *= clamp(1.4 - bgDist * 0.75, 0.0, 1.0);

    // Raymarch Scene
    vec2 hit = raymarch(ro, rd);

    if (hit.x > 0.0) {
      vec3 pos = ro + rd * hit.x;
      vec3 norm = calcNormal(pos);
      float ao = calcAO(pos, norm);

      // Lights
      vec3 keyLight = normalize(vec3(0.8, 1.2, 1.0));
      vec3 fillLight = normalize(vec3(-0.9, 0.2, 0.4));
      vec3 rimLight = normalize(vec3(0.0, 0.8, -1.0));

      float diff = max(dot(norm, keyLight), 0.0);
      float fill = max(dot(norm, fillLight), 0.0) * 0.35;
      float fresnel = pow(clamp(1.0 + dot(rd, norm), 0.0, 1.0), 3.0);

      // Specular Blinn-Phong
      vec3 halfVec = normalize(keyLight - rd);
      float spec = pow(max(dot(norm, halfVec), 0.0), 32.0);

      float mat = hit.y;

      if (mat == 1.0) {
        // --- 1. FACE: Synthetic Polished Titanium Skin ---
        vec3 skinTone = vec3(0.82, 0.86, 0.90);
        col = skinTone * (diff * 0.75 + fill + 0.18) * ao;
        col += vec3(1.0) * spec * 0.45;
        // Cyan subsurface rim lighting
        col += stateColor * fresnel * 0.45;

        // Subtle temple circuitry trace glow
        float trace = step(0.97, sin(pos.y * 70.0 + pos.x * 30.0));
        col += stateColor * trace * 0.4 * glowEnergy;

      } else if (mat == 2.0) {
        // --- 2. ARMOR: Brushed Dark Titanium / Metallic Navy ---
        vec3 armorBase = vec3(0.08, 0.12, 0.18);
        col = armorBase * (diff * 0.6 + fill + 0.12) * ao;
        col += vec3(0.9, 0.95, 1.0) * spec * 0.85;
        // Intense electric metallic rim
        col += stateColor * fresnel * 0.85 * glowEnergy;

      } else if (mat == 3.0) {
        // --- 3. ARC REACTOR CORE: Hyper-Illuminated Energy Emitter ---
        float pulse = sin(u_time * 6.0) * 0.2 + 0.8;
        col = stateColor * 3.2 * glowEnergy * pulse;
        col += vec3(1.0) * pow(clamp(dot(-rd, norm), 0.0, 1.0), 2.0) * 2.0;

      } else if (mat == 4.0) {
        // --- 4. GLOWING OCULAR EYES ---
        // Subtle blink cycle: closed for a brief fraction every 4.5 seconds
        float blink = step(0.06, fract(u_time * 0.22));
        float eyeGlow = glowEnergy * blink;
        col = stateColor * 3.5 * eyeGlow;
        col += vec3(0.9, 1.0, 1.0) * pow(clamp(dot(-rd, norm), 0.0, 1.0), 3.0) * eyeGlow;

      } else if (mat == 5.0) {
        // --- 5. REACTOR BEZEL TRIM: High Specular Gold / Cyan Finish ---
        vec3 goldTrim = vec3(0.4, 0.35, 0.25);
        col = goldTrim * (diff + 0.2) + vec3(1.0, 0.9, 0.6) * spec * 1.2;
        col += stateColor * fresnel * 0.6;
      }

      // Point-light cast from Arc Reactor onto chin and armor
      vec3 reactorPos = vec3(0.0, -0.30, 0.18);
      float distToReactor = length(pos - reactorPos);
      float reactorCast = clamp(1.0 - distToReactor / 0.55, 0.0, 1.0);
      col += stateColor * pow(reactorCast, 2.0) * 0.65 * glowEnergy;
    }

    // Final Tone Mapping & Contrast
    col = pow(col, vec3(0.92));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const AIAvatar: React.FC<AIAvatarProps> = ({
  state,
  onAvatarClick,
  greeting = 'Online & Ready for instructions, Sir.',
  isListening,
  isSpeaking,
  onStopSpeaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number | null>(null);

  // State presentation metadata
  const stateMetaRecord: Record<AIState, {
    code: number;
    label: string;
    badgeClass: string;
    color: string;
    glow: string;
    desc: string;
    sublabel: string;
  }> = {
    ready: {
      code: 0,
      label: 'NEURAL STANDBY',
      badgeClass: 'badge-idle',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.5)',
      desc: greeting,
      sublabel: 'Subtle ambient breathing and ocular sensors calibrated.',
    },
    idle: {
      code: 0,
      label: 'NEURAL STANDBY',
      badgeClass: 'badge-idle',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.5)',
      desc: greeting,
      sublabel: 'Subtle ambient breathing and ocular sensors calibrated.',
    },
    listening: {
      code: 1,
      label: 'AUDIO MATRIX LISTENING',
      badgeClass: 'badge-listening',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.8)',
      desc: 'Speak clearly into the microphone. Tap avatar to conclude.',
      sublabel: 'Ocular matrices focused. Real-time acoustic capture active.',
    },
    processing: {
      code: 2,
      label: 'NEURAL CORE SYNTHESIS',
      badgeClass: 'badge-processing',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.8)',
      desc: 'Formulating tactical response via Gemini & local SQLite memory...',
      sublabel: 'Sub-surface quantum circuits engaged in inference.',
    },
    thinking: {
      code: 2,
      label: 'NEURAL CORE SYNTHESIS',
      badgeClass: 'badge-processing',
      color: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.8)',
      desc: 'Synthesizing contextual response...',
      sublabel: 'Sub-surface quantum circuits engaged in reasoning.',
    },
    executing: {
      code: 2,
      label: 'EXECUTING DIRECTIVE',
      badgeClass: 'badge-processing',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.8)',
      desc: 'Executing authorized system instruction...',
      sublabel: 'Pipeline processing verified steps.',
    },
    speaking: {
      code: 3,
      label: 'VOCAL SYNTHESIZER ACTIVE',
      badgeClass: 'badge-speaking',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.8)',
      desc: 'Vocal matrix transmitting synthesized response. Tap to mute.',
      sublabel: 'Speech articulation synchronized with vocal matrix.',
    },
    completed: {
      code: 0,
      label: 'TASK COMPLETED',
      badgeClass: 'badge-idle',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.5)',
      desc: 'Task execution complete.',
      sublabel: 'Standby for subsequent instructions.',
    },
    error: {
      code: 4,
      label: 'SYSTEM ALERT // DIAGNOSTIC',
      badgeClass: 'badge-error',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.8)',
      desc: 'System event flagged in activity ledger. Tap to recalibrate.',
      sublabel: 'Auxiliary fail-safes engaged. Ready for recovery.',
    },
  };

  const stateMeta = stateMetaRecord[state] || stateMetaRecord.ready;

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

  // WebGL 3D Avatar Rendering Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability with fallback
    const gl =
      (canvas.getContext('webgl', { antialias: true, alpha: false }) as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      setIsWebGLSupported(false);
      return;
    }

    setIsWebGLSupported(true);

    // Compile Shader Helper
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

    // Quad Geometry
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

    // Shader Uniform Locations
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uStateLoc = gl.getUniformLocation(program, 'u_state');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const uAudioLoc = gl.getUniformLocation(program, 'u_audio');

    let startTime = performance.now();
    let currentMouse = { x: 0.5, y: 0.5 };

    const render = () => {
      if (!canvas || !gl) return;

      // Handle High-DPI Resolution Resizing
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

      // Smooth mouse lerping for fluid head tracking
      currentMouse.x += (mousePos.x - currentMouse.x) * 0.08;
      currentMouse.y += (mousePos.y - currentMouse.y) * 0.08;

      const elapsed = (performance.now() - startTime) * 0.001;

      // Dynamic audio simulation based on speech / listening activity
      let audioVal = 0.0;
      if (state === 'speaking') {
        audioVal = 0.35 + Math.sin(elapsed * 15.0) * 0.25 + Math.cos(elapsed * 23.0) * 0.15;
      } else if (state === 'listening') {
        audioVal = 0.2 + Math.sin(elapsed * 9.0) * 0.15;
      }

      gl.useProgram(program);
      gl.uniform2f(uResLoc, width, height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1i(uStateLoc, stateMeta.code);
      gl.uniform2f(uMouseLoc, currentMouse.x, currentMouse.y);
      gl.uniform1f(uAudioLoc, Math.max(0.0, audioVal));

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
  }, [state, stateMeta.code, mousePos]);

  return (
    <div
      className="jarvis-card ai-avatar-card"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* HUD Corner Tech Accents */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      {/* Holographic Header Bar */}
      <div className="avatar-hud-topbar">
        <div className="hud-indicator-group">
          <span className="hud-led" style={{ backgroundColor: stateMeta.color }}></span>
          <span className="hud-version-tag">J.A.R.V.I.S. MK-VIII // HUMANOID NEURAL AVATAR</span>
        </div>
        <span className={`reactor-state-badge ${stateMeta.badgeClass}`}>
          {stateMeta.label}
        </span>
      </div>

      {/* Central 3D Humanoid Viewport */}
      <div
        className="avatar-viewport"
        onClick={onAvatarClick}
        title="Tap Avatar to Toggle Push-to-Talk Voice Interaction"
      >
        {isWebGLSupported ? (
          <canvas ref={canvasRef} className="avatar-webgl-canvas" />
        ) : (
          /* Graceful High-Tech SVG Hologram Fallback if WebGL is unavailable */
          <div className="avatar-fallback-container">
            <svg
              width="240"
              height="280"
              viewBox="0 0 240 280"
              fill="none"
              className={`fallback-hologram ${stateMeta.badgeClass}`}
            >
              {/* Holographic Rings */}
              <circle cx="120" cy="140" r="105" stroke={stateMeta.color} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
              <circle cx="120" cy="140" r="85" stroke={stateMeta.color} strokeWidth="2" opacity="0.6" />
              {/* Humanoid Head Profile Silhouette */}
              <ellipse cx="120" cy="95" rx="42" ry="54" fill="#08101a" stroke={stateMeta.color} strokeWidth="2" />
              <path d="M 85 130 C 85 175, 155 175, 155 130" stroke={stateMeta.color} strokeWidth="1.5" fill="none" />
              {/* Luminous Eyes */}
              <ellipse cx="106" cy="90" rx="6" ry="3" fill={stateMeta.color} />
              <ellipse cx="134" cy="90" rx="6" ry="3" fill={stateMeta.color} />
              {/* Armor Shoulders */}
              <path d="M 60 210 Q 120 180 180 210 L 195 270 L 45 270 Z" fill="#08101a" stroke={stateMeta.color} strokeWidth="2" />
              {/* Integrated Chest Arc Reactor */}
              <circle cx="120" cy="225" r="22" stroke={stateMeta.color} strokeWidth="3" fill="#040810" />
              <circle cx="120" cy="225" r="12" fill={stateMeta.color} />
            </svg>
            <span className="fallback-note">2D Holographic Fallback Active (WebGL Hardware Standby)</span>
          </div>
        )}

        {/* Audio Waveform visualization overlay when Listening or Speaking */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="avatar-audio-wave-overlay">
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
            <span className="wave-bar" style={{ backgroundColor: stateMeta.color }}></span>
          </div>
        )}
      </div>

      {/* Avatar Status Readout & Assistant Guidance */}
      <div className="avatar-telemetry-readout">
        <p className="avatar-greeting">{stateMeta.desc}</p>
        <span className="avatar-subnote">{stateMeta.sublabel}</span>

        {/* Tactical Controls Strip */}
        <div className="avatar-actions-strip">
          <button
            className={`hud-button ${isListening ? 'hud-button-active' : ''}`}
            onClick={onAvatarClick}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            {isListening ? 'Conclude Listening' : 'Push to Talk'}
          </button>

          {isSpeaking && onStopSpeaking && (
            <button className="hud-button hud-button-warn" onClick={onStopSpeaking}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              Halt Speech
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
