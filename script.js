(function () {
  "use strict";

  var DELIVERY_FEE = 3.5;

  /* ---- Mobile Navigation Toggle ---- */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.hidden = expanded;
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      });
    });
  }

  /* ---- Active Nav Highlight ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks.map(function (a) {
    var href = a.getAttribute("href");
    return href === "#top" ? document.body : document.querySelector(href);
  }).filter(Boolean);

  function syncNav() {
    var scrollPos = window.scrollY + 180;
    var activeHref = "#top";
    sections.forEach(function (sec, idx) {
      if (sec !== document.body && sec.offsetTop <= scrollPos) {
        activeHref = navLinks[idx].getAttribute("href");
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === activeHref);
    });
  }
  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  /* ---- Menu Category Filter Tabs ---- */
  var filterTabs = document.querySelectorAll(".filter-tab");
  var menuCards = document.querySelectorAll(".menu-card");

  function applyFilter(cat) {
    filterTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-filter") === cat;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    menuCards.forEach(function (card) {
      var match = cat === "all" || card.getAttribute("data-category") === cat;
      card.classList.toggle("is-hidden", !match);
    });
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      applyFilter(tab.getAttribute("data-filter"));
    });
  });

  document.querySelectorAll(".jump-category").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      applyFilter(cat);
      var menuSection = document.getElementById("menu");
      if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---- Expandable Testimonial Cards ---- */
  var testimonialCards = document.querySelectorAll(".testimonial-card");
  testimonialCards.forEach(function (card) {
    card.addEventListener("click", function () {
      testimonialCards.forEach(function (other) {
        other.classList.remove("is-expanded");
        other.setAttribute("aria-expanded", "false");
      });
      card.classList.add("is-expanded");
      card.setAttribute("aria-expanded", "true");
    });
  });

  /* ---- Toast Notification ---- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 3800);
  }

  /* ---- Interactive Cart & Slide-Out Drawer ---- */
  var cart = [];
  var fulfillment = "delivery";

  var cartDrawer = document.getElementById("cartDrawer");
  var drawerScrim = document.getElementById("drawerScrim");
  var drawerClose = document.getElementById("drawerClose");
  var cartItemsEl = document.getElementById("cartItems");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var cartSubEl = document.getElementById("cartSub");
  var cartFeeEl = document.getElementById("cartFee");
  var feeLabelEl = document.getElementById("feeLabel");
  var cartTotalEl = document.getElementById("cartTotal");
  var placeOrderBtn = document.getElementById("placeOrderBtn");
  var clearCartBtn = document.getElementById("clearCartBtn");
  var floatingBag = document.getElementById("floatingBag");
  var floatingBagCount = document.getElementById("floatingBagCount");
  var floatingBagTotal = document.getElementById("floatingBagTotal");
  var openBagFooter = document.getElementById("openBagFooter");
  var browseFromCart = document.getElementById("browseFromCart");

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function openDrawer() {
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    drawerScrim.hidden = false;
    drawerClose.focus();
  }

  function closeDrawer() {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    drawerScrim.hidden = true;
  }

  function renderCart() {
    var totalUnits = 0;
    var sub = 0;
    cartItemsEl.textContent = "";

    cart.forEach(function (item) {
      totalUnits += item.qty;
      sub += item.price * item.qty;

      var li = document.createElement("li");
      li.className = "cart-line";

      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      img.setAttribute("referrerpolicy", "no-referrer");

      var info = document.createElement("div");
      var title = document.createElement("h4");
      title.textContent = item.name;
      var price = document.createElement("p");
      price.className = "cart-line-price tabular-nums";
      price.textContent = money(item.price * item.qty);
      info.appendChild(title);
      info.appendChild(price);

      var qty = document.createElement("div");
      qty.className = "qty-controls";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Decrease " + item.name);
      minus.addEventListener("click", function () { updateQty(item.id, item.qty - 1); });

      var count = document.createElement("span");
      count.className = "tabular-nums";
      count.textContent = String(item.qty);

      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase " + item.name);
      plus.addEventListener("click", function () { updateQty(item.id, item.qty + 1); });

      qty.appendChild(minus);
      qty.appendChild(count);
      qty.appendChild(plus);

      li.appendChild(img);
      li.appendChild(info);
      li.appendChild(qty);
      cartItemsEl.appendChild(li);
    });

    var fee = cart.length > 0 && fulfillment === "delivery" ? DELIVERY_FEE : 0;
    var grandTotal = sub + fee;

    cartEmptyEl.hidden = cart.length > 0;
    cartItemsEl.hidden = cart.length === 0;
    cartSubEl.textContent = money(sub);
    feeLabelEl.textContent = fulfillment === "delivery" ? "Delivery Fee" : "Pickup Fee";
    cartFeeEl.textContent = money(fee);
    cartTotalEl.textContent = money(grandTotal);
    placeOrderBtn.disabled = cart.length === 0;

    floatingBag.hidden = cart.length === 0;
    floatingBagCount.textContent = String(totalUnits);
    floatingBagTotal.textContent = money(grandTotal);
  }

  function addItem(id, name, price, image) {
    var existing = cart.find(function (i) { return i.id === id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: price, image: image, qty: 1 });
    }
    renderCart();
    openDrawer();
    showToast(name + " added to your SpiceRoute order.");
  }

  function updateQty(id, nextQty) {
    var idx = cart.findIndex(function (i) { return i.id === id; });
    if (idx === -1) return;
    if (nextQty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = nextQty;
    renderCart();
  }

  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      addItem(
        btn.getAttribute("data-id"),
        btn.getAttribute("data-name"),
        parseFloat(btn.getAttribute("data-price")),
        btn.getAttribute("data-image")
      );
    });
  });

  document.querySelectorAll(".fulfillment-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fulfillment = btn.getAttribute("data-mode");
      document.querySelectorAll(".fulfillment-btn").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      renderCart();
    });
  });

  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawerScrim) drawerScrim.addEventListener("click", closeDrawer);
  if (floatingBag) floatingBag.addEventListener("click", openDrawer);
  if (openBagFooter) openBagFooter.addEventListener("click", openDrawer);
  if (browseFromCart) browseFromCart.addEventListener("click", closeDrawer);

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      cart = [];
      renderCart();
      showToast("Your order bag has been cleared.");
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", function () {
      var orderNum = "SR-" + Math.floor(1000 + Math.random() * 9000);
      var total = cartTotalEl.textContent;
      cart = [];
      renderCart();
      closeDrawer();
      showToast("Order #" + orderNum + " confirmed (" + total + "). Kitchen is firing your plates!");
    });
  }

  /* ---- Table Reservation Form ---- */
  var reserveDate = document.getElementById("reserveDate");
  if (reserveDate) {
    var today = new Date().toISOString().split("T")[0];
    reserveDate.value = today;
    reserveDate.min = today;
  }

  var reserveForm = document.getElementById("reserveForm");
  var reserveStatus = document.getElementById("reserveStatus");
  if (reserveForm && reserveStatus) {
    reserveForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!reserveForm.checkValidity()) {
        reserveForm.reportValidity();
        return;
      }
      var data = new FormData(reserveForm);
      var ref = "SR-" + Math.floor(2000 + Math.random() * 7999);
      reserveStatus.textContent = "Reservation #" + ref + " confirmed for " +
        data.get("name") + " (" + data.get("guests") + " guests) on " +
        data.get("date") + " at " + data.get("time") + ".";
      reserveStatus.hidden = false;
      reserveForm.reset();
      if (reserveDate) reserveDate.value = new Date().toISOString().split("T")[0];
      showToast("Table confirmed at SpiceRoute!");
    });
  }

  /* ---- Footer Quick Contact Form ---- */
  var footerForm = document.getElementById("footerForm");
  var footerFormMsg = document.getElementById("footerFormMsg");
  if (footerForm && footerFormMsg) {
    footerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!footerForm.checkValidity()) {
        footerForm.reportValidity();
        return;
      }
      footerFormMsg.textContent = "Thank you! Our SpiceRoute hospitality team has received your note.";
      footerFormMsg.hidden = false;
      footerForm.reset();
    });
  }

  /* ---- Blog Reader Modal ---- */
  var blogPosts = [
    {
      cat: "Beverages & Pairings",
      title: "Refreshing Drinks That Complete Your Meal Experience",
      img: "src/assets/images/menu_chai_desserts_1795719582707.jpg",
      body: "From chilled Alphonso mango lassi infused with saffron threads to briskly simmered ginger kadak chai, balanced drinks cut through rich spices and elevate every course at SpiceRoute."
    },
    {
      cat: "Food & Recipes",
      title: "5 Spice Blends That Will Transform Your Home Cooking",
      img: "src/assets/images/menu_butter_chicken_1795719581489.jpg",
      body: "Toasting whole green cardamom, Kashmiri chilli, cumin seed, and dried fenugreek leaves before grinding releases essential oils that give SpiceRoute curries their layered depth."
    },
    {
      cat: "Dining Experience",
      title: "Healthy Yet Delicious: Charcoal Dishes You'll Love",
      img: "src/assets/images/about_spiceroute_kitchen_1795719582010.jpg",
      body: "High-heat clay tandoor searing locks in natural moisture using yoghurt-herb marinades and minimal oil—delivering bold smoky character without heavy richness."
    },
    {
      cat: "Health & Tradition",
      title: "Why Shared Feasting Means More Than Just Food",
      img: "src/assets/images/menu_saffron_feast_1795719583308.jpg",
      body: "At SpiceRoute, dishes arrive at the center of the table so guests can pair curries, warm blistered naan, fragrant saffron rice, and bright chutneys together."
    }
  ];

  var blogModal = document.getElementById("blogModal");
  var blogModalScrim = document.getElementById("blogModalScrim");
  var blogModalClose = document.getElementById("blogModalClose");
  var blogModalCat = document.getElementById("blogModalCat");
  var blogModalTitle = document.getElementById("blogModalTitle");
  var blogModalImg = document.getElementById("blogModalImg");
  var blogModalBody = document.getElementById("blogModalBody");

  function openBlog(idx) {
    var post = blogPosts[idx];
    if (!post) return;
    blogModalCat.textContent = post.cat;
    blogModalTitle.textContent = post.title;
    blogModalImg.src = post.img;
    blogModalImg.alt = post.title;
    blogModalBody.textContent = post.body;
    blogModal.hidden = false;
    blogModalScrim.hidden = false;
    blogModalClose.focus();
  }

  function closeBlog() {
    blogModal.hidden = true;
    blogModalScrim.hidden = true;
  }

  document.querySelectorAll(".read-blog").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openBlog(parseInt(btn.getAttribute("data-post"), 10));
    });
  });

  if (blogModalClose) blogModalClose.addEventListener("click", closeBlog);
  if (blogModalScrim) blogModalScrim.addEventListener("click", closeBlog);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (cartDrawer.classList.contains("is-open")) closeDrawer();
      if (!blogModal.hidden) closeBlog();
    }
  });

  renderCart();
})();
