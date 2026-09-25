/* SpiceRoute — concept ordering demo.
   A genuinely working cart: add / increment / decrement / remove, subtotal,
   sample VAT, total. Nothing persists, nothing is sent anywhere. */
(function () {
  "use strict";

  var VAT_RATE = 0.2; // sample figure for demo math only

  /* ---- state ---- */
  var cart = []; // [{ id, name, price, qty }]

  function find(id) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i];
    return null;
  }
  function add(id, name, price) {
    var line = find(id);
    if (line) line.qty += 1;
    else cart.push({ id: id, name: name, price: price, qty: 1 });
    render();
  }
  function setQty(id, qty) {
    var line = find(id);
    if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) cart.splice(cart.indexOf(line), 1);
    render();
  }

  function money(n) { return "£" + n.toFixed(2); }

  /* ---- elements ---- */
  var cartBtn = document.getElementById("cartBtn");
  var cartCount = document.getElementById("cartCount");
  var cartPanel = document.getElementById("cartPanel");
  var cartClose = document.getElementById("cartClose");
  var scrim = document.getElementById("scrim");
  var listEl = document.getElementById("cartList");
  var emptyEl = document.getElementById("cartEmpty");
  var subEl = document.getElementById("sumSub");
  var vatEl = document.getElementById("sumVat");
  var totEl = document.getElementById("sumTotal");
  var placeBtn = document.getElementById("placeBtn");
  var clearBtn = document.getElementById("clearBtn");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  /* ---- render ---- */
  function render() {
    var units = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    cartCount.textContent = String(units);

    listEl.textContent = "";
    cart.forEach(function (line) {
      var li = document.createElement("li");
      li.className = "cart__item";

      var info = document.createElement("div");
      var h = document.createElement("h3");
      h.textContent = line.name;
      var p = document.createElement("p");
      p.className = "line-price mono";
      p.textContent = money(line.price) + " each";
      info.appendChild(h);
      info.appendChild(p);

      var qty = document.createElement("div");
      qty.className = "qty";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Decrease " + line.name + " quantity");
      minus.addEventListener("click", function () { setQty(line.id, line.qty - 1); });
      var out = document.createElement("output");
      out.textContent = String(line.qty);
      out.setAttribute("aria-label", line.name + " quantity");
      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase " + line.name + " quantity");
      plus.addEventListener("click", function () { setQty(line.id, line.qty + 1); });
      qty.appendChild(minus);
      qty.appendChild(out);
      qty.appendChild(plus);

      var total = document.createElement("span");
      total.className = "line-price mono";
      total.style.gridColumn = "2";
      total.style.textAlign = "right";
      total.textContent = money(line.price * line.qty);

      li.appendChild(info);
      li.appendChild(qty);
      li.appendChild(total);
      listEl.appendChild(li);
    });

    var sub = cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
    var vat = sub * VAT_RATE;
    emptyEl.hidden = cart.length > 0;
    listEl.hidden = cart.length === 0;
    subEl.textContent = money(sub);
    vatEl.textContent = money(vat);
    totEl.textContent = money(sub + vat);
    placeBtn.disabled = cart.length === 0;
  }

  /* ---- open / close panel ---- */
  var lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    cartPanel.classList.add("is-open");
    cartPanel.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("is-open"); });
    cartClose.focus();
  }
  function closeCart() {
    cartPanel.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    scrim.classList.remove("is-open");
    setTimeout(function () { scrim.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cartPanel.classList.contains("is-open")) closeCart();
  });

  /* ---- menu add buttons ---- */
  document.querySelectorAll(".item__add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      add(btn.getAttribute("data-id"), btn.getAttribute("data-name"), parseFloat(btn.getAttribute("data-price")));
      btn.classList.remove("is-added");
      void btn.offsetWidth;
      btn.classList.add("is-added");
      cartBtn.classList.remove("is-nudge");
      void cartBtn.offsetWidth;
      cartBtn.classList.add("is-nudge");
    });
  });

  /* ---- clear + fake place order ---- */
  clearBtn.addEventListener("click", function () {
    cart = [];
    render();
    showToast("Cart emptied. The void thanks you.");
  });
  placeBtn.addEventListener("click", function () {
    var units = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    var sub = cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
    showToast("Demo order noted: " + units + " item" + (units === 1 ? "" : "s") +
      ", " + money(sub * (1 + VAT_RATE)) + " total — nothing was sent, charged, or cooked.");
    cart = [];
    render();
    closeCart();
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-shown"); }, 4200);
  }

  /* ---- sticky category nav active state ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".catnav__link"));
  var sections = links.map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  }).filter(Boolean);

  function syncNav() {
    var pos = window.scrollY + 160;
    var current = sections[0];
    sections.forEach(function (sec) { if (sec.offsetTop <= pos) current = sec; });
    links.forEach(function (a) {
      a.classList.toggle("is-active", current && a.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  /* ---- reveal fallback ---- */
  var supportsSDA = CSS.supports && CSS.supports("animation-timeline", "view()");
  if (!supportsSDA && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else if (!supportsSDA) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  render();
})();
