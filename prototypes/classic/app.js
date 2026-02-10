fetch("../../data/menu.json")
  .then(res => res.json())
  .then(data => {
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: data.restaurant.currency || "EUR"
    });

    document.getElementById("restaurant-name").textContent =
      data.restaurant.name;
    document.getElementById("restaurant-tagline").textContent =
      data.restaurant.tagline;

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

    data.categories.forEach(cat => {
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

      cat.dishes.forEach(dish => {
        const card = document.createElement("article");
        card.className = "dish-card";

        const allergenIcons = (dish.allergens || [])
          .map(id => {
            const allergen = allergenMap.get(id);
            if (!allergen) return "";
            return `
              <img src="../../data/${allergen.icon}" alt="${allergen.name}" />
            `;
          })
          .join("");

        card.innerHTML = `
          <img class="dish-photo" src="../../data/${dish.image}" alt="${dish.name}" />
          <div class="dish-content">
            ${dish.isSignature ? '<span class="badge">Signature</span>' : ""}
            <div class="dish-head">
              <h4>${dish.name}</h4>
              <span class="price">${formatter.format(dish.price)}</span>
            </div>
            <p class="dish-description">${dish.description}</p>
            <p class="dish-ingredients"><span>Ingredientes:</span> ${dish.ingredients.join(", ")}</p>
            <div class="dish-meta">
              ${dish.servingSize ? `<span>${dish.servingSize}</span>` : ""}
              ${dish.prepTime ? `<span>${dish.prepTime} min</span>` : ""}
              ${dish.calories ? `<span>${dish.calories} kcal</span>` : ""}
              ${dish.spiceLevel ? `<span>${dish.spiceLevel}</span>` : ""}
            </div>
            ${dish.pairing ? `<p class="dish-pairing">Maridaje: ${dish.pairing}</p>` : ""}
            ${dish.chefNote ? `<p class="dish-note">${dish.chefNote}</p>` : ""}
            ${dish.dietary && dish.dietary.length ? `<p class="dish-diet">${dish.dietary.join(" · ")}</p>` : ""}
            ${allergenIcons ? `<div class="allergen-icons">${allergenIcons}</div>` : ""}
          </div>
        `;

        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      menuDiv.appendChild(section);
    });
  });
