const data = {
  restaurant: {
    name: "La Tortilla de Oro",
    tagline: "Casa especializada en tortilla de patata, servida jugosa y al momento",
    location: "Lavapies, Madrid",
    hours: "12:00-23:00",
    phone: "+34 91 000 111",
    currency: "EUR"
  },
  allergens: [
    {
      id: "huevos",
      name: "Huevos",
      icon: "images/alergenos/huevos.svg"
    },
    {
      id: "lacteos",
      name: "Lacteos",
      icon: "images/alergenos/lacteos.svg"
    },
    {
      id: "gluten",
      name: "Gluten",
      icon: "images/alergenos/gluten.svg"
    },
    {
      id: "mostaza",
      name: "Mostaza",
      icon: "images/alergenos/mostaza.svg"
    }
  ],
  categories: [
    {
      id: "tortillas",
      name: "Tortillas",
      subtitle: "La protagonista de la casa",
      dishes: [
        {
          id: "clasica",
          name: "Tortilla clasica",
          description: "Patata confitada, huevo campero y punto cremoso. La de siempre, perfecta.",
          price: 6.5,
          image: "images/dishes/tortilla.svg",
          ingredients: ["patata", "huevo", "cebolla", "AOVE"],
          prepTime: 12,
          calories: 420,
          servingSize: "Pincho",
          spiceLevel: "Suave",
          pairing: "Vino blanco joven",
          chefNote: "Recién cuajada para mantener jugosidad",
          dietary: ["sin gluten"],
          allergens: ["huevos"],
          isSignature: true
        },
        {
          id: "cebolla_caramelizada",
          name: "Tortilla con cebolla caramelizada",
          description: "Dulzor natural y textura melosa con cebolla lenta y toque de sal en escamas.",
          price: 7.5,
          image: "images/dishes/tortilla.svg",
          ingredients: ["patata", "huevo", "cebolla caramelizada"],
          prepTime: 14,
          calories: 460,
          servingSize: "Pincho",
          spiceLevel: "Suave",
          pairing: "Vermut rojo",
          chefNote: "Caramelizada a fuego muy lento",
          dietary: ["sin gluten"],
          allergens: ["huevos"],
          isSignature: true
        },
        {
          id: "trufa",
          name: "Tortilla trufada",
          description: "Aroma de trufa negra y aceite infusionado, con centro cremoso.",
          price: 8.5,
          image: "images/dishes/tortilla.svg",
          ingredients: ["patata", "huevo", "trufa", "aceite de trufa"],
          prepTime: 14,
          calories: 470,
          servingSize: "Pincho",
          spiceLevel: "Suave",
          pairing: "Cava brut",
          chefNote: "Acabada con aceite de trufa",
          dietary: ["sin gluten"],
          allergens: ["huevos"],
          isSignature: false
        },
        {
          id: "chorizo",
          name: "Tortilla con chorizo",
          description: "Sabor ahumado y punto especiado con chorizo de pueblo.",
          price: 7.8,
          image: "images/dishes/tortilla.svg",
          ingredients: ["patata", "huevo", "chorizo"],
          prepTime: 13,
          calories: 500,
          servingSize: "Pincho",
          spiceLevel: "Medio",
          pairing: "Rioja joven",
          chefNote: "Chorizo ligeramente picante",
          dietary: ["sin gluten"],
          allergens: ["huevos"],
          isSignature: false
        }
      ]
    },
    {
      id: "acompanar",
      name: "Para acompanar",
      subtitle: "Bocados para redondear",
      dishes: [
        {
          id: "pan_tostado",
          name: "Pan tostado con tomate",
          description: "Tomate rallado y AOVE sobre pan crujiente.",
          price: 3.5,
          image: "images/dishes/embutidos.jpg",
          ingredients: ["pan", "tomate", "AOVE"],
          prepTime: 6,
          calories: 260,
          servingSize: "Racion",
          spiceLevel: "Suave",
          pairing: "Cerveza rubia",
          chefNote: "Pan de masa madre",
          dietary: [],
          allergens: ["gluten"],
          isSignature: false
        },
        {
          id: "pimientos",
          name: "Pimientos de padron",
          description: "Salteados con sal marina y aceite de oliva.",
          price: 5.5,
          image: "images/dishes/padron.jpg",
          ingredients: ["pimientos de padron", "sal marina"],
          prepTime: 8,
          calories: 180,
          servingSize: "Racion",
          spiceLevel: "Variable",
          pairing: "Txakoli",
          chefNote: "Listos en minutos",
          dietary: ["vegano", "sin gluten"],
          allergens: [],
          isSignature: false
        },
        {
          id: "ensaladilla",
          name: "Ensaladilla suave",
          description: "Patata, zanahoria y mayonesa ligera con pepinillos.",
          price: 6,
          image: "images/dishes/escalibada.jpg",
          ingredients: ["patata", "zanahoria", "mayonesa", "pepinillos"],
          prepTime: 10,
          calories: 320,
          servingSize: "Racion",
          spiceLevel: "Suave",
          pairing: "Blanco seco",
          chefNote: "Mayonesa casera",
          dietary: [],
          allergens: ["huevos", "mostaza"],
          isSignature: false
        }
      ]
    }
  ]
};

const formatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: data.restaurant.currency || "EUR"
});

document.getElementById("restaurant-name").textContent = data.restaurant.name;
document.getElementById("restaurant-tagline").textContent = data.restaurant.tagline;

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
const allergenMap = new Map(data.allergens.map(allergen => [allergen.id, allergen]));

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
        ${dish.isSignature ? '<span class="badge">Especialidad</span>' : ""}
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
