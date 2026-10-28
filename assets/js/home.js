/* ==========================================================================
   ET² — page d'accueil
   ========================================================================== */
(function () {
  "use strict";
  var ET = window.ET, $ = ET.$, $$ = ET.$$;
  var G = !!window.gsap;
  var mm = G ? gsap.matchMedia() : null;

  /* ---------- Utilitaire : chiffres qui défilent comme un chrono ---------- */
  function scramble(node, target, dur, delay) {
    var chars = "0123456789";
    var o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration: dur || 1.2, delay: delay || 0, ease: "power2.out",
      onUpdate: function () {
        var lock = Math.floor(o.p * target.length), s = "";
        for (var i = 0; i < target.length; i++) {
          var c = target[i];
          s += i < lock || !/[0-9]/.test(c) ? c : chars[(Math.random() * 10) | 0];
        }
        node.nodeValue = s;
      },
      onComplete: function () { node.nodeValue = target; }
    });
  }
  function scrambleLetters(el, target, dur) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ²×0123456789";
    var o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration: dur, ease: "none",
      onUpdate: function () {
        var lock = Math.floor(o.p * target.length), s = "";
        for (var i = 0; i < target.length; i++) s += i < lock || target[i] === " " ? target[i] : chars[(Math.random() * chars.length) | 0];
        el.textContent = s;
      }
    });
  }

  /* ---------- Ouverture orchestrée ---------- */
  function intro(done) {
    window.__etIntro = true;
    var el = $(".intro");
    if (!el || ET.calm || !G) { if (el) el.remove(); done(); return; }
    if (ET.sweepIn()) { el.remove(); done(); return; }
    var quick = ET.store.sget("et-intro") === "1";
    ET.store.sset("et-intro", "1");
    if (ET.lenis) ET.lenis.stop();
    var w = window.innerWidth, h = window.innerHeight;
    var grid = $(".intro__grid"), ns = "http://www.w3.org/2000/svg";
    grid.setAttribute("viewBox", "0 0 " + w + " " + h);
    var lines = [];
    for (var x = 120; x < w; x += 120) lines.push([x, 0, x, h]);
    for (var y = 120; y < h; y += 120) lines.push([0, y, w, y]);
    lines.forEach(function (l) {
      var ln = document.createElementNS(ns, "line");
      ln.setAttribute("x1", l[0]); ln.setAttribute("y1", l[1]); ln.setAttribute("x2", l[2]); ln.setAttribute("y2", l[3]);
      grid.appendChild(ln);
    });
    var path = $(".intro__curve path"), d = "";
    for (var i = 0; i <= 60; i++) { var t = i / 60; d += (i ? "L" : "M") + (t * 1000).toFixed(1) + " " + (300 - (ET.lactate(t) - 0.9) / 7.6 * 280).toFixed(1); }
    path.setAttribute("d", d);
    var len = path.getTotalLength();
    var name = $(".intro__name"), count = $(".intro__count"), formula = $(".intro__formula");
    var c = { v: 0.8 };
    var k = quick ? 0.45 : 1;
    var tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tl.from(grid.querySelectorAll("line"), { opacity: 0, duration: 0.6 * k, stagger: { each: 0.01, from: "center" } })
      .from(formula, { yPercent: 60, autoAlpha: 0, duration: 0.6 * k, ease: "expo.out" }, 0.1)
      .add(scrambleLetters(name, "Efficience Triathlon Training", 0.9 * k), 0.35 * k)
      .fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2 * k, ease: "power2.inOut" }, 0.3 * k)
      .to(c, { v: 4.0, duration: 1.2 * k, ease: "power2.inOut", onUpdate: function () { count.textContent = c.v.toFixed(1).replace(".", ",") + " mmol/L · SL2"; } }, 0.3 * k)
      .to(formula, { scale: 0.9, autoAlpha: 0, duration: 0.4 * k }, 1.5 * k)
      .to(name, { autoAlpha: 0, duration: 0.3 * k }, 1.5 * k)
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8 * k, ease: "expo.inOut", onStart: done }, 1.6 * k)
      .add(function () { el.remove(); if (ET.lenis) ET.lenis.start(); });
    var skipped = false;
    function skip() { if (skipped) return; skipped = true; tl.timeScale(7); }
    var sb = el.querySelector("[data-skip]");
    if (sb) sb.addEventListener("click", skip);
    ["keydown", "wheel", "touchstart", "pointerdown"].forEach(function (ev) { window.addEventListener(ev, skip, { once: true, passive: true }); });
  }

  /* ---------- Héros ---------- */
  function heroIn() {
    if (!G || ET.calm) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from("#hero-title .line > span", { yPercent: 115, duration: 1.3, stagger: 0.08 })
      .from("[data-hero-in]", { y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.25)
      .from(".hero__media", { scale: 1.12, duration: 2.2, ease: "power3.out" }, 0);
    gsap.to(".hero__media", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- Manifeste : mots qui s'allument au défilement ---------- */
  function manifesto() {
    var el = $("[data-manifesto]");
    if (!el) return;
    var out = [];
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) n.nodeValue.split(/(\s+)/).forEach(function (w) { out.push(/^\s+$/.test(w) || !w ? w : '<span class="w">' + w + "</span>"); });
      else out.push('<span class="w hl">' + n.textContent + "</span>");
    });
    el.innerHTML = out.join("");
    if (!G || ET.calm) return;
    var ws = $$(".w", el);
    ScrollTrigger.create({
      trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle("on", i < n); }); }
    });
  }

  /* ---------- Trois disciplines : galerie horizontale épinglée ---------- */
  function disciplines() {
    if (!G) return;
    var sec = $("#disciplines"), pin = $(".disc__pin", sec), track = $(".disc__track", sec), svg = $(".disc__line", sec), bar = $(".disc__progress b", sec);
    if (!sec || ET.calm) return;
    mm.add("(min-width: 901px)", function () {
      sec.classList.add("is-h");
      track.style.position = "relative";
      track.appendChild(svg);
      var W = track.scrollWidth, H = 120;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.style.width = W + "px";
      var p = svg.querySelector("path"), d = "M0 60", x, a = W / 3;
      for (x = 0; x <= a; x += 8) d += " L" + x + " " + (60 + Math.sin(x / 26) * 14).toFixed(1);
      d += " L" + (2 * a) + " 60";
      for (x = 2 * a; x <= W; x += 40) d += " L" + (x + 20) + " 44 L" + (x + 40) + " 60";
      p.setAttribute("d", d);
      p.setAttribute("stroke", "url(#discGrad)");
      if (!svg.querySelector("defs")) svg.insertAdjacentHTML("afterbegin", '<defs><linearGradient id="discGrad" x1="0" x2="1"><stop offset="0" stop-color="#8fd3f2"/><stop offset=".5" stop-color="#ffd25c"/><stop offset="1" stop-color="#ff4b2b"/></linearGradient></defs>');
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.55 });
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tl = gsap.timeline({ scrollTrigger: { trigger: pin, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      tl.to(track, { x: function () { return -dist(); }, ease: "none" }, 0)
        .to(p, { strokeDashoffset: 0, ease: "none" }, 0)
        .to(bar, { scaleX: 1, ease: "none" }, 0);
      $$(".disc__media .media--inset", sec).forEach(function (m, i) {
        tl.fromTo(m, { yPercent: 0 }, { yPercent: -50, ease: "none" }, 0);   /* l'encart reste dans le panneau (épinglé en 100svh) */
      });
      $$(".disc__t strong", sec).forEach(function (t) {
        gsap.from(t, { scale: 0.4, autoAlpha: 0, ease: "back.out(2)", scrollTrigger: { trigger: t, containerAnimation: tl, start: "left 75%", toggleActions: "play none none reverse" } });
      });
      return function () { gsap.set(track, { x: 0 }); sec.classList.remove("is-h"); };
    });
  }

  /* ---------- Méthode : cartes empilées ---------- */
  function principles() {
    if (!G || ET.calm) return;
    mm.add("(min-width: 901px)", function () {
      var cards = $$(".principle");
      cards.forEach(function (c, i) {
        if (i === cards.length - 1) return;
        gsap.to(c, { scale: 0.95, filter: "brightness(0.62)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top 45%", end: "top " + (ET.$(".header").offsetHeight + 24 + (i + 1) * 14) + "px", scrub: true } });
      });
    });
  }

  /* ---------- Science : courbe de lactate interactive ---------- */
  var L = function (x) { return 0.9 + 0.333 * (Math.exp(3.24 * x) - 1); };
  var ZONES = [
    { to: 0.45, z: 1, c: "#6fa8c9", t: "Endurance fondamentale, sous SL1 : le lactate reste proche du repos. C’est la zone où beaucoup d’athlètes courent trop vite." },
    { to: 0.62, z: 2, c: "#b8ff3b", t: "Entre SL1 et le MLSS : endurance active, l’organisme recycle encore le lactate qu’il produit." },
    { to: 0.72, z: 3, c: "#ffd25c", t: "Autour du MLSS : l’intensité la plus élevée que l’on peut tenir sans déséquilibre métabolique." },
    { to: 0.87, z: 4, c: "#ff8a3d", t: "Au-delà de SL2 : le lactate s’accumule, l’effort devient limité dans le temps." },
    { to: 1.01, z: 5, c: "#ff4b2b", t: "Intensités maximales, autour de la PMA ou de la VMA : efforts courts." }
  ];
  function chart() {
    var svg = $("#lacChart"); if (!svg) return;
    var range = $("#lacRange"), oI = $("#lacI"), oL = $("#lacL"), oZ = $("#lacZ"), oD = $("#lacD");
    var X, Y, probe, pl, pc, first = true;
    function draw() {
      var W = Math.max(280, Math.round(svg.parentElement.clientWidth - 2)), narrow = W < 520;
      var H = Math.round(W * (narrow ? 0.72 : 0.55)), l = narrow ? 34 : 50, r = 12, t = 22, b = 44;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      X = function (x) { return l + x * (W - l - r); }; Y = function (v) { return H - b - (v / 10) * (H - t - b); };
      var s = '<desc id="lacChartDesc">Courbe illustrative de la concentration de lactate sanguin selon l’intensité, avec les seuils SL1, MLSS et SL2.</desc><defs><linearGradient id="lacFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4b2b" stop-opacity=".28"/><stop offset="1" stop-color="#ff4b2b" stop-opacity="0"/></linearGradient></defs>';
      var x0 = 0;
      ZONES.forEach(function (z) { var x1 = Math.min(1, z.to); s += '<rect class="zone-band" x="' + X(x0) + '" y="' + t + '" width="' + (X(x1) - X(x0)) + '" height="' + (H - t - b) + '" fill="' + z.c + '" fill-opacity=".06"/><text class="tick" x="' + ((X(x0) + X(x1)) / 2) + '" y="' + (t + 15) + '" text-anchor="middle" fill="' + z.c + '">Z' + z.z + "</text>"; x0 = x1; });
      for (var v = 0; v <= 10; v += 2) s += '<line class="grid" x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="tick" x="' + (l - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + "</text>";
      for (var k = 9; k <= 18; k += narrow ? 3 : 1.5) s += '<text class="tick" x="' + X((k - 9) / 9) + '" y="' + (H - b + 18) + '" text-anchor="middle">' + String(k).replace(".", ",") + "</text>";
      s += '<line class="axis" x1="' + l + '" x2="' + (W - r) + '" y1="' + (H - b) + '" y2="' + (H - b) + '"/><line class="axis" x1="' + l + '" x2="' + l + '" y1="' + t + '" y2="' + (H - b) + '"/>';
      s += '<text class="axis-label" x="' + (W - r) + '" y="' + (H - 6) + '" text-anchor="end">Vitesse (km/h)' + (narrow ? "" : " · coureur fictif") + '</text><text class="axis-label" x="' + 2 + '" y="' + (t - 8) + '">mmol/L</text>';
      var d = "";
      for (var i = 0; i <= 100; i++) { var xi = i / 100; d += (i ? "L" : "M") + X(xi).toFixed(1) + " " + Y(L(xi)).toFixed(1); }
      s += '<path class="area" d="' + d + " L" + X(1) + " " + Y(0) + " L" + X(0) + " " + Y(0) + ' Z"/><path class="curve" d="' + d + '"/>';
      [[0.45, "SL1", "#b8ff3b"], [0.66, "MLSS", "#eef2f5"], [0.72, "SL2", "#ff4b2b"]].forEach(function (m, j) {
        var mx = X(m[0]), my = Y(L(m[0])), lab = narrow ? m[1] : m[1] + " · " + L(m[0]).toFixed(1).replace(".", ",");
        s += '<g class="marker"><line x1="' + mx + '" x2="' + mx + '" y1="' + my + '" y2="' + (H - b) + '" stroke="' + m[2] + '"/><circle cx="' + mx + '" cy="' + my + '" r="5" fill="' + m[2] + '"/><text x="' + (mx + (j === 1 ? -10 : 10)) + '" y="' + (my - 12 - (j === 1 ? 16 : 0)) + '" fill="' + m[2] + '" text-anchor="' + (j === 1 ? "end" : "start") + '">' + lab + "</text></g>";
      });
      s += '<g class="probe"><line y1="' + t + '" y2="' + (H - b) + '"/><circle r="8"/></g>';
      svg.innerHTML = s;
      probe = svg.querySelector(".probe"); pl = probe.querySelector("line"); pc = probe.querySelector("circle");
      upd();
    }
    function upd() {
      var x = range.value / 100, v = L(x), z = ZONES.filter(function (q) { return x < q.to; })[0];
      pl.setAttribute("x1", X(x)); pl.setAttribute("x2", X(x)); pc.setAttribute("cx", X(x)); pc.setAttribute("cy", Y(v));
      oI.textContent = (9 + x * 9).toFixed(1).replace(".", ",") + " km/h";
      oL.textContent = v.toFixed(1).replace(".", ",") + " mmol/L";
      oZ.textContent = "Z" + z.z; oZ.style.color = z.c;
      oD.textContent = z.t;
    }
    range.addEventListener("input", upd);
    draw();
    var lastW = svg.parentElement.clientWidth, rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(svg.parentElement.clientWidth - lastW) > 20) { lastW = svg.parentElement.clientWidth; draw(); } }, 150); });
    if (G && !ET.calm) {
      var cv = svg.querySelector(".curve"), len = cv.getTotalLength();
      var o = { v: 0 };
      gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 75%", once: true } })
        .fromTo(cv, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", clearProps: "strokeDasharray,strokeDashoffset" })
        .from(svg.querySelector(".area"), { opacity: 0, duration: 0.8 }, 0.6)
        .from(svg.querySelectorAll(".marker"), { opacity: 0, y: 10, stagger: 0.15, duration: 0.5 }, 1)
        .fromTo(o, { v: 5 }, { v: 38, duration: 1.4, ease: "power2.inOut", onUpdate: function () { range.value = o.v; upd(); } }, 0.4);
    }
  }

  /* ---------- Coaching : semainier qui se réorganise ---------- */
  var DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], DAYS_L = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  var SLOTS = ["Matin", "Midi", "Soir"], SLOTS_L = ["matin", "midi", "soir"];
  var SESS = [
    { id: "nat1", type: "nat", label: "Natation technique", cells: ["1-1", "2-1", "4-1", "0-1"] },
    { id: "cap1", type: "cap", label: "Course seuil", cells: ["1-2", "2-2", "0-2", "4-2"] },
    { id: "velo1", type: "velo", label: "Vélo intensité", cells: ["3-2", "2-2", "4-2", "0-2"] },
    { id: "nat2", type: "nat", label: "Natation endurance", cells: ["3-1", "4-1", "2-1", "0-1"] },
    { id: "ppg", type: "ppg", label: "Renforcement", cells: ["4-1", "0-2", "2-1", "4-0"] },
    { id: "velo2", type: "velo", label: "Sortie longue vélo", cells: ["5-0", "6-0", "5-1"] },
    { id: "cap2", type: "cap", label: "Course longue", cells: ["6-0", "5-1", "6-1", "5-2"] }
  ];
  var FIXED = { "0-0": "Repos" };
  var CONS = { reunion: { "1-2": "Réunion" }, deplacement: { "3-1": "Déplacement", "3-2": "Déplacement" }, famille: { "5-0": "Enfants" } };
  function week() {
    var grid = $("#week"); if (!grid) return;
    var h = '<div class="week__corner"></div>' + DAYS.map(function (d, i) { return '<div class="week__day" data-d="' + i + '">' + d + "</div>"; }).join("");
    SLOTS.forEach(function (sl, si) {
      h += '<div class="week__slot-label" data-s="' + si + '">' + sl + "</div>";
      for (var d = 0; d < 7; d++) h += '<div class="week__cell" data-cell="' + d + "-" + si + '" data-d="' + d + '" data-s="' + si + '"></div>';
    });
    grid.innerHTML = h;
    var mq = window.matchMedia("(max-width: 640px)");
    function layout() {
      var tr = mq.matches;
      $(".week__corner", grid).style.cssText = "grid-column:1;grid-row:1";
      $$(".week__day", grid).forEach(function (e) { var d = +e.getAttribute("data-d"); e.style.gridColumn = tr ? 1 : d + 2; e.style.gridRow = tr ? d + 2 : 1; });
      $$(".week__slot-label", grid).forEach(function (e) { var si = +e.getAttribute("data-s"); e.style.gridColumn = tr ? si + 2 : 1; e.style.gridRow = tr ? 1 : si + 2; });
      $$(".week__cell", grid).forEach(function (e) { var d = +e.getAttribute("data-d"), si = +e.getAttribute("data-s"); e.style.gridColumn = tr ? si + 2 : d + 2; e.style.gridRow = tr ? d + 2 : si + 2; });
    }
    layout();
    if (mq.addEventListener) mq.addEventListener("change", layout); else if (mq.addListener) mq.addListener(layout);
    var nodes = {};
    SESS.forEach(function (x) { var el = document.createElement("div"); el.className = "sess"; el.setAttribute("data-type", x.type); el.innerHTML = '<i aria-hidden="true"></i>' + x.label; nodes[x.id] = el; });
    var active = {}, base = {};
    var log = $("#weekLog");
    function place(first) {
      var blocked = {}, k;
      for (k in FIXED) blocked[k] = { t: FIXED[k] };
      Object.keys(active).forEach(function (c) { if (active[c]) for (var kk in CONS[c]) blocked[kk] = { t: CONS[c][kk], n: true }; });
      var state = !first && G && window.Flip && !ET.calm ? Flip.getState(".sess") : null;
      $$(".week__cell", grid).forEach(function (cell) {
        var key = cell.getAttribute("data-cell"), b = blocked[key];
        cell.classList.toggle("is-blocked", !!b);
        $$(".blk", cell).forEach(function (n) { n.remove(); });
        if (b) cell.insertAdjacentHTML("afterbegin", '<span class="blk' + (b.n ? " blk--new" : "") + '">' + b.t + "</span>");
      });
      var used = {}, moves = [];
      SESS.forEach(function (x) {
        var target = null;
        for (var i = 0; i < x.cells.length; i++) { var c = x.cells[i]; if (!blocked[c] && !used[c]) { target = c; break; } }
        if (!target) { nodes[x.id].remove(); moves.push(x.label + " : reportée à la semaine suivante"); return; }
        used[target] = true;
        var tb = target.split("-");
        nodes[x.id].setAttribute("aria-label", x.label + ", " + DAYS_L[tb[0]] + " " + SLOTS_L[tb[1]]);
        $('[data-cell="' + target + '"]', grid).appendChild(nodes[x.id]);
        if (first) base[x.id] = target;
        else if (base[x.id] !== target) {
          var a = base[x.id].split("-");
          moves.push(x.label + " : " + DAYS_L[a[0]] + " " + SLOTS_L[a[1]] + " → " + DAYS_L[tb[0]] + " " + SLOTS_L[tb[1]]);
        }
      });
      if (state) Flip.from(state, { duration: 0.8, ease: "power3.inOut", stagger: 0.04, absolute: true, scale: true });
      if (!first) log.textContent = moves.length ? moves.length + (moves.length > 1 ? " séances déplacées. " : " séance déplacée. ") + moves.join(" · ") : "Plan de départ : aucune séance à déplacer.";
    }
    place(true);
    $$("[data-constraint]").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-constraint"); active[c] = !active[c];
        b.setAttribute("aria-pressed", active[c] ? "true" : "false");
        place(false);
      });
    });
  }

  /* ---------- Le coach : chiffres en chrono ---------- */
  function splits() {
    if (!G || ET.calm) return;
    ["#splits", "#splits2"].forEach(function (id) {
      var box = $(id); if (!box) return;
      var els = $$("[data-split-val]", box);
      ScrollTrigger.create({
        trigger: box, start: "top 82%", once: true,
        onEnter: function () {
          els.forEach(function (el, i) {
            var node = el.firstChild; if (!node || node.nodeType !== 3) return;
            scramble(node, el.getAttribute("data-split-val"), 0.9, i * 0.08);
          });
          gsap.from(box.children, { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" });
        }
      });
    });
  }

  /* ---------- Stages : agenda depuis le fichier de données ---------- */
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function d0(iso) { var d = new Date(iso + "T00:00:00"); return d; }
  function eur(n) { return n.toLocaleString("fr-FR") + " €"; }
  function range(s) {
    if (!s.debut) return "Dates à définir ensemble";
    var a = d0(s.debut), b = d0(s.fin);
    var sameM = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    return a.getDate() + (sameM ? "" : " " + a.toLocaleDateString("fr-FR", { month: "long" })) + " → " + ET.fmtDate(s.fin);
  }
  function imgTag(name, alt, sizes) {
    var w = (window.ET_IMG && window.ET_IMG[name]) || [640];
    var ss = w.map(function (x) { return "assets/img/" + name + "-" + x + ".webp " + x + "w"; }).join(", ");
    return '<img src="assets/img/' + name + "-" + w[Math.min(1, w.length - 1)] + '.webp" srcset="' + ss + '" sizes="' + sizes + '" alt="' + alt + '" loading="lazy" decoding="async">';
  }
  function stages() {
    var list = $("#stageList"); if (!list || !window.ET_STAGES) return;
    var all = window.ET_STAGES.map(function (s) {
      var past = !s.surMesure && s.fin && d0(s.fin) < TODAY;
      return Object.assign({ past: past }, s);
    });
    var avenir = all.filter(function (s) { return !s.past; }).sort(function (a, b) { return (a.debut || "9999") < (b.debut || "9999") ? -1 : 1; });
    var passes = all.filter(function (s) { return s.past; }).sort(function (a, b) { return a.debut < b.debut ? 1 : -1; });
    $('[data-filter="avenir"] .n').textContent = avenir.length;
    $('[data-filter="passes"] .n').textContent = passes.length;
    function card(s, feature) {
      var h = '<article class="stage' + (s.past ? " is-past" : "") + (feature ? " stage--feature" : "") + '"' + (feature ? "" : " data-tilt") + ">";
      h += '<div class="stage__badge">' + (s.past ? '<span class="chip">Passé</span>' : s.surMesure ? '<span class="chip chip--live">Toute l’année</span>' : '<span class="chip chip--live">À venir</span>') + '<span class="chip">' + s.places + (s.places > 2 ? " places max" : " personnes max") + "</span></div>";
      h += '<figure class="media' + (s.imageReelle ? " media--real" : "") + '">' + imgTag(s.image, s.imageAlt || "", "(max-width: 860px) 92vw, 46vw") + "</figure>";
      h += '<div class="stage__body"><div class="stage__when"><span>' + range(s) + '</span><span class="where">' + s.lieu + " · " + s.region + "</span></div>";
      h += '<h3 class="stage__title">' + s.titre + "</h3><p class=\"stage__desc\">" + s.resume + "</p>";
      var price = s.prix ? eur(s.prix) : "";
      if (s.tarifs && !s.past) {
        var cur = null;
        h += '<div class="tiers">' + s.tarifs.map(function (t) {
          var from = t.de ? d0(t.de) : null, to = t.jusqua ? d0(t.jusqua) : null;
          var now = (!from || from <= TODAY) && (!to || to >= TODAY), gone = to && to < TODAY;
          if (now) cur = t;
          return '<div class="tier' + (now ? " is-now" : gone ? " is-past" : "") + '"><b>' + eur(t.prix) + "</b><span>" + t.label + (t.jusqua ? " · jusqu’au " + d0(t.jusqua).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : " · ensuite") + "</span></div>";
        }).join("") + "</div>";
        if (cur && cur.jusqua) h += '<div class="countdown" data-countdown="' + cur.jusqua + 'T23:59:59+01:00"><span>Fin du tarif ' + cur.label.toLowerCase() + '</span><span class="countdown__t"></span></div>';
        price = cur ? eur(cur.prix) : eur(s.tarifs[s.tarifs.length - 1].prix);
      }
      if (!s.surMesure) {
        var known = typeof s.placesRestantes === "number";
        h += '<div class="gauge"><div class="gauge__bar' + (known ? "" : " is-unknown") + '" style="--n:' + s.places + '">';
        for (var i = 0; i < s.places; i++) h += "<i" + (known && i < s.places - s.placesRestantes ? ' class="on"' : "") + "></i>";
        h += '</div><div class="gauge__lab"><span>Jauge · ' + s.places + " places</span><span>" + (s.past ? "Stage terminé" : known ? s.placesRestantes + " places restantes" : 'Places restantes : <span class="todo">à compléter</span>') + "</span></div></div>";
      }
      h += '<div class="stage__foot"><div class="stage__price">' + (s.past ? '<span class="todo">prochaines dates à compléter</span>' : price + (s.surMesure ? " <small>" : "<small>") + s.prixNote + "</small>") + "</div>";
      if (s.page) h += '<a class="link-arrow" href="' + s.page + '" data-cursor="Ouvrir">Voir le stage <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a>';
      else h += '<button class="link-arrow" type="button" data-sheet="' + s.id + '">Voir la fiche <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>';
      h += "</div></div></article>";
      return h;
    }
    function show(which) {
      var arr = which === "passes" ? passes : avenir;
      list.innerHTML = arr.map(function (s, i) { return card(s, which === "avenir" && i === 0 && !!s.debut); }).join("");
      list.setAttribute("aria-labelledby", "tab-" + which);
      $$("[data-countdown]", list).forEach(ET.countdown);
      ET.bindTilt(list);
      if (G && !ET.calm) gsap.from(list.children, { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: list, start: "top 85%", once: true } });
      if (G) ScrollTrigger.refresh();
    }
    var tabs = $$(".tabs [data-filter]");
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); x.tabIndex = x === b ? 0 : -1; });
        show(b.getAttribute("data-filter"));
      });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); n.click();
      });
    });
    var next = avenir.filter(function (x) { return x.debut; })[0], nx = $("#nextStage");
    if (next && nx) {
      var cur = null;
      (next.tarifs || []).forEach(function (t) { var f = t.de ? d0(t.de) : null, to = t.jusqua ? d0(t.jusqua) : null; if ((!f || f <= TODAY) && (!to || to >= TODAY)) cur = t; });
      var w = (window.ET_IMG && window.ET_IMG[next.image]) || [640];
      nx.innerHTML = '<span class="next-stage__img"><img src="assets/img/' + next.image + "-" + w[0] + '.webp" alt=""></span><span class="next-stage__txt"><span>Prochain stage</span><strong>' + next.titre + "</strong><em>" + range(next) + " · " + next.lieu + "</em></span>" +
        '<span class="next-stage__price">' + eur(cur ? cur.prix : next.prix) + "<small>" + (cur && cur.jusqua ? "tarif " + cur.label.toLowerCase() + " · jusqu’au " + d0(cur.jusqua).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "par athlète") + "</small></span>";
      nx.hidden = false;
    }
    show("avenir");
    var dlg = $("#stageSheet"), body = $("#sheetBody");
    list.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sheet]"); if (!b) return;
      var s = all.filter(function (x) { return x.id === b.getAttribute("data-sheet"); })[0]; if (!s) return;
      var h = '<figure class="media media--real ratio-21x9" style="margin:-4px 0 0">' + imgTag(s.image, s.imageAlt || "", "720px") + "</figure>";
      h += '<span class="eyebrow">' + range(s) + " · " + s.lieu + "</span><h2 class=\"display h3\" id=\"sheetTitle\" style=\"font-size:clamp(1.6rem,3vw,2.4rem)\">" + s.titre + "</h2><p class=\"lead\">" + s.resume + "</p>";
      if (s.details) h += '<dl class="kv">' + s.details.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1].replace("À compléter.", '<span class="todo">à compléter</span>') + "</dd>"; }).join("") + "</dl>";
      h += '<div class="btn-row"><a class="btn" href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3g9Al6_7rFqDgDxq8xIlHyNEvZ44LqlH3CoWsQgGILkbGIf__lmKRDuOYDhqjKcB4P4H5pg5ft?gv=true" target="_blank" rel="noopener">Réserver un échange</a><a class="btn btn--ghost" href="' + s.lienSite + '" target="_blank" rel="noopener">Page actuelle du stage</a></div>';
      body.innerHTML = h;
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      document.documentElement.classList.add("verrou");
      if (ET.lenis) ET.lenis.stop();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    dlg.addEventListener("close", function () { document.documentElement.classList.remove("verrou"); if (ET.lenis) ET.lenis.start(); });
  }

  /* ---------- Carte de la zone d'intervention ---------- */
  function map() {
    var svg = $("#mapSvg"); if (!svg) return;
    var lon0 = 3.45, lat0 = 46.12, k = 300, cosL = Math.cos(45.2 * Math.PI / 180);
    var P = function (lat, lon) { return [(lon - lon0) * cosL * k + 20, (lat0 - lat) * k + 20]; };
    var base = { n: "Voiron", lat: 45.364, lon: 5.590 };
    var cities = [
      { n: "Lyon · Villeurbanne · Vénissieux", sn: "Lyon", lat: 45.75, lon: 4.85, a: "end", dx: -12, dy: -10 },
      { n: "Grenoble", lat: 45.188, lon: 5.724, dx: 12, dy: 18 },
      { n: "Chambéry", lat: 45.564, lon: 5.918, dx: 12, dy: 4 },
      { n: "Annecy", lat: 45.899, lon: 6.129, dx: 12, dy: 4 },
      { n: "Valence", lat: 44.933, lon: 4.892, a: "end", dx: -12, dy: 4 },
      { n: "Gap", lat: 44.559, lon: 6.079, a: "end", dx: -12, dy: 4 },
      { n: "Embrun", lat: 44.565, lon: 6.495, dx: 12, dy: 18 },
      { n: "Briançon · stage juillet 2027", sn: "Briançon", lat: 44.899, lon: 6.643, stage: true, a: "end", dx: -12, dy: -14 },
      { n: "Lac de Naussac · stage avril 2027", sn: "Naussac", lat: 44.735, lon: 3.83, stage: true, dx: 12, dy: 30 }
    ];
    var b = P(base.lat, base.lon), s = "";
    [50, 100].forEach(function (km) { var r = km / 111 * k; s += '<circle class="radius" cx="' + b[0] + '" cy="' + b[1] + '" r="' + r + '"/><text x="' + (b[0] + r * 0.71 + 6) + '" y="' + (b[1] - r * 0.71) + '" fill="rgba(255,75,43,.7)" font-family="JetBrains Mono, monospace" font-size="11">' + km + " km</text>"; });
    cities.forEach(function (c) {
      var p = P(c.lat, c.lon), mx = (b[0] + p[0]) / 2, my = (b[1] + p[1]) / 2 - 40;
      s += '<path class="link' + (c.stage ? " is-stage" : "") + '" d="M' + b[0] + " " + b[1] + " Q" + mx + " " + my + " " + p[0] + " " + p[1] + '"/>';
    });
    cities.forEach(function (c) {
      var p = P(c.lat, c.lon);
      var narrow = svg.getBoundingClientRect().width < 520 && svg.getBoundingClientRect().width > 0;
      if (narrow && (c.n === "Valence" || c.n === "Gap")) { c.a = "start"; c.dx = 12; }
      s += '<g class="city' + (c.stage ? " is-stage" : "") + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (narrow ? 8 : 5) + '"/><text x="' + (p[0] + (c.dx || 10)) + '" y="' + (p[1] + (c.dy || 4) * (narrow ? 1.6 : 1)) + '" text-anchor="' + (c.a || "start") + '">' + (narrow && c.sn ? c.sn : c.n) + "</text></g>";
    });
    s += '<circle class="ping" cx="' + b[0] + '" cy="' + b[1] + '" r="8"/><g class="city is-main"><circle cx="' + b[0] + '" cy="' + b[1] + '" r="8"/><text x="' + (b[0] - 14) + '" y="' + (b[1] + 5) + '" text-anchor="end" class="main">Voiron</text></g>';
    svg.innerHTML = s;
    if (!G || ET.calm) return;
    var links = $$(".link", svg);
    links.forEach(function (l) { var n = l.getTotalLength(); gsap.set(l, { strokeDasharray: l.classList.contains("is-stage") ? "4 6" : n, strokeDashoffset: l.classList.contains("is-stage") ? 0 : n }); });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 75%", once: true } })
      .from($$(".radius", svg), { scale: 0, transformOrigin: b[0] + "px " + b[1] + "px", duration: 1.2, stagger: 0.15, ease: "expo.out" })
      .to(links.filter(function (l) { return !l.classList.contains("is-stage"); }), { strokeDashoffset: 0, duration: 1.1, stagger: 0.07, ease: "power2.inOut" }, 0.2)
      .from(links.filter(function (l) { return l.classList.contains("is-stage"); }), { opacity: 0, duration: 0.8, stagger: 0.2 }, 0.8)
      .from($$(".city:not(.is-main)", svg), { opacity: 0, y: 6, duration: 0.5, stagger: 0.06 }, 0.5);
    gsap.fromTo($(".ping", svg), { attr: { r: 8 }, opacity: 0.9 }, { attr: { r: 46 }, opacity: 0, duration: 2, repeat: -1, ease: "power2.out" });
  }

  /* ---------- FAQ ---------- */
  function faq() {
    var items = $$("#faqList details");
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
        if (G && !ET.calm) {
          var bdy = $(".faq__body", d);
          gsap.from(bdy, { height: 0, autoAlpha: 0, duration: 0.6, ease: "expo.out", clearProps: "height", onComplete: function () { ScrollTrigger.refresh(); } });
          gsap.from($(".media", d), { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.out", delay: 0.1 });
        }
      });
    });
  }

  /* ---------- RDV simulé ---------- */
  function booking() {
    var dEl = $("#bookDays"), sEl = $("#bookSlots"), out = $("#bookOut"); if (!dEl) return;
    var days = [], d = new Date(); d.setHours(12);
    while (days.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); }
    var SL = ["07:30", "12:15", "18:30", "20:00"], selD = null;
    dEl.innerHTML = days.map(function (x, i) { return '<button type="button" aria-pressed="false" data-d="' + i + '">' + x.toLocaleDateString("fr-FR", { weekday: "short" }) + "<b>" + x.getDate() + "</b>" + x.toLocaleDateString("fr-FR", { month: "short" }) + "</button>"; }).join("");
    function slots(i) {
      sEl.innerHTML = SL.map(function (s, j) { var full = (i * 3 + j * 5) % 4 === 0; return '<button type="button" aria-pressed="false" data-s="' + s + '"' + (full ? " disabled style=\"opacity:.35;text-decoration:line-through\"" : "") + ">" + s + "</button>"; }).join("");
    }
    slots(0);
    dEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-d]"); if (!b) return;
      $$("[data-d]", dEl).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      selD = days[+b.getAttribute("data-d")]; slots(+b.getAttribute("data-d"));
      out.innerHTML = "Choisissez maintenant une heure.";
    });
    sEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-s]"); if (!b || b.disabled) return;
      if (!selD) { out.textContent = "Choisissez d’abord un jour."; return; }
      $$("[data-s]", sEl).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      out.innerHTML = "<strong>Démo</strong> : " + selD.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + " à " + b.getAttribute("data-s") + ". Rien n’est réservé ici : ouvrez le vrai agenda pour confirmer.";
    });
  }

  /* ---------- Lancement ---------- */
  ET.onReady(function () {
    [manifesto, week, chart, stages, map, faq, booking].forEach(function (f) { try { f(); } catch (err) { console.error(err); } });
    intro(heroIn);
    disciplines(); principles(); splits();
    if (G) ScrollTrigger.refresh();
  });
})();
