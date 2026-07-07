// src/data/menuData.js
//
// Single source of truth for the menu. The <Menu /> component (home page)
// and the <MenuPicker /> component (/order page) both map over this array —
// no dish is ever hardcoded into a UI file. To add, remove, or reprice an
// item, edit only this file.
//
// `price` is a plain number (USD) so the cart can do arithmetic on it
// directly. Use `formatCurrency()` from `src/utils/format.js` to display it.

export const menuData = [
  {
    id: 'starters',
    label: 'Signature Starters',
    description:
      'Small plates that open the table — built for sharing, the Ubuntu way.',
    items: [
      {
        id: 'suya-skewers',
        name: 'Suya-Spiced Beef Skewers',
        description:
          'Char-grilled beef in a smoked peanut and chili spice crust, served with pickled onion.',
        price: 14,
        tags: ['Signature', 'Spiced'],
      },
      {
        id: 'akara',
        name: 'Akara Fritters',
        description:
          'Black-eyed pea fritters, whipped scotch bonnet butter, micro coriander.',
        price: 11,
        tags: ['Vegetarian'],
      },
      {
        id: 'chapman-oysters',
        name: 'Bissap-Cured Oysters',
        description:
          'Hibiscus and ginger cured oysters on the half shell, citrus mignonette.',
        price: 16,
        tags: ['Chef\u2019s Pick'],
      },
      {
        id: 'samosa-trio',
        name: 'East African Samosa Trio',
        description:
          'Spiced lentil, minced lamb, and peri-peri chicken samosas, tamarind dip.',
        price: 13,
        tags: [],
      },
    ],
  },
  {
    id: 'mains',
    label: 'Main Courses',
    description:
      'The heart of the table — recipes carried across generations, plated for tonight.',
    items: [
      {
        id: 'jollof-suya',
        name: 'Smoked Jollof Rice with Grilled Suya',
        description:
          'Slow-smoked tomato jollof, char-grilled suya-spiced sirloin, crisp plantain.',
        price: 28,
        tags: ['Signature'],
      },
      {
        id: 'lamb-tagine',
        name: 'North African Lamb Tagine',
        description:
          'Braised lamb shoulder, apricot, preserved lemon, and toasted almonds, served with couscous.',
        price: 32,
        tags: ['Slow-Braised'],
      },
      {
        id: 'bobotie',
        name: 'South African Bobotie',
        description:
          'Spiced minced beef bake with a golden egg custard top, turmeric rice, chutney.',
        price: 26,
        tags: ['Chef\u2019s Pick'],
      },
      {
        id: 'injera-platter',
        name: 'Ethiopian Injera Platter',
        description:
          'Sourdough injera with doro wat, misir wat, and gomen, served family-style.',
        price: 30,
        tags: ['Shareable', 'Vegetarian Option'],
      },
      {
        id: 'peri-peri-tilapia',
        name: 'Peri-Peri Grilled Tilapia',
        description:
          'Whole grilled tilapia, peri-peri glaze, charred corn, coconut rice.',
        price: 27,
        tags: [],
      },
    ],
  },
  {
    id: 'drinks',
    label: 'Artisan Drinks',
    description:
      'From the hibiscus fields of West Africa to the highlands of Kenya.',
    items: [
      {
        id: 'bissap',
        name: 'West African Bissap',
        description:
          'Hibiscus, ginger, and clove infusion, served chilled over hand-cut ice.',
        price: 8,
        tags: ['Signature', 'Non-Alcoholic'],
      },
      {
        id: 'kenyan-espresso',
        name: 'Kenyan AA Espresso',
        description:
          'Single-origin Kenyan AA beans, bright acidity, notes of blackcurrant.',
        price: 6,
        tags: [],
      },
      {
        id: 'palm-wine-cocktail',
        name: 'Palm Wine Old Fashioned',
        description:
          'Fermented palm wine, aged rum, bitters, orange peel.',
        price: 15,
        tags: ['Cocktail'],
      },
      {
        id: 'rooibos-toddy',
        name: 'Rooibos & Amarula Toddy',
        description:
          'Red bush tea, Amarula cream liqueur, warm spice, served hot.',
        price: 13,
        tags: ['Cocktail'],
      },
    ],
  },
];
