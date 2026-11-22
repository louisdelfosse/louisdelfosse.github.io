/* Portfolio Louis Delfosse
   - petit robot qui roule sur le rail sous le menu en suivant le défilement
   - il laisse des traces de roues orange qui s'effacent en ~1,6 s
   - repères cliquables vers chaque section (éléments [data-waypoint])
   - menu mobile + visionneuse d'images                                      */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var btn = document.querySelector(".menu-btn");
  var menu = document.querySelector(".nav ul");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") menu.classList.remove("open");
    });
  }

  /* ---------- Visionneuse ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  document.querySelectorAll("figure img").forEach(function (img) {
    img.addEventListener("click", function () {
      lb.querySelector("img").src = img.src;
      lb.querySelector("img").alt = img.alt;
      lb.classList.add("open");
    });
  });
  lb.addEventListener("click", function () { lb.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });

  /* ---------- Rail + robot ---------- */
  var rail = document.querySelector(".rail");
  if (!rail) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  rail.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  // Robot en SVG : châssis marine, capteur orange, deux roues à rayons
  var robot = document.createElement("div");
  robot.className = "robot";
  robot.innerHTML =
    '<svg viewBox="0 0 34 24" width="34" height="24" aria-hidden="true">' +
    '<rect x="5" y="3" width="22" height="11" rx="3" fill="#e8eef8"/>' +
    '<rect x="8" y="6" width="9" height="5" rx="1.5" fill="#183262"/>' +
    '<circle class="eye" cx="24" cy="8.5" r="2" fill="#f08a24"/>' +
    '<line x1="16" y1="3" x2="16" y2="0.8" stroke="#e8eef8" stroke-width="1.2"/>' +
    '<circle cx="16" cy="0.8" r="1" fill="#f08a24"/>' +
    '<g class="wheel"><circle cx="10" cy="18" r="5" fill="#0b1a33" stroke="#e8eef8" stroke-width="1.4"/>' +
    '<line x1="10" y1="14" x2="10" y2="22" stroke="#e8eef8" stroke-width="1"/><line x1="6" y1="18" x2="14" y2="18" stroke="#e8eef8" stroke-width="1"/></g>' +
    '<g class="wheel"><circle cx="24" cy="18" r="5" fill="#0b1a33" stroke="#e8eef8" stroke-width="1.4"/>' +
    '<line x1="24" y1="14" x2="24" y2="22" stroke="#e8eef8" stroke-width="1"/><line x1="20" y1="18" x2="28" y2="18" stroke="#e8eef8" stroke-width="1"/></g>' +
    "</svg>";
  rail.appendChild(robot);
  var svg = robot.querySelector("svg");
  var wheels = robot.querySelectorAll(".wheel");

  // Repères des sections
  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-waypoint]"));
  var marks = targets.map(function (el) {
    var a = document.createElement("a");
    a.className = "waypoint";
    a.href = "#" + el.id;
    a.textContent = el.getAttribute("data-waypoint");
    a.setAttribute("aria-label", "Aller à : " + el.getAttribute("data-waypoint"));
    rail.appendChild(a);
    return a;
  });

  var ROBOT_W = 34, MARGIN = 14, FADE_MS = 1600;
  var W = 0, H = 0, dpr = 1, x = MARGIN, lastX = null, dir = 1, trail = [];

  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  function travel() { return Math.max(1, W - ROBOT_W - 2 * MARGIN); }
  function posFor(scrollY) { return MARGIN + travel() * Math.min(1, Math.max(0, scrollY / maxScroll())); }

  function layout() {
    dpr = window.devicePixelRatio || 1;
    W = rail.clientWidth; H = rail.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    targets.forEach(function (el, i) {
      var y = el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
      marks[i].style.left = (posFor(y) + ROBOT_W / 2) + "px";
      marks[i].dataset.y = y;
    });
    lastX = null;
    update();
  }

  function update() {
    var sy = window.scrollY;
    x = posFor(sy);
    if (lastX !== null && Math.abs(x - lastX) > 0.3) {
      dir = x > lastX ? 1 : -1;
      if (!reduce) {
        // une trace par roue, découpée tous les 4 px pour un effet « chenille »
        var step = 4, from = lastX, to = x, n = Math.ceil(Math.abs(to - from) / step), now = performance.now();
        for (var k = 0; k < n; k++) {
          var a = from + (to - from) * (k / n), b = from + (to - from) * ((k + 0.6) / n);
          trail.push({ a: a + 10, b: b + 10, t: now });
          trail.push({ a: a + 24, b: b + 24, t: now });
        }
        if (trail.length > 1200) trail.splice(0, trail.length - 1200);
      }
    }
    lastX = x;
    robot.style.transform = "translateX(" + x + "px)";
    svg.style.transform = dir < 0 ? "scaleX(-1)" : "none";
    var angle = (x / 5) * (180 / Math.PI);
    wheels.forEach(function (w) { w.style.transform = "rotate(" + angle + "deg)"; });

    // section active = dernier repère dépassé
    var active = -1;
    marks.forEach(function (m, i) { if (sy + 2 >= parseFloat(m.dataset.y || 0)) active = i; });
    marks.forEach(function (m, i) { m.classList.toggle("active", i === active); });
  }

  function draw() {
    var now = performance.now();
    ctx.clearRect(0, 0, W, H);
    while (trail.length && now - trail[0].t > FADE_MS) trail.shift();
    var y = H - 6.5;
    for (var i = 0; i < trail.length; i++) {
      var s = trail[i], alpha = 1 - (now - s.t) / FADE_MS;
      ctx.strokeStyle = "rgba(240,138,36," + (0.85 * alpha).toFixed(3) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s.a, y); ctx.lineTo(s.b, y); ctx.stroke();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  layout();
  if (!reduce) requestAnimationFrame(draw);
})();
