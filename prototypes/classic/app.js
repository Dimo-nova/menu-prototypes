fetch("../../data/menu.json")
  .then(res => res.json())
  .then(data => {
    document.getElementById("restaurant-name").textContent =
      data.restaurant.name;

    const menuDiv = document.getElementById("menu");

    data.categories.forEach(cat => {
      const section = document.createElement("div");
      section.innerHTML = `<h2>${cat.name}</h2>`;

      cat.dishes.forEach(dish => {
        const item = document.createElement("p");
        item.textContent = `${dish.name} - $${dish.price}`;
        section.appendChild(item);
      });

      menuDiv.appendChild(section);
    });
  });
