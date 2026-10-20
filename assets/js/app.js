/* ==========================================================================
   ET² — comportements communs à toutes les pages
   (défilement fluide, curseur, boutons magnétiques, HUD d'effort, zones,
   révélations, transitions de page, mode calme, comptes à rebours)
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  var ET = (window.ET = window.ET || {});
  var hasGSAP = !!window.gsap;

  ET.store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    sdel: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  ET.calm = html.classList.contains("calm");
  ET.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  ET.$ = function (s, r) { return (r || document).querySelector(s); };
  ET.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  ET.today = new Date();
  ET.fmtDate = function (iso, opts) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("fr-FR", opts || { day: "numeric", month: "long", year: "numeric" });
  };

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Flip) gsap.registerPlugin(Flip);
    gsap.config({ nullTargetWarn: false });
  }

  /* ---------- Mode calme ---------- */
  ET.$$("[data-calm-toggle]").forEach(function (b) {
    b.setAttribute("aria-pressed", ET.calm ? "true" : "false");
    b.addEventListener("click", function () {
      ET.store.set("et-calm", ET.calm ? "0" : "1");
      window.location.reload();
    });
  });

  /* ---------- Défilement fluide (Lenis) ---------- */
  if (!ET.calm && hasGSAP && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.105, smoothWheel: true, wheelMultiplier: 1 });
    ET.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  ET.scrollTo = function (target) {
    var off = -(ET.$(".header") ? ET.$(".header").offsetHeight : 0) - 8;
    if (ET.lenis) ET.lenis.scrollTo(target, { offset: off, duration: 1.4 });
    else {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: ET.calm ? "auto" : "smooth" });
    }
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    ET.scrollTo(t);
    if (t.hasAttribute("tabindex") || /^(A|BUTTON|INPUT)$/.test(t.tagName)) t.focus({ preventScroll: true });
  });

  /* ---------- En-tête ---------- */
  var header = ET.$(".header");
  var lastY = window.scrollY;
  function onScrollHeader() {
    var y = ET.lenis ? ET.lenis.scroll : window.scrollY;
    if (!header) return;
    header.classList.toggle("is-scrolled", y > 40);
    if (!document.body.classList.contains("menu-open")) header.classList.toggle("is-hidden", y > lastY + 4 && y > 400);
    if (y < lastY - 4) header.classList.remove("is-hidden");
    lastY = y;
  }
  if (ET.lenis) ET.lenis.on("scroll", onScrollHeader); else window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Menu mobile ---------- */
  var menuBtn = ET.$(".menu-btn");
  function closeMenu() {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (ET.lenis) ET.lenis.start();
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (ET.lenis) open ? ET.lenis.stop() : ET.lenis.start();
      if (open && hasGSAP && !ET.calm) gsap.from(".mnav li", { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.6, ease: "expo.out" });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }
  ET.closeMenu = closeMenu;

  /* ---------- Copier ---------- */
  ET.$$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = b.getAttribute("data-copy");
      var done = function () {
        var old = b.textContent; b.textContent = "Copié"; b.classList.add("is-done");
        setTimeout(function () { b.textContent = old; b.classList.remove("is-done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { selectNear(b); });
      } else selectNear(b);
    });
  });
  function selectNear(b) {
    var v = b.parentElement && b.parentElement.querySelector(".val");
    if (!v) return;
    var r = document.createRange(); r.selectNodeContents(v);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  /* ---------- Année ---------- */
  ET.$$("[data-year]").forEach(function (el) { el.textContent = ET.today.getFullYear(); });

  /* ---------- Comptes à rebours ---------- */
  ET.countdown = function (el) {
    var end = new Date(el.getAttribute("data-countdown")).getTime();
    var out = el.querySelector(".countdown__t") || el;
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) { out.innerHTML = "<span>terminé</span>"; return false; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      out.innerHTML = "<span>" + d + "<small>j</small></span><span>" + pad(h) + "<small>h</small></span><span>" + pad(m) + "<small>min</small></span><span>" + pad(s) + "<small>s</small></span>";
      return true;
    }
    if (tick()) { var id = setInterval(function () { if (!tick()) clearInterval(id); }, 1000); }
  };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  ET.pad = pad;

  /* ---------- Vidéos : lecture seulement à l'écran, jamais en mode calme ---------- */
  ET.$$("video[data-autoplay]").forEach(function (v) {
    v.muted = true; v.playsInline = true; v.loop = true;
    var small = v.getAttribute("data-src-small"), ps = v.getAttribute("data-poster-small");
    if (window.innerWidth < 760) { if (ps) v.poster = ps; if (small && !ET.calm) v.src = small; }
    if (ET.calm) { v.removeAttribute("autoplay"); v.preload = "none"; v.pause(); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.05 }).observe(v);
    } else { v.play(); }
  });

  /* ---------- Curseur « point de mesure » ---------- */
  var cursor = ET.$(".cursor");
  if (cursor && ET.fine && !ET.calm && hasGSAP) {
    var dot = cursor.querySelector(".cursor__dot"), ring = cursor.querySelector(".cursor__ring"), lab = cursor.querySelector(".cursor__label");
    var xd = gsap.quickTo(dot, "x", { duration: 0.08 }), yd = gsap.quickTo(dot, "y", { duration: 0.08 });
    var xr = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), yr = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    var xl = gsap.quickTo(lab, "x", { duration: 0.45, ease: "power3" }), yl = gsap.quickTo(lab, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", function (e) {
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); xl(e.clientX); yl(e.clientY);
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("a, button, summary, [data-cursor], input[type=range], label");
      cursor.classList.toggle("is-hover", !!t);
      lab.textContent = t && t.getAttribute("data-cursor") ? t.getAttribute("data-cursor") : "";
    });
    document.addEventListener("pointerleave", function () { gsap.to(cursor, { autoAlpha: 0, duration: 0.2 }); });
    document.addEventListener("pointerenter", function () { gsap.to(cursor, { autoAlpha: 1, duration: 0.2 }); });
  }

  /* ---------- Boutons magnétiques et cartes inclinées ---------- */
  if (ET.fine && !ET.calm && hasGSAP) {
    ET.$$("[data-magnetic]").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-magnetic")) || 0.35;
      var qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      var qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * s); qy((e.clientY - r.top - r.height / 2) * s);
      });
      el.addEventListener("pointerleave", function () { qx(0); qy(0); });
    });
    ET.bindTilt = function (root) {
      ET.$$("[data-tilt]", root).forEach(function (el) {
        if (el._tilt) return; el._tilt = true;
        gsap.set(el, { transformPerspective: 900 });
        var rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
        var ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7); rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        el.addEventListener("pointerleave", function () { rx(0); ry(0); });
      });
    };
    ET.bindTilt(document);
  } else { ET.bindTilt = function () {}; }

  /* ---------- HUD : la vitesse de défilement devient une intensité ---------- */
  var ZC = ["#6fa8c9", "#b8ff3b", "#ffd25c", "#ff8a3d", "#ff4b2b"];
  ET.zoneColors = ZC;
  ET.lactate = function (x) { return 0.9 + 0.32 * Math.exp(3.2 * x) - 0.32 + 0.6 * x; }; /* courbe illustrative, x de 0 à 1 */
  var hud = ET.$(".hud"), pill = ET.$(".zone-pill");
  if ((hud || pill) && hasGSAP) {
    var zEl = hud && hud.querySelector(".hud__zone b"), bars = hud ? ET.$$(".hud__bar i", hud) : [];
    var fcEl = hud && hud.querySelector("[data-hud=fc]"), alEl = hud && hud.querySelector("[data-hud=allure]");
    var dotEl = hud && hud.querySelector(".hud__dot"), curve = hud && hud.querySelector(".hud__curve");
    var CW = 24, CH = 84;
    var cx = function (t) { return (2 + (ET.lactate(t) - 0.9) / 7.6 * 20).toFixed(1); };
    if (curve) {
      var d = "", i;
      for (i = 0; i <= 30; i++) { var x = i / 30; d += (i ? "L" : "M") + cx(x) + " " + (x * CH).toFixed(1); }
      curve.setAttribute("d", d);
    }
    var effort = 0, py = window.scrollY, pt = performance.now(), acc = 0, zone = 1;
    gsap.ticker.add(function () {
      var now = performance.now(), y = ET.lenis ? ET.lenis.scroll : window.scrollY;
      var dt = Math.max(8, now - pt), v = Math.abs(y - py) / dt;
      py = y; pt = now;
      var target = ET.calm ? 0 : Math.min(1, v / 3);
      effort += (target - effort) * (target > effort ? 0.07 : 0.018);
      acc += dt;
      if (acc < 90) return; acc = 0;
      var z = effort < 0.12 ? 1 : effort < 0.3 ? 2 : effort < 0.5 ? 3 : effort < 0.72 ? 4 : 5;
      var c = ZC[z - 1];
      if (hud) {
        hud.style.setProperty("--hud-c", c);
        if (z !== zone) { zEl.textContent = "Z" + z; bars.forEach(function (b, k) { b.classList.toggle("on", k < z); }); }
        fcEl.textContent = Math.round(104 + effort * 82);
        var sec = Math.round(400 - effort * 205);
        alEl.textContent = Math.floor(sec / 60) + ":" + pad(sec % 60);
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        var p = Math.min(1, Math.max(0, y / max));
        if (dotEl) dotEl.setAttribute("transform", "translate(" + cx(p) + " " + (p * CH).toFixed(1) + ")");
      }
      if (pill && z !== zone) { pill.textContent = "Z" + z; pill.style.color = c; }
      zone = z;
    });
  }

  if (hud && hasGSAP) {
    var heroEl = ET.$(".hero, .phero");
    if (heroEl) ScrollTrigger.create({ trigger: heroEl, start: "bottom 70%", onEnter: function () { hud.classList.add("is-on"); }, onLeaveBack: function () { hud.classList.remove("is-on"); } });
    else hud.classList.add("is-on");
  }

  /* ---------- Zones de fond (Z1 → Z5) ---------- */
  var ZB = { 1: "#0b1016", 2: "#0a1a24", 3: "#0e202c", 4: "#1f151b", 5: "#2b100d" };
  if (hasGSAP) {
    ET.$$("[data-zone]").forEach(function (sec) {
      var z = sec.getAttribute("data-zone");
      ScrollTrigger.create({
        trigger: sec, start: "top 60%", end: "bottom 60%",
        onToggle: function (self) {
          if (!self.isActive) return;
          gsap.to(document.body, { backgroundColor: ZB[z], duration: ET.calm ? 0 : 1.1, ease: "power2.out", overwrite: true });
          document.body.setAttribute("data-current-zone", z);
        }
      });
    });
  }

  /* ---------- Révélations ---------- */
  ET.reveal = function (root) {
    if (!hasGSAP || ET.calm) return;
    ET.$$("[data-reveal]", root).forEach(function (el) {
      if (el._rv) return; el._rv = true;
      var dl = parseFloat(el.getAttribute("data-delay")) || 0;
      gsap.from(el, { y: 44, autoAlpha: 0, duration: 1.1, delay: dl, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    ET.$$("[data-stagger]", root).forEach(function (el) {
      if (el._st) return; el._st = true;
      gsap.from(el.children, { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    ET.$$("[data-clip]", root).forEach(function (el) {
      if (el._cl) return; el._cl = true;
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    ET.$$("[data-parallax-img]", root).forEach(function (img) {
      if (img._px) return; img._px = true;
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    ET.$$("[data-draw]", root).forEach(function (p) {
      if (p._dr) return; p._dr = true;
      var len = p.getTotalLength ? p.getTotalLength() : 1000;
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: p.closest("svg") || p, start: "top 80%", once: true } });
    });
  };
  ET.splitHeads = function (root) {
    if (!hasGSAP || ET.calm || !window.SplitText) return;
    ET.$$("[data-split]", root).forEach(function (el) {
      if (el._sp) return; el._sp = true;
      var s = new SplitText(el, { type: "lines", mask: "lines", linesClass: "sl" });
      gsap.from(s.lines, { yPercent: 110, duration: 1.15, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  };

  /* ---------- Transitions de page (balayage des zones) ---------- */
  var sweep = ET.$(".sweep");
  var bands = sweep ? ET.$$("i", sweep) : [];
  ET.sweepIn = function () {
    if (!sweep || !hasGSAP) return;
    if (ET.store.sget("et-sweep") === "1" && !ET.calm) {
      ET.store.sdel("et-sweep");
      gsap.set(bands, { scaleY: 1 });
      gsap.to(bands, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.7, stagger: 0.06, ease: "power3.inOut", delay: 0.05 });
      return true;
    }
    return false;
  };
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
    if (ET.calm || !hasGSAP || !sweep) return;
    e.preventDefault();
    ET.store.sset("et-sweep", "1");
    gsap.set(bands, { transformOrigin: "50% 100%" });
    gsap.to(bands, { scaleY: 1, duration: 0.55, stagger: 0.06, ease: "power3.inOut", onComplete: function () { window.location.href = href; } });
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted && hasGSAP) gsap.set(bands, { scaleY: 0 }); });

  /* ---------- Initialisation après chargement des polices ---------- */
  ET._q = ET._q || [];
  ET.onReady = function (fn) { if (ET._ready) fn(); else ET._q.push(fn); };
  function init() {
    if (ET._ready) return;
    ET._ready = true;
    ET._q.forEach(function (fn) { try { fn(); } catch (err) { console.error(err); } });
    ET.splitHeads(document);
    ET.reveal(document);
    if (hasGSAP) ScrollTrigger.refresh();
  }
  function boot() {
    var f = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([f, new Promise(function (r) { setTimeout(r, 2500); })]).then(init);
  }
  if (document.readyState === "complete") boot(); else document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", function () { if (hasGSAP) ScrollTrigger.refresh(); });
})();
