/* ============================================================
   BioKinetiX — 3D ADME Journey (Three.js r128)
   Auto-playing, looping, cinematic. No interaction required.
   Shows a glowing drug dose traveling through a translucent
   3D body: swallowed, absorbed, carried by the blood, worked
   on by the liver, cleared by the kidneys.
============================================================ */

function ADME3D(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') {
    if (container) container.classList.add('adme3d-fallback');
    return;
  }

  const W = () => container.clientWidth;
  const H = () => container.clientHeight;

  // ---- Scene, camera, renderer ----
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1c33, 0.035);

  const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
  camera.position.set(0, 0.5, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ---- Lights ----
  scene.add(new THREE.AmbientLight(0x6688bb, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 10);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4499ff, 0.6);
  rim.position.set(-6, 2, -6);
  scene.add(rim);
  const warmPoint = new THREE.PointLight(0xe0a458, 0.8, 30);
  warmPoint.position.set(0, 0, 6);
  scene.add(warmPoint);

  // ---- Root group (the whole body slowly rotates for a 3D feel) ----
  const bodyGroup = new THREE.Group();
  scene.add(bodyGroup);

  // Helper: simple translucent material
  function organMat(color, opacity) {
    return new THREE.MeshPhongMaterial({
      color: color, transparent: true, opacity: opacity || 0.35,
      shininess: 40, specular: 0x223355,
      side: THREE.DoubleSide, depthWrite: false
    });
  }

  // ---- Body silhouette built from primitives (head, torso, limbs) ----
  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x9fc6e8, transparent: true, opacity: 0.13,
    shininess: 60, specular: 0x99bbff, side: THREE.DoubleSide, depthWrite: false
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.7, 6, 32, 1, true), bodyMat);
  torso.position.y = 0.5;
  bodyGroup.add(torso);

  const torsoCap = new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI*2, 0, Math.PI/2), bodyMat);
  torsoCap.position.y = 3.5;
  bodyGroup.add(torsoCap);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(1.7, 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2), bodyMat);
  pelvis.position.y = -2.5;
  bodyGroup.add(pelvis);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1, 20, 1, true), bodyMat);
  neck.position.y = 4.1;
  bodyGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 24), bodyMat);
  head.position.y = 5.4;
  bodyGroup.add(head);

  // Shoulders/arms (thin capsules via cylinders + spheres)
  function limb(x1, y1, x2, y2, r) {
    const g = new THREE.Group();
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16, 1, true), bodyMat);
    cyl.position.set((x1+x2)/2, (y1+y2)/2, 0);
    cyl.rotation.z = Math.atan2(dx, -dy) ; // align
    g.add(cyl);
    return g;
  }
  bodyGroup.add(limb(-2.0, 3.0, -3.2, -1.0, 0.45)); // left arm
  bodyGroup.add(limb( 2.0, 3.0,  3.2, -1.0, 0.45)); // right arm
  bodyGroup.add(limb(-0.9, -3.2, -1.1, -7.2, 0.6)); // left leg
  bodyGroup.add(limb( 0.9, -3.2,  1.1, -7.2, 0.6)); // right leg

  // ---- Organs (positioned inside the torso) ----
  const organs = {};
  function addOrgan(name, geo, color, pos, opacity) {
    const m = new THREE.Mesh(geo, organMat(color, opacity));
    m.position.set(pos.x, pos.y, pos.z);
    bodyGroup.add(m);
    organs[name] = { mesh: m, baseColor: new THREE.Color(color), baseOpacity: opacity || 0.35 };
    return m;
  }
  // Stomach (upper-left abdomen)
  addOrgan('stomach', new THREE.SphereGeometry(0.9, 24, 18), 0x3fb950, { x: -0.7, y: 1.2, z: 0.4 }, 0.3);
  // Liver (upper-right abdomen, larger)
  const liverGeo = new THREE.SphereGeometry(1.1, 24, 18);
  liverGeo.scale(1.3, 0.8, 0.9);
  addOrgan('liver', liverGeo, 0xf97316, { x: 0.8, y: 1.3, z: 0.4 }, 0.3);
  // Heart (center chest)
  addOrgan('heart', new THREE.SphereGeometry(0.7, 24, 18), 0xc1121f, { x: -0.2, y: 2.6, z: 0.5 }, 0.35);
  // Intestine (center-low abdomen) — torus knot for coiled look
  addOrgan('intestine', new THREE.TorusKnotGeometry(0.7, 0.22, 64, 8), 0x3fb950, { x: 0, y: 0.0, z: 0.4 }, 0.28);
  // Kidneys (back, low)
  addOrgan('kidneyL', new THREE.SphereGeometry(0.4, 18, 14), 0xa855f7, { x: -0.9, y: 0.3, z: -0.5 }, 0.32);
  addOrgan('kidneyR', new THREE.SphereGeometry(0.4, 18, 14), 0xa855f7, { x: 0.9, y: 0.3, z: -0.5 }, 0.32);
  // Bladder (low center)
  addOrgan('bladder', new THREE.SphereGeometry(0.55, 20, 16), 0xa855f7, { x: 0, y: -1.8, z: 0.3 }, 0.3);
  // Brain (in head)
  addOrgan('brain', new THREE.SphereGeometry(0.9, 24, 18), 0x3b82f6, { x: 0, y: 5.4, z: 0 }, 0.28);

  // ---- The drug dose: a glowing sphere that travels a path ----
  const doseMat = new THREE.MeshPhongMaterial({
    color: 0xe0a458, emissive: 0xe0a458, emissiveIntensity: 0.8,
    shininess: 100, transparent: true, opacity: 0.95
  });
  const dose = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), doseMat);
  const doseGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0a458, transparent: true, opacity: 0.18, depthWrite: false })
  );
  dose.add(doseGlow);
  dose.position.set(0, 5.0, 0.6);
  bodyGroup.add(dose);

  // ---- Bloodstream particle system ----
  const PCOUNT = 380;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3);
  const pColor = new Float32Array(PCOUNT * 3);
  const pData = []; // per-particle anim state
  for (let i = 0; i < PCOUNT; i++) {
    pPos[i*3] = 0;
    pPos[i*3+1] = -200;
    pPos[i*3+2] = 0;
    pColor[i*3]=0.88; pColor[i*3+1]=0.64; pColor[i*3+2]=0.34;
    pData.push({ active:false, x:0,y:0,z:0, tx:0,ty:0,tz:0, t:0, speed:0.01, kind:'parent' });
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.16, vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
    map: makeDotTexture()
  });
  const points = new THREE.Points(pGeo, pMat);
  bodyGroup.add(points);

  function makeDotTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.3,'rgba(255,255,255,0.8)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g; x.fillRect(0,0,64,64);
    const t = new THREE.Texture(c); t.needsUpdate = true; return t;
  }

  function setParticleColor(i, kind) {
    let r,g,bl;
    if (kind==='parent'){ r=0.88; g=0.64; bl=0.34; }
    else if (kind==='metabolite'){ r=0.98; g=0.45; bl=0.09; }
    else if (kind==='blood'){ r=0.78; g=0.12; bl=0.18; }
    else { r=0.66; g=0.33; bl=0.97; } // action/excrete
    pColor[i*3]=r; pColor[i*3+1]=g; pColor[i*3+2]=bl;
  }

  // Activate a particle traveling from a→b
  let pCursor = 0;
  function emit(from, to, kind, speed) {
    const i = pCursor; pCursor = (pCursor+1) % PCOUNT;
    const p = pData[i];
    p.active = true; p.kind = kind; p.t = 0;
    p.speed = speed || (0.006 + Math.random()*0.006);
    p.x = from.x + (Math.random()-0.5)*0.5;
    p.y = from.y + (Math.random()-0.5)*0.5;
    p.z = from.z + (Math.random()-0.5)*0.5;
    p.fx = p.x; p.fy = p.y; p.fz = p.z;
    p.tx = to.x + (Math.random()-0.5)*0.8;
    p.ty = to.y + (Math.random()-0.5)*0.8;
    p.tz = to.z + (Math.random()-0.5)*0.8;
    setParticleColor(i, kind);
  }

  const POS = {
    mouth:    { x: 0, y: 5.0, z: 0.6 },
    stomach:  { x: -0.7, y: 1.2, z: 0.4 },
    intestine:{ x: 0, y: 0.0, z: 0.4 },
    heart:    { x: -0.2, y: 2.6, z: 0.5 },
    liver:    { x: 0.8, y: 1.3, z: 0.4 },
    kidneyL:  { x: -0.9, y: 0.3, z: -0.5 },
    kidneyR:  { x: 0.9, y: 0.3, z: -0.5 },
    bladder:  { x: 0, y: -1.8, z: 0.3 },
    brain:    { x: 0, y: 5.4, z: 0 },
    muscleL:  { x: -1.1, y: -5.0, z: 0 },
    muscleR:  { x: 1.1, y: -5.0, z: 0 },
    exit:     { x: 0, y: -7.5, z: 0.3 },
  };

  // ---- Phase script (auto-advancing) ----
  const PHASES = [
    { id:'admin',   title:'Swallowing the dose',
      caption:'You take the tablet by mouth and swallow it. It heads down toward the stomach to begin its journey.',
      color:'#E0A458', organs:['stomach'], dur:4.5 },
    { id:'absorb',  title:'Absorption',
      caption:'The tablet breaks down in the stomach and gut. The drug then passes through the gut wall and soaks into the tiny blood vessels waiting nearby.',
      color:'#3FB950', organs:['stomach','intestine'], dur:6 },
    { id:'distribute', title:'Travelling in the blood',
      caption:'Once in the blood, the drug reaches the heart. With every heartbeat it gets pushed out and carried all around the body.',
      color:'#3B82F6', organs:['heart','brain'], dur:6.5 },
    { id:'action',  title:'Reaching its target',
      caption:'The drug arrives at the places it needs to work, such as the brain and muscles, and starts doing its job.',
      color:'#A855F7', organs:['brain'], dur:5 },
    { id:'metabolism', title:'The liver gets to work',
      caption:'Blood keeps flowing through the liver. There, the liver slowly breaks the drug down into simpler leftover pieces.',
      color:'#F97316', organs:['liver'], dur:6.5 },
    { id:'excretion', title:'Clearing it out',
      caption:'The kidneys filter those leftover pieces out of the blood. They pass into the bladder and eventually leave the body.',
      color:'#A855F7', organs:['kidneyL','kidneyR','bladder'], dur:6.5 },
  ];
  const totalDur = PHASES.reduce((a,p)=>a+p.dur, 0);

  // UI refs
  const titleEl = document.getElementById('adme3dTitle');
  const capEl = document.getElementById('adme3dCaption');
  const phaseTagEl = document.getElementById('adme3dPhaseTag');
  const progFill = document.getElementById('adme3dProgress');
  const stepEls = Array.from(document.querySelectorAll('.adme3d-step'));

  let clock = new THREE.Clock();
  let elapsed = 0;
  let curPhase = -1;
  let emitAccum = 0;

  function highlightOrgans(list, color) {
    Object.keys(organs).forEach(k => {
      const o = organs[k];
      if (list.includes(k)) {
        o.mesh.material.color.set(color);
        o.mesh.material.opacity = 0.62;
        o.mesh.material.emissive = new THREE.Color(color);
        o.mesh.material.emissiveIntensity = 0.0;
        o.targetGlow = 1;
      } else {
        o.mesh.material.color.copy(o.baseColor);
        o.mesh.material.opacity = o.baseOpacity;
        o.targetGlow = 0;
      }
    });
  }

  function enterPhase(idx) {
    curPhase = idx;
    const p = PHASES[idx];
    if (titleEl) titleEl.textContent = p.title;
    if (capEl) capEl.textContent = p.caption;
    if (phaseTagEl) phaseTagEl.textContent = `Step ${idx+1} of ${PHASES.length}`;
    if (titleEl) titleEl.style.color = p.color;
    highlightOrgans(p.organs, p.color);
    stepEls.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      el.classList.toggle('done', i < idx);
    });
  }

  // Move the dose sphere along the path according to overall progress
  function updateDose(phaseId, localT) {
    let a, b;
    if (phaseId === 'admin') { a = POS.mouth; b = POS.stomach; }
    else if (phaseId === 'absorb') { a = POS.stomach; b = POS.heart; }
    else if (phaseId === 'distribute') { a = POS.heart; b = POS.brain; }
    else if (phaseId === 'action') { a = POS.brain; b = POS.heart; }
    else if (phaseId === 'metabolism') { a = POS.heart; b = POS.liver; }
    else { a = POS.liver; b = POS.bladder; }
    const ease = localT < 0.5 ? 2*localT*localT : 1 - Math.pow(-2*localT+2,2)/2;
    dose.position.x = a.x + (b.x - a.x) * ease;
    dose.position.y = a.y + (b.y - a.y) * ease;
    dose.position.z = a.z + (b.z - a.z) * ease;
    // Shrink + recolor as it gets metabolized
    if (phaseId === 'metabolism') {
      dose.scale.setScalar(1 - localT*0.5);
      doseMat.color.lerpColors(new THREE.Color(0xe0a458), new THREE.Color(0xf97316), localT);
      doseMat.emissive.copy(doseMat.color);
    } else if (phaseId === 'excretion') {
      dose.scale.setScalar(0.5 - localT*0.45);
      doseMat.color.set(0xa855f7); doseMat.emissive.set(0xa855f7);
    } else {
      dose.scale.setScalar(1);
      doseMat.color.set(0xe0a458); doseMat.emissive.set(0xe0a458);
    }
  }

  // Emit particles appropriate to phase
  function phaseEmit(phaseId, dt) {
    emitAccum += dt;
    const rate = 0.03;
    while (emitAccum > rate) {
      emitAccum -= rate;
      if (phaseId === 'admin') {
        emit(POS.mouth, POS.stomach, 'parent');
      } else if (phaseId === 'absorb') {
        emit(POS.stomach, POS.intestine, 'parent');
        if (Math.random()<0.6) emit(POS.intestine, POS.heart, 'parent');
      } else if (phaseId === 'distribute') {
        const dests = [POS.brain, POS.muscleL, POS.muscleR, POS.liver, POS.kidneyL];
        emit(POS.heart, dests[(Math.random()*dests.length)|0], 'parent', 0.012);
      } else if (phaseId === 'action') {
        const dests = [POS.brain, POS.muscleL, POS.muscleR];
        const d = dests[(Math.random()*dests.length)|0];
        emit(d, {x:d.x+(Math.random()-0.5),y:d.y+(Math.random()-0.5),z:d.z+(Math.random()-0.5)}, 'action', 0.02);
      } else if (phaseId === 'metabolism') {
        emit(POS.heart, POS.liver, 'parent');
        if (Math.random()<0.7) emit(POS.liver, POS.kidneyR, 'metabolite');
      } else if (phaseId === 'excretion') {
        emit(POS.liver, Math.random()<0.5?POS.kidneyL:POS.kidneyR, 'metabolite');
        if (Math.random()<0.7) emit(POS.kidneyL, POS.bladder, 'excrete');
        if (Math.random()<0.5) emit(POS.bladder, POS.exit, 'excrete');
      }
    }
  }

  function updateParticles(dt) {
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < PCOUNT; i++) {
      const p = pData[i];
      if (!p.active) {
        // park far behind camera, invisible
        arr[i*3] = 0; arr[i*3+1] = -200; arr[i*3+2] = 0;
        continue;
      }
      p.t += p.speed * 60 * dt;
      if (p.t >= 1) { p.active = false; arr[i*3] = 0; arr[i*3+1] = -200; arr[i*3+2] = 0; continue; }
      const ease = p.t;
      arr[i*3]   = p.fx + (p.tx - p.fx) * ease;
      arr[i*3+1] = p.fy + (p.ty - p.fy) * ease;
      arr[i*3+2] = p.fz + (p.tz - p.fz) * ease;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  }

  // Heart "beat" pulse during distribution
  function beat(time) {
    const hb = organs.heart;
    if (!hb) return;
    const s = 1 + Math.sin(time * 6) * 0.06;
    hb.mesh.scale.setScalar(s);
  }

  // Resize
  function onResize() {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  }
  window.addEventListener('resize', onResize);

  // Main loop
  function animate() {
    const dt = Math.min(0.05, clock.getDelta());
    const time = clock.elapsedTime;
    elapsed += dt;
    if (elapsed >= totalDur) elapsed = 0;

    // figure out current phase + local progress
    let acc = 0, idx = 0, localT = 0;
    for (let i = 0; i < PHASES.length; i++) {
      if (elapsed < acc + PHASES[i].dur) {
        idx = i; localT = (elapsed - acc) / PHASES[i].dur; break;
      }
      acc += PHASES[i].dur;
    }
    if (idx !== curPhase) enterPhase(idx);

    updateDose(PHASES[idx].id, localT);
    phaseEmit(PHASES[idx].id, dt);
    updateParticles(dt);
    beat(time);

    // organ glow easing
    Object.keys(organs).forEach(k=>{
      const o = organs[k];
      if (o.targetGlow) {
        o.mesh.material.emissiveIntensity = (o.mesh.material.emissiveIntensity||0) +
          (0.5 - (o.mesh.material.emissiveIntensity||0)) * 0.05;
      }
    });

    // gentle auto-rotation for 3D feel
    bodyGroup.rotation.y = Math.sin(time * 0.18) * 0.5;
    bodyGroup.rotation.x = Math.sin(time * 0.12) * 0.08;

    // dose glow pulse
    doseGlow.scale.setScalar(1 + Math.sin(time*4)*0.12);

    if (progFill) progFill.style.width = (100 * elapsed / totalDur) + '%';

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  enterPhase(0);
  animate();
}
