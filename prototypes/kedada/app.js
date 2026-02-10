const modal = document.getElementById("dish-modal");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const modalDetails = document.getElementById("modal-details");
const modalAllergens = document.getElementById("modal-allergens");
const modalImage = document.getElementById("modal-image");

const openModal = dish => {
  modalTitle.textContent = dish.name;
  modalPrice.textContent = dish.formattedPrice;
  modalDescription.textContent = dish.description || "";
  modalImage.src = `../../data/${dish.image}`;
  modalImage.alt = dish.name;

  const details = [];
  if (dish.ingredients?.length) {
    details.push({ label: "Ingredientes", value: dish.ingredients.join(", ") });
  }
  if (dish.servingSize) {
    details.push({ label: "Racion", value: dish.servingSize });
  }
  if (dish.prepTime) {
    details.push({ label: "Tiempo", value: `${dish.prepTime} min` });
  }
  if (dish.calories) {
    details.push({ label: "Calorias", value: `${dish.calories} kcal` });
  }
  if (dish.spiceLevel) {
    details.push({ label: "Picante", value: dish.spiceLevel });
  }
  if (dish.pairing) {
    details.push({ label: "Maridaje", value: dish.pairing });
  }
  if (dish.chefNote) {
    details.push({ label: "Nota", value: dish.chefNote });
  }
  if (dish.dietary?.length) {
    details.push({ label: "Dietas", value: dish.dietary.join(" · ") });
  }

  modalDetails.innerHTML = details
    .map(detail => `<div class="detail-row"><span>${detail.label}:</span> ${detail.value}</div>`)
    .join("");

  if (dish.allergenIcons) {
    modalAllergens.innerHTML = dish.allergenIcons;
  } else {
    modalAllergens.innerHTML = "";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

modal.addEventListener("click", event => {
  if (event.target.hasAttribute("data-close")) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

fetch("../../data/menu.json")
  .then(res => res.json())
  .then(data => {
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: data.restaurant.currency || "EUR"
    });

    document.getElementById("restaurant-name").textContent = "La Kedada";
    document.getElementById("restaurant-tagline").textContent =
      "Comida espanola tradicional, guisos al fuego lento.";

    const meta = document.getElementById("restaurant-meta");
    meta.innerHTML = "";
    [
      data.restaurant.location,
      `Horario: ${data.restaurant.hours}`,
      data.restaurant.phone
    ]
      .filter(Boolean)
      .forEach(text => {
        const span = document.createElement("span");
        span.textContent = text;
        meta.appendChild(span);
      });

    const allergenLegend = document.getElementById("allergen-legend");
    const allergenMap = new Map(
      data.allergens.map(allergen => [allergen.id, allergen])
    );

    allergenLegend.innerHTML = "";
    data.allergens.forEach(allergen => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `
        <img src="../../data/${allergen.icon}" alt="${allergen.name}" />
        <span>${allergen.name}</span>
      `;
      allergenLegend.appendChild(item);
    });

    const menuDiv = document.getElementById("menu");
    menuDiv.innerHTML = "";

    data.categories.forEach((cat, catIndex) => {
      const section = document.createElement("section");
      section.className = "category";

      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <h3>${cat.name}</h3>
        <p>${cat.subtitle || ""}</p>
      `;

      const grid = document.createElement("div");
      grid.className = "menu-grid";

      cat.dishes.forEach((dish, dishIndex) => {
        const card = document.createElement("article");
        card.className = "dish-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.style.setProperty("--delay", `${(catIndex + dishIndex) * 0.04}s`);

        const allergenIcons = (dish.allergens || [])
          .map(id => {
            const allergen = allergenMap.get(id);
            if (!allergen) return "";
            return `<img src="../../data/${allergen.icon}" alt="${allergen.name}" />`;
          })
          .join("");

        const hydratedDish = {
          ...dish,
          formattedPrice: formatter.format(dish.price),
          allergenIcons
        };

        card.innerHTML = `
          <img class="dish-photo" src="../../data/${dish.image}" alt="${dish.name}" />
          <div class="dish-info">
            <div class="dish-top">
              <h4>${dish.name}</h4>
              <span class="price">${formatter.format(dish.price)}</span>
            </div>
            <p class="dish-desc">${dish.description || ""}</p>
            <div class="dish-tags">
              ${dish.isSignature ? '<span class="tag">Especialidad</span>' : ""}
              <span class="card-action">Ver detalle</span>
            </div>
          </div>
        `;

        const open = () => openModal(hydratedDish);

        card.addEventListener("click", open);
        card.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });

        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      menuDiv.appendChild(section);
    });
  });
