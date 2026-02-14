let data = {
  sliders: [],
  categories: [],
  dishes: [],
  allergens: [],
  flavorCatalog: [],
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
  "copas de helado": "fa-ice-cream",
  tarrinas: "fa-ice-cream",
  "batidos y granizados": "fa-blender",
  "meriendas y desayunos": "fa-mug-saucer",
  "Batidos": "fa-blender",
  "Granizados": "fa-water",
};

const state = {
  currentSlide: 0,
  sliderTimer: null,
  celiacFilter: false,
  scrollHandler: null,
  activeCategoryId: "",
  selectedCategoryId: "",
};

const dom = {
  categoryNav: document.getElementById("categoryNav"),
  menuSections: document.getElementById("menuSections"),
  heroSlider: document.getElementById("heroSlider"),
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
  flavorButton: document.getElementById("flavorButton"),
  flavorModalOverlay: document.getElementById("flavorModalOverlay"),
  flavorModalBody: document.getElementById("flavorModalBody"),
  flavorModalClose: document.getElementById("flavorModalClose"),
  landingOptions: document.getElementById("landingOptions"),
  menuView: document.getElementById("menuView"),
  backToLanding: document.getElementById("backToLanding"),
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

const renderAllergenIcons = (allergens, container) => {
  const list = Array.isArray(allergens) ? allergens : parseAllergens(allergens);
  if (!list.length) return;
  list.forEach((allergen) => {
    const imagePath = normalizedAllergenImageMap[normalizeLabel(allergen)];
    if (!imagePath) return;
    const icon = document.createElement("img");
    icon.src = imagePath;
    icon.alt = allergen;
    icon.className = "allergen-icon";
    icon.title = allergen;
    container.appendChild(icon);
  });
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

  const flavorCatalog = (raw.flavorCatalog || []).map((group) => ({
    title: group.title,
    items: (group.items || []).map((item) => ({
      name: item.name,
      allergens: (item.allergens || [])
        .map((id) => allergenNameById.get(id))
        .filter(Boolean),
    })),
  }));

  return {
    sliders: [
      {
        id: "slide-helados",
        tag: "Helados",
        title: "Tarrinas artesanas",
        description: "Sabores intensos y combinaciones especiales.",
        imageUrl: "../../data/images/dishes/helados/helado-ecologico.jpg",
      },
      {
        id: "slide-batidos",
        tag: "Especialidad",
        title: "Granizado de limón",
        description: "Refrescantes y listo para llevar.",
        imageUrl: "../../data/images/dishes/bebidas/horchata.jpg",
      },
      {
        id: "slide-desayunos",
        tag: "Desayunos",
        title: "Meriendas con bocadillos",
        description: "Opciones sencillas para empezar el dia.",
        imageUrl: "../../data/images/dishes/helados/brownie-amb-gelat.jpg",
      }
    ],
    categories,
    dishes,
    allergens: raw.allergens,
    flavorCatalog,
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
  if (!dom.categoryNav) return;
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

  const allergensWrap = document.createElement("div");
  allergensWrap.className = "card-allergens";
  renderAllergenIcons(dish.allergens, allergensWrap);
  if (allergensWrap.children.length > 0) {
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
    const dishes = dishesByCategory[category.id];

    // Subdivide "batidos_granizados" into two subsections
    if (category.id === "batidos_granizados") {
      // Split into batidos and granizados
      const batidos = dishes.filter((dish) => !dish.id.startsWith("granizado_"));
      const granizados = dishes.filter((dish) => dish.id.startsWith("granizado_"));

      // Create Batidos section
      if (batidos.length > 0) {
        const section = document.createElement("section");
        section.id = `${category.id}_batidos`;

        const header = document.createElement("div");
        header.className = "section-header";
        header.innerHTML = `<h2><i class=\"fa-solid ${getCategoryIcon(
          "Batidos"
        )}\" style=\"color: var(--fuego); margin-right: 10px;\"></i>Batidos</h2>`;

        const list = document.createElement("div");
        list.className = "menu-list";

        batidos.forEach((dish) => {
          list.appendChild(buildDishCard(dish));
        });

        section.appendChild(header);
        section.appendChild(list);
        dom.menuSections.appendChild(section);
      }

      // Create Granizados section
      if (granizados.length > 0) {
        const section = document.createElement("section");
        section.id = `${category.id}_granizados`;

        const header = document.createElement("div");
        header.className = "section-header";
        header.innerHTML = `<h2><i class=\"fa-solid ${getCategoryIcon(
          "Granizados"
        )}\" style=\"color: var(--fuego); margin-right: 10px;\"></i>Granizados</h2>`;

        const list = document.createElement("div");
        list.className = "menu-list";

        granizados.forEach((dish) => {
          list.appendChild(buildDishCard(dish));
        });

        section.appendChild(header);
        section.appendChild(list);
        dom.menuSections.appendChild(section);
      }
    } else {
      // Default behavior for other categories
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

      dishes.forEach((dish) => {
        list.appendChild(buildDishCard(dish));
      });

      section.appendChild(header);
      section.appendChild(list);
      dom.menuSections.appendChild(section);
    }
  });
};

const renderMenu = () => {
  const filteredDishes = getFilteredDishes();
  const dishesByCategory = {};
  const activeCategories = [];

  data.categories.forEach((category) => {
    if (state.selectedCategoryId && category.id !== state.selectedCategoryId) return;
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
  if (dom.categoryNav) {
    setActiveNavOnScroll();
  }
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
      <span class="slide-tag"><i class="fa-solid fa-star"></i> ${slide.tag || data.restaurant?.name || "Heladeria"}</span>
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

const renderFlavorCatalog = () => {
  if (!dom.flavorModalBody) return;
  dom.flavorModalBody.innerHTML = "";

  data.flavorCatalog.forEach((group) => {
    const section = document.createElement("div");
    section.className = "flavor-group";

    const title = document.createElement("h3");
    title.textContent = group.title;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "flavor-grid";

    group.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "flavor-item";

      const name = document.createElement("div");
      name.className = "flavor-name";
      name.textContent = item.name;
      card.appendChild(name);

      const allergens = document.createElement("div");
      allergens.className = "flavor-allergens";
      renderAllergenIcons(item.allergens, allergens);
      if (allergens.children.length === 0) {
        const noAllergen = document.createElement("span");
        noAllergen.className = "detail-text";
        noAllergen.textContent = "Sin alergenos";
        allergens.appendChild(noAllergen);
      }
      card.appendChild(allergens);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    dom.flavorModalBody.appendChild(section);
  });
};

const openFlavorModal = () => {
  if (!dom.flavorModalOverlay) return;
  dom.flavorModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
};

const closeFlavorModal = () => {
  if (!dom.flavorModalOverlay) return;
  dom.flavorModalOverlay.classList.remove("open");
  document.body.style.overflow = "unset";
};

const setMenuView = (showMenu) => {
  if (dom.landingOptions) {
    dom.landingOptions.classList.toggle("is-active", !showMenu);
  }
  if (dom.menuView) {
    dom.menuView.classList.toggle("is-active", showMenu);
  }
  if (dom.backToLanding) {
    dom.backToLanding.classList.toggle("is-hidden", !showMenu);
  }
  window.scrollTo({ top: 0, behavior: "instant" });
};

const selectCategory = (categoryId) => {
  state.selectedCategoryId = categoryId;
  renderMenu();
  setMenuView(true);
};

const resetCategorySelection = () => {
  state.selectedCategoryId = "";
  renderMenu();
  setMenuView(false);
};

const setActiveNavOnScroll = () => {
  if (!dom.categoryNav) return;
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
  renderFlavorCatalog();
  setMenuView(false);

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

  if (dom.flavorButton) {
    dom.flavorButton.addEventListener("click", openFlavorModal);
  }
  if (dom.flavorModalClose) {
    dom.flavorModalClose.addEventListener("click", closeFlavorModal);
  }
  if (dom.flavorModalOverlay) {
    dom.flavorModalOverlay.addEventListener("click", (event) => {
      if (event.target === dom.flavorModalOverlay) {
        closeFlavorModal();
      }
    });
  }

  if (dom.landingOptions) {
    dom.landingOptions.querySelectorAll("[data-category]").forEach((card) => {
      card.addEventListener("click", (event) => {
        event.preventDefault();
        const categoryId = card.dataset.category;
        if (categoryId) {
          selectCategory(categoryId);
          history.replaceState(null, "", `#${categoryId}`);
        }
      });
    });
  }

  if (dom.backToLanding) {
    dom.backToLanding.addEventListener("click", () => {
      resetCategorySelection();
      history.replaceState(null, "", "#");
    });
  }

  if (window.location.hash) {
    const categoryId = window.location.hash.replace("#", "");
    if (categoryId) {
      selectCategory(categoryId);
    }
  }

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
