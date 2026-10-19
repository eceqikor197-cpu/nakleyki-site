/* ==== Настройки сайта: поменяйте здесь ==== */
var SITE = {
  bot: "",            // username Telegram-бота без @, например "my_sticker_bot"
  pricePerCm2: 0.38,  // ₽ за 1 см² (печать + резка)
  minOrder: 100       // минимальный заказ, ₽
};

(function () {
  document.documentElement.classList.remove("no-js");

  // ссылки на бота
  if (SITE.bot) {
    document.querySelectorAll("[data-tg]").forEach(function (a) {
      a.href = "https://t.me/" + SITE.bot;
    });
  }

  // шапка при прокрутке
  var header = document.querySelector(".header");
  function onScroll() { header && header.classList.toggle("scrolled", window.scrollY > 10); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // мобильное меню
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".menu a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  // появление блоков
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // год в подвале
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // калькулятор
  var calc = document.querySelector("[data-calc]");
  if (!calc) return;
  var w = calc.querySelector("[name=w]"), h = calc.querySelector("[name=h]"), q = calc.querySelector("[name=q]");
  var shapeBtns = calc.querySelectorAll("[data-shape]");
  var shape = "rect";
  var fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
  var fmt1 = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

  function qty(v) { // ползунок 0..100 → 1..1000 штук по логарифмической шкале
    var n = Math.round(Math.pow(10, v / 100 * 3));
    return n < 10 ? n : n < 100 ? Math.round(n / 5) * 5 : Math.round(n / 10) * 10;
  }

  function update() {
    var W = +w.value, H = +h.value, Q = qty(+q.value);
    var one = W * H * SITE.pricePerCm2;
    var total = Math.max(one * Q, SITE.minOrder);
    calc.querySelector("[data-out=w]").textContent = W + " см";
    calc.querySelector("[data-out=h]").textContent = H + " см";
    calc.querySelector("[data-out=q]").textContent = fmt.format(Q) + " шт.";
    calc.querySelector("[data-out=total]").textContent = fmt.format(Math.ceil(total)) + " ₽";
    calc.querySelector("[data-out=one]").textContent =
      (one * Q < SITE.minOrder ? "минимальный заказ " + SITE.minOrder + " ₽ · " : "") +
      "≈ " + fmt1.format(Math.max(one, total / Q)) + " ₽ за штуку";
    var s = calc.querySelector(".shape");
    var k = 150 / Math.max(W, H);
    s.style.width = Math.max(W * k, 26) + "px";
    s.style.height = Math.max(H * k, 26) + "px";
    s.style.borderRadius = shape === "circle" ? "50%" : shape === "round" ? "28% 42% 30% 46% / 40% 30% 44% 32%" : "10px";
    s.style.outlineOffset = shape === "circle" ? "6px" : "6px";
    s.textContent = W + "×" + H;
  }

  shapeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      shapeBtns.forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      shape = b.dataset.shape;
      if (shape === "circle") h.value = w.value;
      update();
    });
  });
  [w, h, q].forEach(function (el) {
    el.addEventListener("input", function () {
      if (shape === "circle") { if (el === w) h.value = w.value; if (el === h) w.value = h.value; }
      update();
    });
  });
  update();
})();
