/* ==========================================================================
   ET² — page Test d'effort
   ========================================================================== */
(function () {
  "use strict";
  var ET = window.ET, $ = ET.$, $$ = ET.$$, G = !!window.gsap;
  var mm = G ? gsap.matchMedia() : null;

  /* Paliers illustratifs (coureur fictif) */
  var P = [
    { v: 10, l: 1.1 }, { v: 11, l: 1.2 }, { v: 12, l: 1.4 }, { v: 13, l: 2.0 },
    { v: 14, l: 2.8 }, { v: 15, l: 4.0 }, { v: 16, l: 5.6 }, { v: 17, l: 7.6 }
  ];
  var KEY = { 3: "SL1", 5: "SL2" };

  function heroIn() {
    var ro = $$("#readouts .readout");
    if (!G || ET.calm) { ro.forEach(function (r) { r.classList.add("is-on"); }); return; }
    var swept = ET.sweepIn();
    var tl = gsap.timeline({ delay: swept ? 0.45 : 0.1, defaults: { ease: "expo.out" } });
    tl.from("#t-title .line > span", { yPercent: 115, duration: 1.2, stagger: 0.1 })
      .from("[data-hero-in]", { y: 26, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.2)
      .from(".phero__media", { scale: 1.12, duration: 2, ease: "power3.out" }, 0);
    ro.forEach(function (r, i) { tl.add(function () { r.classList.add("is-on"); }, 1 + i * 0.35); });
    gsap.to(".phero__media", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".phero", start: "top top", end: "bottom top", scrub: true } });
  }

  function protocol() {
    var svg = $("#protoChart"), list = $("#protoSteps"); if (!svg) return;
    var pts, rows, photos = $$("#protoPhotos .media"), curve, len = 1, cur = 0;
    list.innerHTML = '<div class="proto__step" style="color:var(--paper-faint)"><span>Palier</span><span>Vitesse</span><span>Lactate</span></div>' +
      P.map(function (p, i) { return '<div class="proto__step' + (KEY[i] ? " is-key" : "") + '" data-i="' + i + '"><span>' + (i + 1) + (KEY[i] ? " · " + KEY[i] : "") + "</span><span>" + p.v + " km/h</span><span>" + p.l.toFixed(1).replace(".", ",") + "</span></div>"; }).join("");
    rows = $$(".proto__step[data-i]", list);
    function draw() {
      var W = Math.max(280, Math.round(svg.parentElement.clientWidth - 2)), narrow = W < 520;
      var H = Math.round(W * (narrow ? 0.7 : 0.52)), l = narrow ? 32 : 48, r = 14, t = 20, b = 42;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var X = function (v) { return l + (v - 9.5) / 8 * (W - l - r); }, Y = function (v) { return H - b - v / 8 * (H - t - b); };
      var s = "";
      for (var v = 0; v <= 8; v += 2) s += '<line class="grid" x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="tick" x="' + (l - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + "</text>";
      P.forEach(function (p, i) { if (!narrow || i % 2 === 0) s += '<text class="tick" x="' + X(p.v) + '" y="' + (H - b + 18) + '" text-anchor="middle">' + p.v + "</text>"; });
      s += '<line class="axis" x1="' + l + '" x2="' + (W - r) + '" y1="' + (H - b) + '" y2="' + (H - b) + '"/>';
      s += '<text class="axis-label" x="' + (W - r) + '" y="' + (H - 4) + '" text-anchor="end">Vitesse du palier (km/h)</text><text class="axis-label" x="2" y="' + (t - 6) + '">mmol/L</text>';
      s += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(2) + '" y2="' + Y(2) + '" stroke="rgba(184,255,59,.45)" stroke-dasharray="4 5"/><line x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(4) + '" y2="' + Y(4) + '" stroke="rgba(255,75,43,.5)" stroke-dasharray="4 5"/>';
      var d = "";
      P.forEach(function (p, i) { d += (i ? " L" : "M") + X(p.v) + " " + Y(p.l); });
      s += '<path class="curve" d="' + d + '"/>';
      P.forEach(function (p, i) {
        var k = KEY[i];
        s += '<g class="pt" data-i="' + i + '"><circle cx="' + X(p.v) + '" cy="' + Y(p.l) + '" r="' + (k ? 7 : 5) + '" fill="' + (k === "SL1" ? "#b8ff3b" : k === "SL2" ? "#ff4b2b" : "#eef2f5") + '"/>' +
          (k ? '<text x="' + (X(p.v) - 12) + '" y="' + (Y(p.l) - 12) + '" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="' + (k === "SL1" ? "#b8ff3b" : "#ff4b2b") + '">' + k + "</text>" : "") + "</g>";
      });
      svg.innerHTML = s;
      pts = $$(".pt", svg); curve = $(".curve", svg); len = curve.getTotalLength();
      setStep(cur);
    }
    function setStep(k) {
      cur = k;
      pts.forEach(function (p, i) { p.style.opacity = i <= k ? 1 : 0.12; });
      rows.forEach(function (rw, i) { rw.classList.toggle("is-on", i === k); });
      var ph = k < 2 ? 0 : k < 4 ? 1 : k < 6 ? 2 : 3;
      photos.forEach(function (m, i) { m.classList.toggle("is-on", i === ph); });
      curve.style.strokeDasharray = len; curve.style.strokeDashoffset = len * (1 - k / (P.length - 1));
    }
    draw();
    var lastW = svg.parentElement.clientWidth, rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(svg.parentElement.clientWidth - lastW) > 20) { lastW = svg.parentElement.clientWidth; draw(); } }, 150); });
    if (!G || ET.calm) { setStep(P.length - 1); return; }
    setStep(0);
    var onUp = function (st) { setStep(Math.min(P.length - 1, Math.floor(st.progress * P.length))); };
    mm.add("(min-width: 961px)", function () {
      ScrollTrigger.create({ trigger: "#proto", start: "top top+=" + (ET.$(".header").offsetHeight + 20), end: "+=1600", pin: true, scrub: true, onUpdate: onUp });
    });
    mm.add("(max-width: 960px)", function () {
      ScrollTrigger.create({ trigger: "#proto", start: "top 70%", end: "bottom 40%", scrub: true, onUpdate: onUp });
    });
  }

  function tiles() {
    var ts = $$("#tiles .tile");
    if (!G || ET.calm) return;
    gsap.from(ts, { autoAlpha: 0, y: 30, duration: 0.8, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: "#tiles", start: "top 85%", once: true } });
    ts.forEach(function (t, i) {
      gsap.fromTo(t, { "--p": 0 }, { "--p": 1, duration: 1.2, delay: 0.3 + i * 0.12, ease: "power2.inOut", scrollTrigger: { trigger: "#tiles", start: "top 80%", once: true } });
    });
  }

  ET.onReady(function () {
    heroIn(); protocol(); tiles();
    if (G) ScrollTrigger.refresh();
  });
})();
