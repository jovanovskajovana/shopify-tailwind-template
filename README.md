# Shopify Tailwind Template

A clean Shopify theme template built with Tailwind CSS, based on [Shopify's Dawn theme](https://github.com/Shopify/dawn). This template provides all of Dawn's features and functionality while using Tailwind CSS for styling, giving you a modern development workflow with utility classes.

## Features

- **Tailwind CSS** - Utility-first CSS framework
- **Animations** - GSAP and Lenis bundled via Vite
- **AJAX Cart** - Cart drawer with real-time updates
- **Quick Add to Cart** - Quick view modal for products
- **Product Variants** - Dynamic variant selection
- **Modern JavaScript** - ES6+ with custom elements (Web Components)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) (`npm install -g @shopify/cli`)
- A Shopify store — create a free [Shopify Partners](https://partners.shopify.com/) development store if you don't have one

## Getting Started

#### `develop`

Clone the repository, navigate to the root folder, and install the dependencies:

```
yarn
```

To start the development mode available at http://localhost:8000 run:

```
yarn dev
```

On first run, the Shopify CLI will prompt you to authenticate and select your store.

#### `build`

To build the production-ready Tailwind CSS, run:

```
yarn build
```

#### `prettier`

To format the code, run:

```
yarn prettier
```

#### `pull`

To pull the latest changes from the Shopify's schema, run:

```
yarn pull
```

#### `push`

To push the changes to the Shopify store, run:

```
yarn push
```

#### `check`

To check the theme for any errors, run:

```
yarn check
```

---

## Project Structure

```
├── assets/           # Compiled CSS, JS, and static assets
├── config/           # Theme settings and configuration
├── layout/           # Main layout files
├── locales/          # Translation files
├── sections/         # Theme sections
├── snippets/         # Reusable code snippets
├── templates/        # Page templates
└── src/
    ├── js/           # JavaScript source bundled by Vite
    │   └── main.js   # Animation entry point (GSAP, Lenis)
    └── styles/       # Tailwind CSS source files
        └── theme.css # Main Tailwind input file
```

## Tailwind CSS

This theme uses Tailwind CSS for styling. The source file is located at:

```
src/styles/theme.css
```

It compiles to:

```
assets/theme.css
```

Custom styles can be added using Tailwind's `@layer` directives in `src/styles/theme.css`.

Tailwind configuration is in `tailwind.config.js` with custom breakpoints and content paths for Shopify Liquid files.

## Animations

JavaScript animation libraries are bundled with [Vite](https://vitejs.dev/):

- **[GSAP](https://gsap.com/)** (with `ScrollTrigger`) - timeline and scroll-driven animations
- **[Lenis](https://lenis.darkroom.engineering/)** - smooth scrolling

The entry point is `src/js/main.js`, which initializes Lenis and syncs it with GSAP's `ScrollTrigger`. It compiles to `assets/main.js` and is loaded first in `layout/theme.liquid`. `gsap`, `ScrollTrigger`, and `lenis` are exposed on `window` for use in sections and snippets.

Vite runs automatically with `yarn dev` (watch mode) and `yarn build` (minified), alongside the Tailwind compile step.

## Key Components

### Cart Drawer

- AJAX cart updates
- Real-time item count
- Smooth animations
- Accessible focus management

### Product Form

- Dynamic variant selection
- Quantity management
- Error handling
- Loading states

### Quick Add Modal

- Fast product preview
- Add to cart without leaving page
- Modal dialog with focus trapping
