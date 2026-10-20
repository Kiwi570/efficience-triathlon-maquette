/* ==========================================================================
   ET² — page Stage Triathlon Montagne
   ========================================================================== */
(function () {
  "use strict";
  var ET = window.ET, $ = ET.$, $$ = ET.$$, G = !!window.gsap;
  var mm = G ? gsap.matchMedia() : null;

  /* Profil schématique des cols de la semaine (pas un parcours réel) */
  var PROF = [
    [0, 1300, "Briançon"], [0.15, 2360, "Izoard"], [0.29, 1420, ""], [0.45, 2744, "Agnel"],
    [0.6, 1480, ""], [0.75, 2058, "Lautaret"], [0.86, 2642, "Galibier"], [1, 1700, ""]
  ];
  var W = 1200, H = 300, AMIN = 1000, AMAX = 3000;
  function px(p) { return [p[0] * W, H - (p[1] - AMIN) / (AMAX - AMIN) * (H - 20)]; }
  function smooth(points) {
    var d = "M" + points[0][0] + " " + points[0][1];
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += " C" + c1[0].toFixed(1) + " " + c1[1].toFixed(1) + " " + c2[0].toFixed(1) + " " + c2[1].toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }
  function altAt(t) {
    for (var i = 0; i < PROF.length - 1; i++) {
      var a = PROF[i], b = PROF[i + 1];
      if (t <= b[0]) { var k = (t - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k); return a[1] + (b[1] - a[1]) * k; }
    }
    return PROF[PROF.length - 1][1];
  }

  function profile() {
    var svg = $("#profile"); if (!svg) return;
    var pts = PROF.map(px), d = smooth(pts);
    var s = '<defs><linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4b2b" stop-opacity=".28"/><stop offset="1" stop-color="#0b1016" stop-opacity="0"/></linearGradient></defs>';
    s += '<path class="fill" d="' + d + " L" + W + " " + H + " L0 " + H + ' Z"/><path class="stroke" d="' + d + '"/>';
    PROF.forEach(function (p, i) {
      if (!p[2]) return;
      var q = pts[i];
      s += '<g class="col"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="6"/><text x="' + (q[0] + (i ? 0 : 12)) + '" y="' + (q[1] - 16) + '" text-anchor="' + (i ? "middle" : "start") + '">' + p[2] + '</text><text class="alt" x="' + (q[0] + (i ? 0 : 12)) + '" y="' + (q[1] - 30) + '" text-anchor="' + (i ? "middle" : "start") + '">' + p[1].toLocaleString("fr-FR") + " m</text></g>";
    });
    s += '<text x="' + (W - 8) + '" y="' + (H - 8) + '" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="rgba(238,242,245,.5)">PROFIL SCHÉMATIQUE · PAS UN PARCOURS</text>';
    s += '<g class="col" id="profDot"><circle r="7" style="fill:#ff4b2b;stroke:#0b1016"/></g>';
    svg.innerHTML = s;
    var dot = $("#profDot"), alti = $("#altiVal");
    function setP(t) {
      var x = t * W, y = H - (altAt(t) - AMIN) / (AMAX - AMIN) * (H - 20);
      dot.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
      if (alti) alti.textContent = (Math.round(altAt(t) / 10) * 10).toLocaleString("fr-FR") + " m";
    }
    setP(0);
    if (!G || ET.calm) return;
    var stroke = $(".stroke", svg), len = stroke.getTotalLength();
    gsap.fromTo(stroke, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", delay: 0.4 });
    gsap.from($(".fill", svg), { opacity: 0, duration: 1.5, delay: 1 });
    gsap.from($$(".col:not(#profDot)", svg), { opacity: 0, y: 10, stagger: 0.18, duration: 0.6, delay: 0.9, ease: "expo.out" });
    ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", onUpdate: function (st) { setP(st.progress); } });
  }

  function heroIn() {
    if (!G || ET.calm) return;
    var swept = ET.sweepIn();
    var tl = gsap.timeline({ delay: swept ? 0.45 : 0.1, defaults: { ease: "expo.out" } });
    tl.from("#m-title .line > span", { yPercent: 115, duration: 1.2, stagger: 0.1 })
      .from("[data-hero-in]", { y: 26, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.2);
    gsap.fromTo(".kb", { scale: 1.18 }, { scale: 1.02, duration: 14, ease: "sine.out" });
    gsap.to(".phero__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".phero", start: "top top", end: "bottom top", scrub: true } });
  }

  function colsMap() {
    var svg = $("#colsMap"); if (!svg) return;
    var lon0 = 6.18, lat0 = 45.16, k = 880, cosL = Math.cos(44.85 * Math.PI / 180);
    var P = function (lat, lon) { return [(lon - lon0) * cosL * k + 40, (lat0 - lat) * k + 30]; };
    var pts = {
      bri: { n: "Briançon", a: "1 300 m", lat: 44.899, lon: 6.643, c: "base", dx: 14, dy: 5 },
      lau: { n: "Lautaret", a: "2 058 m", lat: 45.035, lon: 6.405, dx: -14, dy: 14, anchor: "end" },
      gal: { n: "Galibier", a: "2 642 m", lat: 45.064, lon: 6.408, dx: -14, dy: -4, anchor: "end" },
      izo: { n: "Izoard", a: "2 360 m", lat: 44.820, lon: 6.735, dx: 14, dy: 5 },
      agn: { n: "Agnel", a: "2 744 m", lat: 44.684, lon: 6.979, dx: -14, dy: 18, anchor: "end" },
      gite: { n: "Gîte · St-Martin-de-Q.", a: "", lat: 44.823, lon: 6.578, c: "gite", dx: -12, dy: 18, anchor: "end" },
      emb: { n: "Embrun", a: "", lat: 44.565, lon: 6.495, c: "town", dx: 14, dy: 5 },
      sp: { n: "Lac de Serre-Ponçon", a: "", lat: 44.53, lon: 6.36, c: "lake", dx: 14, dy: 18 }
    };
    var road = function (a, b, bend) {
      var p = P(pts[a].lat, pts[a].lon), q = P(pts[b].lat, pts[b].lon);
      var mx = (p[0] + q[0]) / 2 + (bend || 0), my = (p[1] + q[1]) / 2 - (bend || 0);
      return '<path class="road" d="M' + p[0] + " " + p[1] + " Q" + mx + " " + my + " " + q[0] + " " + q[1] + '"/>';
    };
    var s = road("bri", "lau", 30) + road("lau", "gal", 10) + road("bri", "izo", -20) + road("izo", "agn", 30) + road("bri", "emb", -30) + road("emb", "sp", 10);
    Object.keys(pts).forEach(function (key) {
      var p = pts[key], q = P(p.lat, p.lon);
      s += '<g class="pt ' + (p.c || "") + '"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (p.c === "base" ? 8 : p.c ? 5 : 7) + '"' + (p.c === "gite" ? ' style="fill:#eef2f5"' : p.c === "town" ? ' style="fill:#a9b4be"' : "") + '/>' +
        '<text x="' + (q[0] + p.dx) + '" y="' + (q[1] + p.dy) + '" text-anchor="' + (p.anchor || "start") + '">' + p.n + (p.a ? ' <tspan class="alt">' + p.a + "</tspan>" : "") + "</text></g>";
    });
    s += '<text x="780" y="626" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="rgba(238,242,245,.5)">CARTE SCHÉMATIQUE</text>';
    svg.innerHTML = s;
    if (!G || ET.calm) return;
    var roads = $$(".road", svg);
    roads.forEach(function (r) { var n = r.getTotalLength(); gsap.set(r, { strokeDasharray: n, strokeDashoffset: n }); });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 75%", once: true } })
      .to(roads, { strokeDashoffset: 0, duration: 1.2, stagger: 0.15, ease: "power2.inOut" })
      .from($$(".pt", svg), { opacity: 0, scale: 0.4, transformOrigin: "center", duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, 0.3);
  }

  function gallery() {
    if (!G || ET.calm) return;
    mm.add("(min-width: 901px)", function () {
      var wrap = $("#galWrap"), g = $("#gallery");
      var dist = function () { return Math.max(0, g.scrollWidth - window.innerWidth); };
      gsap.to(g, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: wrap, start: "top top+=" + (ET.$(".header").offsetHeight + 20), end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      return function () { gsap.set(g, { x: 0 }); };
    });
  }

  function volumes() {
    $$(".vol__bar").forEach(function (b) {
      var mn = +b.getAttribute("data-min"), mx = +b.getAttribute("data-max"), h = "";
      for (var i = 0; i < 6; i++) h += "<i" + (i < mn ? ' class="min"' : i < mx ? ' class="max"' : "") + "></i>";
      b.innerHTML = h;
    });
    if (!G || ET.calm) return;
    gsap.from($$(".vol__bar i.min, .vol__bar i.max"), { scaleX: 0, transformOrigin: "left", duration: 0.5, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: "#volumes", start: "top 80%", once: true } });
  }

  function form() {
    var f = $("#insForm"), msg = $("#insMsg"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = $("#f-prenom").value.trim(), m = $("#f-email").value.trim();
      if (!p || !/^\S+@\S+\.\S+$/.test(m)) {
        msg.hidden = false; msg.style.boxShadow = "inset 0 0 0 1px #ff4b2b"; msg.textContent = "Indique ton prénom et une adresse e-mail valide.";
        return;
      }
      msg.hidden = false; msg.style.boxShadow = "";
      msg.textContent = "Démonstration : rien n’a été envoyé, " + p + ". Sur le site final, ce formulaire transmettra la pré-inscription au coach. En attendant, utilise le formulaire officiel ou appelle le 06 24 31 31 08.";
    });
  }

  function others() {
    var box = $("#otherStages"); if (!box || !window.ET_STAGES) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var list = window.ET_STAGES.filter(function (s) { return s.id.indexOf("montagne") !== 0 && (s.surMesure || new Date(s.fin + "T00:00:00") >= today); });
    box.innerHTML = list.map(function (s) {
      var w = (window.ET_IMG && window.ET_IMG[s.image]) || [640];
      var src = "assets/img/" + s.image + "-" + w[Math.min(1, w.length - 1)] + ".webp";
      var when = s.debut ? ET.fmtDate(s.debut, { day: "numeric", month: "long" }) + " → " + ET.fmtDate(s.fin) : "Dates à définir ensemble";
      return '<a class="stage" href="index.html#stages" data-tilt><figure class="media media--real"><img src="' + src + '" alt="' + (s.imageAlt || "") + '" loading="lazy"></figure><div class="stage__body"><div class="stage__when"><span>' + when + '</span><span class="where">' + s.lieu + '</span></div><h3 class="stage__title">' + s.titre + "</h3></div></a>";
    }).join("");
    ET.bindTilt(box);
  }

  ET.onReady(function () {
    profile(); heroIn(); colsMap(); volumes(); form(); others(); gallery();
    $$("[data-countdown]").forEach(ET.countdown);
    if (G) ScrollTrigger.refresh();
  });
})();
