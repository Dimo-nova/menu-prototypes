# Menu Prototypes

This workspace contains lightweight HTML/CSS/JS prototypes for a digital restaurant menu. It is intended for rapid visual exploration and mock data.

## Project structure

- data/menu.json: mock menu data (restaurant info, allergens, categories, dishes)
- data/images/dishes: dish images referenced by menu.json
- data/images/alergenos: allergen icons referenced by menu.json
- prototypes/[prototype]: all the prototypes included in the project, each having html, css and javascript file

## Data model notes

- menu.json is the source of truth for everything rendered in prototypes.
- Each dish can include:
  - description, ingredients, prepTime, calories
  - servingSize, spiceLevel, pairing, chefNote, dietary
  - allergens: array of allergen ids
  - image: relative path under images/dishes
- allergens are defined in menu.json with id, name, and icon.

Don't need to include all of this data, keep it simple and personalize for each restaurant

## Rendering behavior

- Both prototypes read data/menu.json with fetch and render a full card per dish.
- If a dish has allergens, its card shows the matching allergen icons.

## Design intent

- The copy is always in spanish
- Keep layouts simple, eye-catching, and not overwhelming.
- Include a section for highlighted dishes, like a hero slider
- Use badges in some dishes to show interesting/highlighted data of the dish
- Inlcude a button to reserve a place in the restaurant
- Include a top menu to navigate through the menu
- Provide feedback on interesting features for special restaurants (for example, if its a chess restaurant including a puzzle before loading the menu), be creative

## Guidance for future changes

- Always keep data/images and menu.json in sync.
- Any new dish image should be added to menu.json with matching metadata.
- Make changes mobile-first and verify small-screen layout first.
