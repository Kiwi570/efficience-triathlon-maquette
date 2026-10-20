/* ==========================================================================
   ET² — « ondes de bassin » : la vidéo du héros traverse un shader d'eau
   qui réagit au curseur (OGL). Sans WebGL ou en mode calme, la vidéo
   reste affichée telle quelle.
   ========================================================================== */
(function () {
  "use strict";
  var ET = window.ET;
  if (!ET || ET.calm || !window.OGL || !ET.fine) return;
  var box = document.querySelector("[data-water]");
  var video = box && box.querySelector("video");
  if (!video) return;
  var O = window.OGL, renderer, gl;
  try { var probe = document.createElement("canvas"); if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return; } catch (e) { return; }
  try {
    renderer = new O.Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: false, antialias: false });
    gl = renderer.gl;
  } catch (e) { return; }
  if (!gl) return;
  box.appendChild(gl.canvas);
  gl.canvas.setAttribute("aria-hidden", "true");

  var N = 8, rip = new Float32Array(N * 4), ri = 0;
  var texture = new O.Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  var program = new O.Program(gl, {
    vertex: "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}",
    fragment: [
      "precision highp float;",
      "uniform sampler2D uTex;uniform vec2 uRes;uniform vec2 uVid;uniform float uTime;uniform vec4 uRip[8];uniform vec2 uMouse;",
      "varying vec2 vUv;",
      "vec2 cover(vec2 uv){float ra=uRes.x/uRes.y;float rv=uVid.x/uVid.y;vec2 s=ra>rv?vec2(1.,rv/ra):vec2(ra/rv,1.);return (uv-.5)*s+.5;}",
      "void main(){",
      " vec2 uv=vUv;vec2 asp=vec2(uRes.x/uRes.y,1.);vec2 disp=vec2(0.);float glow=0.;",
      " for(int i=0;i<8;i++){vec4 r=uRip[i];float age=uTime-r.z;if(r.w<=0.||age<0.||age>2.6)continue;",
      "  vec2 d=(uv-r.xy)*asp;float dist=length(d);float w=sin(dist*46.-age*10.)*exp(-dist*5.5)*exp(-age*1.5)*r.w;",
      "  disp+=normalize(d+1e-5)*w*.012;glow+=w;}",
      " vec2 dm=(uv-uMouse)*asp;float m=exp(-dot(dm,dm)*12.);",
      " disp+=vec2(sin(uv.y*32.+uTime*2.),cos(uv.x*28.+uTime*1.6))*.0028*m;",
      " vec2 c=cover(uv+disp);float ca=.0016+abs(glow)*.012;",
      " vec3 col=vec3(texture2D(uTex,c+vec2(ca,0.)).r,texture2D(uTex,c).g,texture2D(uTex,c-vec2(ca,0.)).b);",
      " float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,.8);col=(col-.5)*1.06+.5;col*=.8;",
      " col+=vec3(1.,.29,.17)*max(glow,0.)*.09;",
      " gl_FragColor=vec4(col,1.);",
      "}"
    ].join("\n"),
    uniforms: {
      uTex: { value: texture }, uRes: { value: [1, 1] }, uVid: { value: [16, 9] },
      uTime: { value: 0 }, uRip: { value: rip }, uMouse: { value: [0.5, 0.5] }
    }
  });
  var mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program: program });

  function resize() {
    var w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h);
    program.uniforms.uRes.value = [w, h];
  }
  window.addEventListener("resize", resize);
  resize();
  video.addEventListener("loadedmetadata", function () { program.uniforms.uVid.value = [video.videoWidth || 16, video.videoHeight || 9]; });
  if (video.videoWidth) program.uniforms.uVid.value = [video.videoWidth, video.videoHeight];

  var t0 = performance.now(), last = 0, mouse = [0.5, 0.5], target = [0.5, 0.5];
  function addRipple(x, y, s) {
    rip[ri * 4] = x; rip[ri * 4 + 1] = y; rip[ri * 4 + 2] = (performance.now() - t0) / 1000; rip[ri * 4 + 3] = s;
    ri = (ri + 1) % N;
  }
  var hero = box.closest(".hero") || box;
  hero.addEventListener("pointermove", function (e) {
    var r = box.getBoundingClientRect();
    target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    var now = performance.now();
    if (now - last > 90) { addRipple(target[0], target[1], 0.55); last = now; }
  });
  hero.addEventListener("pointerdown", function (e) {
    var r = box.getBoundingClientRect();
    addRipple((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 1.4);
  });

  var visible = true, on = false;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(box);
  var raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function frame() {
      if (!visible) return;
      mouse[0] += (target[0] - mouse[0]) * 0.08; mouse[1] += (target[1] - mouse[1]) * 0.08;
      program.uniforms.uMouse.value = mouse;
      program.uniforms.uTime.value = (performance.now() - t0) / 1000;
      if (video.readyState >= 2) {
        texture.image = video; texture.needsUpdate = true;
        renderer.render({ scene: mesh });
        if (!on) { on = true; box.classList.add("gl-on"); }
      }
      raf = requestAnimationFrame(frame);
    });
  }
  loop();
})();
