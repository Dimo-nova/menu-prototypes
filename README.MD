# Menu Prototypes

This workspace contains lightweight HTML/CSS/JS prototypes for a digital restaurant menu. It is intended for rapid visual exploration and mock data.

## Project structure

- data/menu.json: mock menu data (restaurant info, allergens, categories, dishes)
- data/images/dishes: dish images referenced by menu.json
- data/images/alergenos: allergen icons referenced by menu.json
- prototypes/classic: light, editorial-themed prototype
- prototypes/dark: dark, atmospheric prototype

## Data model notes

- menu.json is the source of truth for everything rendered in prototypes.
- Each dish can include:
  - description, ingredients, prepTime, calories
  - servingSize, spiceLevel, pairing, chefNote, dietary
  - allergens: array of allergen ids
  - image: relative path under images/dishes
- allergens are defined in menu.json with id, name, and icon.

## Rendering behavior

- Both prototypes read data/menu.json with fetch and render a full card per dish.
- If a dish has allergens, its card shows the matching allergen icons.
- A legend shows all allergen icons and names.

## Design intent

- Classic: warm, paper-like, editorial look.
- Dark: moody, high-contrast, night menu vibe.
- Keep layouts simple, eye-catching, and not overwhelming.

## Guidance for future changes

- Always keep data/images and menu.json in sync.
- Any new dish image should be added to menu.json with matching metadata.
- Make changes mobile-first and verify small-screen layout first.
