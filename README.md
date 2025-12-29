# Shopify Tailwind Template

A clean Shopify theme template built with Tailwind CSS, based on [Shopify's Dawn theme](https://github.com/Shopify/dawn). This template provides all of Dawn's features and functionality while using Tailwind CSS for styling, giving you a modern development workflow with utility classes.

## Features

- **Tailwind CSS** - Utility-first CSS framework
- **AJAX Cart** - Cart drawer with real-time updates
- **Quick Add to Cart** - Quick view modal for products
- **Product Variants** - Dynamic variant selection
- **Modern JavaScript** - ES6+ with custom elements (Web Components)

#### `develop`

After cloning the repository, navigate to the root folder and install the dependencies:

```
yarn
```

To start the development mode available at http://localhost:8000 run:

```
yarn dev
```

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
