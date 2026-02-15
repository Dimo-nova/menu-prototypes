let data = {
  sliders: [],
  categories: [],
  dishes: [],
  allergens: [],
  restaurant: null,
};

let allergenImageMap = {};
let normalizedAllergenImageMap = {};

const categoryIconMap = {
  "crepes salados": "fa-bread-slice",
  "empanadas argentinas": "fa-hand-holding-heart",
  "crepes dulces": "fa-cookie-bite",
  "helados ecologicos": "fa-ice-cream",
  "bebidas": "fa-glass-water",
  "para compartir": "fa-people-group",
  "de la huerta": "fa-seedling",
  "del mar": "fa-fish",
  "a la brasa": "fa-fire",
  postres: "fa-ice-cream",
  tostas: "fa-bread-slice",
  embutidos: "fa-bacon",
  entrantes: "fa-utensils",
  ensaladas: "fa-leaf",
  calcots: "fa-fire",
  caracoles: "fa-shrimp",
  "verduras a la brasa": "fa-carrot",
  carnes: "fa-drumstick-bite",
  "vinos y cavas": "fa-wine-bottle",
  cervezas: "fa-beer-mug-empty",
  "otras bebidas": "fa-mug-hot",
  "menu infantil": "fa-child",
  extras: "fa-plus",
  tapas: "fa-utensils",
  raciones: "fa-utensils",
  bocadillos: "fa-bread-slice",
  sopas: "fa-bowl-hot",
  cremas: "fa-bowl-hot",
  pastas: "fa-bowl-rice",
  arroces: "fa-bowl-food",
  pescados: "fa-fish",
  mariscos: "fa-shrimp",
  aves: "fa-dove",
  caza: "fa-crosshairs",
  hamburguesas: "fa-burger",
  pizzas: "fa-pizza-slice",
  paellas: "fa-bowl-food",
  parrilla: "fa-fire",
  asador: "fa-fire",
  vegetariano: "fa-seedling",
  vegano: "fa-leaf",
  "sin gluten": "fa-wheat-awn-circle-exclamation",
  desayunos: "fa-mug-saucer",
  brunch: "fa-mug-saucer",
  aperitivos: "fa-utensils",
  "platos del dia": "fa-star",
  especialidades: "fa-award",
  salsas: "fa-droplet",
  guarniciones: "fa-french-fries",
  quesos: "fa-cheese",
  charcuteria: "fa-bacon",
  helados: "fa-ice-cream",
  dulces: "fa-cookie-bite",
  "cafes y tes": "fa-mug-saucer",
  "bebidas calientes": "fa-mug-hot",
  "bebidas frias": "fa-glass-water",
  cocteles: "fa-martini-glass-citrus",
  licores: "fa-whiskey-glass",
  destilados: "fa-whiskey-glass",
  batidos: "fa-blender",
};

const state = {
  currentSlide: 0,
  sliderTimer: null,
  celiacFilter: false,
  scrollHandler: null,
  activeCategoryId: "",
};

const dom = {
  categoryNav: document.getElementById("categoryNav"),
  menuSections: document.getElementById("menuSections"),
  sliderContainer: document.getElementById("sliderContainer"),
  sliderDots: document.getElementById("sliderDots"),
  sliderPrev: document.getElementById("sliderPrev"),
  sliderNext: document.getElementById("sliderNext"),
  sliderArrows: document.getElementById("sliderArrows"),
  celiacFilter: document.getElementById("celiacFilter"),
  dishModalOverlay: document.getElementById("dishModalOverlay"),
  dishModalContent: document.getElementById("dishModalContent"),
  dishModalMedia: document.getElementById("dishModalMedia"),
  dishModalBody: document.getElementById("dishModalBody"),
  dishModalClose: document.getElementById("dishModalClose"),
  orderPopupOverlay: document.getElementById("orderPopupOverlay"),
  orderPopupClose: document.getElementById("orderPopupClose"),
  orderPopupButton: document.getElementById("orderPopupButton"),
};

const normalizeLabel = (value) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getCategoryIcon = (label) => categoryIconMap[normalizeLabel(label)] || "fa-utensils";

const parseAllergens = (allergens) => {
  if (!allergens) return [];
  return allergens
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return "";
  const priceStr = String(price);
  const match = priceStr.match(/(\d+[.,]?\d*)/);
  if (!match) return priceStr;
  const numStr = match[1].replace(",", ".");
  const num = parseFloat(numStr);
  if (num % 1 !== 0) {
    const formatted = num.toFixed(2).replace(".", ",");
    return priceStr.replace(match[1], formatted);
  }
  return priceStr;
};

const buildAllergenMaps = (allergens) => {
  allergenImageMap = Object.fromEntries(
    allergens.map((allergen) => [allergen.name, `../../data/${allergen.icon}`])
  );
  normalizedAllergenImageMap = Object.fromEntries(
    Object.entries(allergenImageMap).map(([key, value]) => [normalizeLabel(key), value])
  );
};


const mapMenuData = (raw) => {
  const allergenNameById = new Map(
    raw.allergens.map((allergen) => [allergen.id, allergen.name])
  );

  const categories = raw.categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const dishes = raw.categories.flatMap((category) =>
    category.dishes.map((dish) => {
      const allergenNames = (dish.allergens || [])
        .map((id) => allergenNameById.get(id))
        .filter(Boolean);
      const longDesc = [dish.description, dish.chefNote]
        .filter(Boolean)
        .join(" ");

      return {
        id: dish.id,
        categoryId: category.id,
        title: dish.name,
        price: dish.price || "",
        badge: dish.isSignature ? "Destacado" : "",
        shortDesc: dish.description || "",
        longDesc: longDesc || dish.description,
        allergens: allergenNames.join(", "),
        pairing: dish.pairing || "",
        img: dish.image
          ? dish.image.startsWith("http")
            ? dish.image
            : dish.image.startsWith("data/")
              ? `../../${dish.image}`
              : dish.image.startsWith("images/")
                ? dish.image
                : `../../data/${dish.image}`
          : "",
      };
    })
  );

  return {
    sliders: [
      {
        id: "slide-foodtruck",
        tag: "Foodtruck",
        title: "Nuestro foodtruck",
        description: "Crêpes y helados ecológicos hechos al momento.",
        imageUrl: "images/brand/foto-foodtruck.jpg",
      },
      {
        id: "slide-crepe-nutella",
        tag: "Crêpes dulces",
        title: "Crêpe de Nutella",
        description: "Dulce, cremosa y hecha al momento.",
        imageUrl: "../../data/images/dishes/crepes/crepe-nutella.jpg",
      },
      {
        id: "slide-empanada-entrana",
        tag: "Empanadas",
        title: "Empanada Real de Entraña",
        description: "Masa dorada, relleno jugoso y sabor argentino.",
        imageUrl: "../../data/images/dishes/empanadas/empanada-argentina-real-entrana.jpg",
      }
    ],
    categories,
    dishes,
    allergens: raw.allergens,
    restaurant: raw.restaurant,
  };
};

const getFilteredDishes = () => {
  if (!state.celiacFilter) return data.dishes;
  return data.dishes.filter(
    (dish) => !dish.allergens?.toLowerCase().includes("gluten")
  );
};

const buildNav = (activeCategories) => {
  dom.categoryNav.innerHTML = "";
  activeCategories.forEach((category) => {
    const link = document.createElement("a");
    link.href = `#${category.id}`;
    link.className = "nav-pill";
    link.innerHTML = `<i class=\"fa-solid ${getCategoryIcon(category.name)}\"></i> ${category.name}`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById(category.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
    dom.categoryNav.appendChild(link);
  });
};

const buildDishCard = (dish) => {
  const hasImage = Boolean(dish.img);
  const card = document.createElement("div");
  card.className = `dish-card ${!hasImage ? "dish-card-no-image" : ""}`;
  card.addEventListener("click", () => openDishModal(dish));

  if (hasImage) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "card-image-container";

    const img = document.createElement("img");
    img.src = dish.img;
    img.alt = dish.title;
    img.loading = "lazy";
    imageContainer.appendChild(img);

    if (dish.badge) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = dish.badge;
      imageContainer.appendChild(badge);
    }

    card.appendChild(imageContainer);
  }

  const content = document.createElement("div");
  content.className = "card-content";

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("span");
  title.className = "card-title";
  title.textContent = dish.title;

  const price = document.createElement("span");
  price.className = "card-price";
  price.textContent = dish.price || "";

  header.appendChild(title);
  header.appendChild(price);

  const desc = document.createElement("p");
  desc.className = "card-desc-short";
  desc.textContent = dish.shortDesc;

  content.appendChild(header);
  content.appendChild(desc);

  const allergens = parseAllergens(dish.allergens);
  if (allergens.length > 0) {
    const allergensWrap = document.createElement("div");
    allergensWrap.className = "card-allergens";
    allergens.forEach((allergen) => {
      const imagePath = normalizedAllergenImageMap[normalizeLabel(allergen)];
      if (!imagePath) return;
      const icon = document.createElement("img");
      icon.src = imagePath;
      icon.alt = allergen;
      icon.className = "allergen-icon";
      icon.title = allergen;
      allergensWrap.appendChild(icon);
    });
    content.appendChild(allergensWrap);
  }

  if (!hasImage && dish.badge) {
    const badgeInline = document.createElement("span");
    badgeInline.className = "badge-inline";
    badgeInline.textContent = dish.badge;
    content.appendChild(badgeInline);
  }

  card.appendChild(content);

  const arrow = document.createElement("i");
  arrow.className = "fa-solid fa-chevron-right card-arrow";
  card.appendChild(arrow);

  return card;
};

const buildSections = (activeCategories, dishesByCategory) => {
  dom.menuSections.innerHTML = "";
  activeCategories.forEach((category) => {
    const section = document.createElement("section");
    section.id = category.id;

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `<h2><i class=\"fa-solid ${getCategoryIcon(
      category.name
    )}\" style=\"color: var(--fuego); margin-right: 10px;\"></i>${
      category.name
    }</h2>`;

    const list = document.createElement("div");
    list.className = "menu-list";

    dishesByCategory[category.id].forEach((dish) => {
      list.appendChild(buildDishCard(dish));
    });

    section.appendChild(header);
    section.appendChild(list);
    dom.menuSections.appendChild(section);
  });
};

const renderMenu = () => {
  const filteredDishes = getFilteredDishes();
  const dishesByCategory = {};
  const activeCategories = [];

  data.categories.forEach((category) => {
    const categoryDishes = filteredDishes.filter(
      (dish) => dish.categoryId === category.id
    );
    dishesByCategory[category.id] = categoryDishes;
    if (categoryDishes.length > 0) {
      activeCategories.push(category);
    }
  });

  buildNav(activeCategories);
  buildSections(activeCategories, dishesByCategory);
  setActiveNavOnScroll();
};

const renderSlider = () => {
  const totalSlides = data.sliders.length;
  dom.sliderContainer.innerHTML = "";
  dom.sliderDots.innerHTML = "";

  if (totalSlides === 0) {
    dom.sliderArrows.style.display = "none";
    dom.sliderDots.style.display = "none";
    return;
  }

  dom.sliderContainer.style.width = `${totalSlides * 100}%`;

  data.sliders.forEach((slide, index) => {
    const slideEl = document.createElement("div");
    slideEl.className = "slide";
    slideEl.style.width = `${100 / totalSlides}%`;

    const img = document.createElement("img");
    img.src = slide.imageUrl;
    img.alt = slide.title;
    slideEl.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";
    overlay.innerHTML = `
      <span class="slide-tag"><i class="fa-solid fa-star"></i> ${slide.tag || "Destacado"}</span>
      <h2 class="slide-title">${slide.title}</h2>
      <p class="slide-subtitle">${slide.description}</p>
    `;
    slideEl.appendChild(overlay);

    dom.sliderContainer.appendChild(slideEl);

    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dom.sliderDots.appendChild(dot);
  });

  if (totalSlides > 1) {
    dom.sliderArrows.style.display = "flex";
    dom.sliderDots.style.display = "flex";
  } else {
    dom.sliderArrows.style.display = "none";
    dom.sliderDots.style.display = "none";
  }

  updateSlider();
  startSlider();
};

const updateSlider = () => {
  const totalSlides = data.sliders.length;
  if (totalSlides === 0) return;

  dom.sliderContainer.style.transform = `translateX(-${
    state.currentSlide * (100 / totalSlides)
  }%)`;

  [...dom.sliderDots.children].forEach((dot, index) => {
    dot.classList.toggle("active", index === state.currentSlide);
  });
};

const startSlider = () => {
  stopSlider();
  if (data.sliders.length <= 1) return;
  state.sliderTimer = setInterval(() => {
    state.currentSlide = (state.currentSlide + 1) % data.sliders.length;
    updateSlider();
  }, 10000);
};

const stopSlider = () => {
  if (state.sliderTimer) {
    clearInterval(state.sliderTimer);
    state.sliderTimer = null;
  }
};

const goToSlide = (index) => {
  state.currentSlide = index;
  updateSlider();
  startSlider();
};

const openDishModal = (dish) => {
  dom.dishModalMedia.innerHTML = "";
  dom.dishModalBody.innerHTML = "";
  dom.dishModalContent.classList.remove("modal-content-no-image");

  const hasImage = Boolean(dish.img);
  const hasVideo = Boolean(dish.video);

  if (hasImage || hasVideo) {
    if (hasImage && hasVideo) {
      const slider = document.createElement("div");
      slider.className = "modal-media-slider";

      const imageSlide = document.createElement("div");
      imageSlide.className = "modal-media-slide";
      const img = document.createElement("img");
      img.src = dish.img;
      img.alt = dish.title;
      imageSlide.appendChild(img);

      const videoSlide = document.createElement("div");
      videoSlide.className = "modal-media-slide";
      const video = document.createElement("video");
      video.src = dish.video;
      video.className = "modal-video";
      video.playsInline = true;
      videoSlide.appendChild(video);

      slider.appendChild(imageSlide);
      slider.appendChild(videoSlide);
      dom.dishModalMedia.appendChild(slider);

      const arrows = document.createElement("div");
      arrows.className = "modal-media-arrows";

      const prev = document.createElement("button");
      prev.className = "modal-media-arrow";
      prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

      const next = document.createElement("button");
      next.className = "modal-media-arrow";
      next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

      arrows.appendChild(prev);
      arrows.appendChild(next);
      dom.dishModalMedia.appendChild(arrows);

      const dots = document.createElement("div");
      dots.className = "modal-media-dots";

      const imageDot = document.createElement("button");
      imageDot.className = "modal-media-dot active";
      imageDot.innerHTML = '<i class="fa-solid fa-image"></i>';

      const videoDot = document.createElement("button");
      videoDot.className = "modal-media-dot";
      videoDot.innerHTML = '<i class="fa-solid fa-video"></i>';

      dots.appendChild(imageDot);
      dots.appendChild(videoDot);
      dom.dishModalMedia.appendChild(dots);

      let slideIndex = 0;
      const updateModalSlider = () => {
        slider.style.transform = `translateX(-${slideIndex * 50}%)`;
        imageDot.classList.toggle("active", slideIndex === 0);
        videoDot.classList.toggle("active", slideIndex === 1);
      };

      prev.addEventListener("click", () => {
        slideIndex = slideIndex === 0 ? 1 : 0;
        updateModalSlider();
      });
      next.addEventListener("click", () => {
        slideIndex = slideIndex === 1 ? 0 : 1;
        updateModalSlider();
      });
      imageDot.addEventListener("click", () => {
        slideIndex = 0;
        updateModalSlider();
      });
      videoDot.addEventListener("click", () => {
        slideIndex = 1;
        updateModalSlider();
      });

      const playBtn = document.createElement("button");
      playBtn.className = "video-play-btn modal-video-play-btn";
      playBtn.setAttribute("aria-label", "Reproducir video");
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      playBtn.addEventListener("click", () => video.play());
      videoSlide.appendChild(playBtn);
    } else if (hasImage) {
      const img = document.createElement("img");
      img.src = dish.img;
      img.alt = dish.title;
      dom.dishModalMedia.appendChild(img);
    } else if (hasVideo) {
      const video = document.createElement("video");
      video.src = dish.video;
      video.className = "modal-video";
      video.playsInline = true;
      dom.dishModalMedia.appendChild(video);

      const playBtn = document.createElement("button");
      playBtn.className = "video-play-btn modal-video-play-btn";
      playBtn.setAttribute("aria-label", "Reproducir video");
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      playBtn.addEventListener("click", () => video.play());
      dom.dishModalMedia.appendChild(playBtn);
    }
  } else {
    dom.dishModalContent.classList.add("modal-content-no-image");
  }

  const allergensText = dish.allergens || "Sin alérgenos";

  dom.dishModalBody.innerHTML = `
    <h2 class="modal-title">${dish.title}</h2>
    <span class="modal-price">${dish.price}</span>
    <div class="separator"></div>
    <div class="detail-row">
      <span class="detail-label"><i class="fa-solid fa-utensils"></i> Descripción</span>
      <p class="detail-text">${dish.longDesc}</p>
    </div>
    <div class="detail-row">
      <span class="detail-label"><i class="fa-solid fa-triangle-exclamation"></i> Alérgenos</span>
      <p class="detail-text" style="font-style: italic;">${allergensText}</p>
    </div>
  `;

  dom.dishModalOverlay.classList.add("open");
  dom.dishModalContent.classList.add("open");
  document.body.style.overflow = "hidden";
};

const closeDishModal = () => {
  dom.dishModalOverlay.classList.remove("open");
  dom.dishModalContent.classList.remove("open");
  setTimeout(() => {
    document.body.style.overflow = "unset";
    dom.dishModalMedia.innerHTML = "";
    dom.dishModalBody.innerHTML = "";
  }, 350);
};

const openOrderPopup = () => {
  if (!dom.orderPopupOverlay) return;
  dom.orderPopupOverlay.classList.add("open");
};

const closeOrderPopup = () => {
  if (!dom.orderPopupOverlay) return;
  dom.orderPopupOverlay.classList.remove("open");
};

const setActiveNavOnScroll = () => {
  const links = [...dom.categoryNav.querySelectorAll("a")];
  const sections = [...document.querySelectorAll("section[id]")];
  const centerActiveLink = (activeLink) => {
    if (!activeLink || !dom.categoryNav) return;
    const navRect = dom.categoryNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const currentScroll = dom.categoryNav.scrollLeft;
    const offset = linkRect.left - navRect.left;
    const targetScroll =
      currentScroll + offset - (navRect.width / 2 - linkRect.width / 2);

    dom.categoryNav.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    let current = "";
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 250 && rect.bottom > 150) {
        current = section.getAttribute("id") || "";
      }
    });

    if (!current || current === state.activeCategoryId) return;
    state.activeCategoryId = current;

    let activeLink = null;
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : href;
      const isActive = id === current;
      link.classList.toggle("active", isActive);
      if (isActive) activeLink = link;
    });

    centerActiveLink(activeLink);
  };

  handleScroll();
  if (state.scrollHandler) {
    window.removeEventListener("scroll", state.scrollHandler);
  }
  state.scrollHandler = handleScroll;
  window.addEventListener("scroll", state.scrollHandler);
};

const init = () => {
  renderSlider();
  renderMenu();

  dom.celiacFilter.addEventListener("change", (event) => {
    state.celiacFilter = event.target.checked;
    renderMenu();
  });

  dom.sliderPrev.addEventListener("click", () => {
    state.currentSlide =
      (state.currentSlide - 1 + data.sliders.length) % data.sliders.length;
    dom.sliderPrev.classList.add("clicked");
    setTimeout(() => dom.sliderPrev.classList.remove("clicked"), 500);
    updateSlider();
    startSlider();
  });

  dom.sliderNext.addEventListener("click", () => {
    state.currentSlide = (state.currentSlide + 1) % data.sliders.length;
    dom.sliderNext.classList.add("clicked");
    setTimeout(() => dom.sliderNext.classList.remove("clicked"), 500);
    updateSlider();
    startSlider();
  });

  dom.dishModalClose.addEventListener("click", closeDishModal);
  dom.dishModalOverlay.addEventListener("click", (event) => {
    if (event.target === dom.dishModalOverlay) {
      closeDishModal();
    }
  });

  if (dom.orderPopupClose) {
    dom.orderPopupClose.addEventListener("click", closeOrderPopup);
  }
  if (dom.orderPopupButton) {
    dom.orderPopupButton.addEventListener("click", closeOrderPopup);
  }
  if (dom.orderPopupOverlay) {
    dom.orderPopupOverlay.addEventListener("click", (event) => {
      if (event.target === dom.orderPopupOverlay) {
        closeOrderPopup();
      }
    });
  }

  setTimeout(openOrderPopup, 5000);
};

fetch("menu.json")
  .then((res) => res.json())
  .then((raw) => {
    data = mapMenuData(raw);
    buildAllergenMaps(raw.allergens || []);
    init();
  })
  .catch((error) => {
    console.error("Failed to load menu data", error);
  });
