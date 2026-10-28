// غيّر الرقم إلى رقم واتساب المتجر بصيغة دولية من غير + أو مسافات.
      const WHATSAPP_NUMBER = "201000000000";
      const cart = new Map();
      const $ = (selector, root = document) => root.querySelector(selector);
      const $$ = (selector, root = document) => [
        ...root.querySelectorAll(selector),
      ];
      const money = (value) => `${value.toLocaleString("en-US")} EGP`;

      // Intro قصيرة؛ لا تمنع المستخدم من التصفح بعد انتهائها.
      window.addEventListener("load", () => {
        setTimeout(() => {
          $("#intro").classList.add("hidden");
          document.body.classList.remove("lock");
        }, 850);
      });
      window.addEventListener(
        "scroll",
        () => $("#header").classList.toggle("scrolled", window.scrollY > 20),
        { passive: true },
      );

      // قائمة الموبايل
      $("#menuButton").addEventListener("click", () => {
        const opened = $("#navLinks").classList.toggle("open");
        $("#menuButton").setAttribute("aria-expanded", String(opened));
        $("#menuButton").textContent = opened ? "×" : "☰";
      });
      $$("#navLinks a").forEach((link) =>
        link.addEventListener("click", () => {
          $("#navLinks").classList.remove("open");
          $("#menuButton").setAttribute("aria-expanded", "false");
          $("#menuButton").textContent = "☰";
        }),
      );

      // فلترة المنتجات
      function setFilter(category) {
        $$(".filter").forEach((btn) =>
          btn.classList.toggle("active", btn.dataset.filter === category),
        );
        let visible = 0;
        $$(".product").forEach((card) => {
          const show = category === "all" || card.dataset.category === category;
          card.hidden = !show;
          if (show) visible++;
        });
        if (!visible)
          $("#products").innerHTML =
            '<p class="empty-products">لا توجد منتجات في هذه المجموعة حاليًا.</p>';
      }
      $$(".filter").forEach((btn) =>
        btn.addEventListener("click", () => setFilter(btn.dataset.filter)),
      );
      $$("[data-filter-link]").forEach((link) =>
        link.addEventListener("click", () => {
          const category = link.dataset.filterLink;
          $$(".filter").forEach((btn) =>
            btn.classList.toggle("active", btn.dataset.filter === category),
          );
          $$(".product").forEach(
            (card) =>
              (card.hidden =
                category !== "all" && card.dataset.category !== category),
          );
        }),
      );

      // إضافة وحذف وتغيير كميات السلة
      function getProduct(card) {
        return {
          id: card.dataset.id,
          name: card.dataset.name,
          price: Number(card.dataset.price),
          image: card.dataset.image,
          qty: 1,
        };
      }
      function addProduct(card) {
        const product = getProduct(card);
        if (cart.has(product.id)) cart.get(product.id).qty++;
        else cart.set(product.id, product);
        renderCart();
        showToast("اتضاف المنتج للسلة");
      }
      $$(".add-to-cart").forEach((btn) =>
        btn.addEventListener("click", () =>
          addProduct(btn.closest(".product")),
        ),
      );
      function renderCart() {
        const items = [...cart.values()];
        const count = items.reduce((sum, item) => sum + item.qty, 0);
        const total = items.reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        );
        $("#cartCount").textContent = count;
        $("#cartTitleCount").textContent = `(${count})`;
        $("#cartSubtotal").textContent = money(total);
        if (!items.length) {
          $("#cartItems").innerHTML =
            '<p style="color:#777;font-size:13px">لسه ما أضفتش أي منتجات.</p>';
          return;
        }
        $("#cartItems").innerHTML = items
          .map(
            (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="">
          <div><h3>${escapeHtml(item.name)}</h3><p>${money(item.price)}</p>
            <div class="qty-controls"><button data-qty="-1" data-id="${item.id}" aria-label="تقليل الكمية">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="زيادة الكمية">+</button></div>
            <button class="remove" data-remove="${item.id}">حذف</button>
          </div><strong style="font:600 11px Montserrat,sans-serif">${money(item.price * item.qty)}</strong>
        </div>`,
          )
          .join("");
        $$("[data-qty]", $("#cartItems")).forEach((btn) =>
          btn.addEventListener("click", () => {
            const item = cart.get(btn.dataset.id);
            if (!item) return;
            item.qty += Number(btn.dataset.qty);
            if (item.qty <= 0) cart.delete(item.id);
            renderCart();
          }),
        );
        $$("[data-remove]", $("#cartItems")).forEach((btn) =>
          btn.addEventListener("click", () => {
            cart.delete(btn.dataset.remove);
            renderCart();
          }),
        );
      }
      function escapeHtml(value) {
        return String(value).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
      }
      function openCart() {
        $("#scrim").classList.add("open");
        $("#cartDrawer").classList.add("open");
        $("#cartDrawer").setAttribute("aria-hidden", "false");
        document.body.classList.add("lock");
        $("#closeCart").focus();
      }
      function closeCart() {
        $("#scrim").classList.remove("open");
        $("#cartDrawer").classList.remove("open");
        $("#cartDrawer").setAttribute("aria-hidden", "true");
        document.body.classList.remove("lock");
      }
      $("#openCart").addEventListener("click", openCart);
      $("#closeCart").addEventListener("click", closeCart);
      $("#scrim").addEventListener("click", closeCart);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeCart();
      });

      $("#checkoutBtn").addEventListener("click", () => {
        if (!cart.size) {
          showToast("أضف منتجًا للسلة أولًا");
          return;
        }
        if (WHATSAPP_NUMBER === "201000000000") {
          showToast("غيّر رقم واتساب المتجر داخل الكود أولًا");
          return;
        }
        const items = [...cart.values()];
        const lines = items.map(
          (item) =>
            `• ${item.name} × ${item.qty} = ${money(item.price * item.qty)}`,
        );
        const total = items.reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        );
        const message = `مرحبًا ATHAR، أريد تأكيد الطلب:\n${lines.join("\n")}\nالإجمالي: ${money(total)}\n\nالاسم:\nالعنوان:\nالمقاس/اللون:`;
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener",
        );
      });

      let toastTimer;
      function showToast(message) {
        const toast = $("#toast");
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
      }

      // نموذج البريد تجريبي: لا يرسل بيانات إلى خادم.
      $("#newsletterForm").addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("النموذج تجريبي — اربطه بخدمة بريد قبل النشر.");
        e.target.reset();
      });
      $("#contactLink").addEventListener("click", (e) => {
        e.preventDefault();
        showToast("أضف رابط التواصل أو رقم واتساب الخاص بالمتجر.");
      });

      // ظهور الأقسام عند التمرير
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            }),
          { threshold: 0.12 },
        );
        $$(".reveal").forEach((el) => observer.observe(el));
      } else $$(".reveal").forEach((el) => el.classList.add("visible"));